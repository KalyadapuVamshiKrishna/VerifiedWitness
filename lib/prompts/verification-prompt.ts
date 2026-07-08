/**
 * Forensic Verification Prompt for Gemini
 * Isolated for independent iteration and testing
 */

export interface ForensicPromptInput {
  fileName: string;
  fileSize: number;
  imageDimensions: { width: number; height: number };
  metadataAvailable: boolean;
  metadataSummary?: string;
  ocrText?: string;
  ocrConfidence?: number;
}

export function buildForensicVerificationPrompt(input: ForensicPromptInput): string {
  return `You are a digital forensics expert analyzing image authenticity. Your role is to provide structured observations that inform a deterministic verification score.

CRITICAL: You must respond ONLY with valid JSON matching the exact schema provided. Do not include any text outside the JSON object.

FILE INFORMATION:
- Filename: ${input.fileName}
- File size: ${input.fileSize} bytes
- Dimensions: ${input.imageDimensions.width}x${input.imageDimensions.height} pixels

METADATA STATUS: ${input.metadataAvailable ? 'Available' : 'Not available (screenshot or edited file)'}
${input.metadataSummary ? `METADATA SUMMARY:\n${input.metadataSummary}` : ''}

${input.ocrText ? `EXTRACTED TEXT:\n${input.ocrText}\n(Confidence: ${input.ocrConfidence}%)` : 'NO TEXT EXTRACTED'}

ANALYSIS FRAMEWORK:
Analyze the image for signs of authenticity, modification, or inconsistency. Consider:
1. Metadata Consistency: Do EXIF timestamps, camera model, and settings appear coherent?
2. Visual Consistency: Does the image show signs of manipulation, splicing, or layering?
3. Compression Patterns: Are compression artifacts consistent with the claimed device?
4. Temporal Logic: Do timestamps align with device capabilities?

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "overallAssessment": "Brief summary of authenticity likelihood",
  "visualConsistency": {
    "score": 0-100,
    "assessment": "Is the image visually consistent or show signs of modification?",
    "findings": ["finding1", "finding2"]
  },
  "metadataConsistency": {
    "score": 0-100,
    "assessment": "Are metadata claims consistent with visual evidence?",
    "findings": ["finding1", "finding2"]
  },
  "compressionPatterns": {
    "score": 0-100,
    "assessment": "Are compression artifacts consistent with claimed device/format?",
    "findings": ["finding1", "finding2"]
  },
  "anomalies": [
    {
      "type": "VISUAL_ANOMALY" | "METADATA_ANOMALY" | "TEMPORAL_ANOMALY" | "COMPRESSION_ANOMALY",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "description": "Description of the anomaly"
    }
  ],
  "confidence": 0-100,
  "explanation": "Detailed reasoning for overall assessment"
}

Respond with ONLY the JSON object. No additional text, no markdown code blocks.`;
}

export interface ForensicAnalysisResult {
  overallAssessment: string;
  visualConsistency: {
    score: number;
    assessment: string;
    findings: string[];
  };
  metadataConsistency: {
    score: number;
    assessment: string;
    findings: string[];
  };
  compressionPatterns: {
    score: number;
    assessment: string;
    findings: string[];
  };
  anomalies: Array<{
    type: 'VISUAL_ANOMALY' | 'METADATA_ANOMALY' | 'TEMPORAL_ANOMALY' | 'COMPRESSION_ANOMALY';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
  }>;
  confidence: number;
  explanation: string;
}
