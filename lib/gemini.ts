/**
 * Gemini API Integration
 * Handles forensic image analysis with strict validation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  buildForensicVerificationPrompt,
  ForensicAnalysisResult,
  ForensicPromptInput,
} from '@/lib/prompts/verification-prompt';

// Initialize Gemini client (uses GOOGLE_GENERATIVE_AI_API_KEY env var)
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY not set');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

export interface GeminiAnalysisOptions {
  fileName: string;
  fileSize: number;
  imageDimensions: { width: number; height: number };
  metadataSummary?: string;
  ocrText?: string;
  ocrConfidence?: number;
}

/**
 * Analyze image with Gemini for forensic insights
 * Returns null if Gemini is unavailable or analysis fails
 * Never throws - always fails gracefully
 */
export async function analyzeImageWithGemini(
  imageData: Uint8Array,
  mimeType: string,
  options: GeminiAnalysisOptions
): Promise<ForensicAnalysisResult | null> {
  try {
    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.warn('[v0] Gemini API key not configured - using deterministic scoring only');
      return null;
    }

    const client = getGeminiClient();

    // Build prompt
    const promptInput: ForensicPromptInput = {
      fileName: options.fileName,
      fileSize: options.fileSize,
      imageDimensions: options.imageDimensions,
      metadataAvailable: !!options.metadataSummary,
      metadataSummary: options.metadataSummary,
      ocrText: options.ocrText,
      ocrConfidence: options.ocrConfidence,
    };

    const prompt = buildForensicVerificationPrompt(promptInput);

    // Get model and make request
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const response = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(imageData).toString('base64'),
          mimeType: mimeType,
        },
      },
      {
        text: prompt,
      },
    ]);

    const text = response.content.parts[0]?.text;
    if (!text) {
      console.warn('[v0] Gemini returned empty response');
      return null;
    }

    // Parse and validate JSON response
    const result = parseAndValidateGeminiResponse(text);
    if (!result) {
      console.warn('[v0] Gemini response failed validation');
      return null;
    }

    return result;
  } catch (err) {
    console.error('[v0] Gemini analysis error:', err);
    return null; // Fail gracefully - deterministic scoring will handle it
  }
}

/**
 * Parse and validate Gemini JSON response
 * Strict validation to prevent bad data affecting score
 */
function parseAndValidateGeminiResponse(text: string): ForensicAnalysisResult | null {
  try {
    // Try to extract JSON from response (handle markdown code blocks)
    let json = text.trim();

    // Remove markdown code blocks if present
    if (json.startsWith('```json')) {
      json = json.slice(7);
    }
    if (json.startsWith('```')) {
      json = json.slice(3);
    }
    if (json.endsWith('```')) {
      json = json.slice(0, -3);
    }

    json = json.trim();

    // Parse JSON
    const parsed = JSON.parse(json);

    // Validate required fields
    if (
      typeof parsed.overallAssessment !== 'string' ||
      !parsed.visualConsistency ||
      !parsed.metadataConsistency ||
      !parsed.compressionPatterns ||
      typeof parsed.confidence !== 'number'
    ) {
      console.warn('[v0] Gemini response missing required fields');
      return null;
    }

    // Validate nested structure
    if (
      typeof parsed.visualConsistency.score !== 'number' ||
      !Array.isArray(parsed.visualConsistency.findings) ||
      typeof parsed.metadataConsistency.score !== 'number' ||
      !Array.isArray(parsed.metadataConsistency.findings) ||
      typeof parsed.compressionPatterns.score !== 'number' ||
      !Array.isArray(parsed.compressionPatterns.findings)
    ) {
      console.warn('[v0] Gemini response invalid nested structure');
      return null;
    }

    // Validate anomalies array
    if (!Array.isArray(parsed.anomalies)) {
      console.warn('[v0] Gemini response missing anomalies array');
      return null;
    }

    for (const anomaly of parsed.anomalies) {
      if (
        !anomaly.type ||
        !anomaly.severity ||
        !anomaly.description
      ) {
        console.warn('[v0] Gemini response has invalid anomaly');
        return null;
      }
    }

    // Clamp scores to 0-100
    return {
      overallAssessment: parsed.overallAssessment,
      visualConsistency: {
        score: clampScore(parsed.visualConsistency.score),
        assessment: parsed.visualConsistency.assessment || '',
        findings: Array.isArray(parsed.visualConsistency.findings)
          ? parsed.visualConsistency.findings
          : [],
      },
      metadataConsistency: {
        score: clampScore(parsed.metadataConsistency.score),
        assessment: parsed.metadataConsistency.assessment || '',
        findings: Array.isArray(parsed.metadataConsistency.findings)
          ? parsed.metadataConsistency.findings
          : [],
      },
      compressionPatterns: {
        score: clampScore(parsed.compressionPatterns.score),
        assessment: parsed.compressionPatterns.assessment || '',
        findings: Array.isArray(parsed.compressionPatterns.findings)
          ? parsed.compressionPatterns.findings
          : [],
      },
      anomalies: parsed.anomalies.map((a: any) => ({
        type: a.type,
        severity: a.severity,
        description: a.description || '',
      })),
      confidence: clampScore(parsed.confidence),
      explanation: parsed.explanation || '',
    };
  } catch (err) {
    console.error('[v0] Failed to parse Gemini response:', err);
    return null;
  }
}

/**
 * Clamp score to 0-100 range
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
