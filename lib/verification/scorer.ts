/**
 * VerifiedTrust™ Scoring Algorithm
 * Deterministic, never trusts AI alone
 * Adaptive weighting based on evidence availability
 */

import { TrustScore, createTrustScore, VerificationVerdict } from '@/lib/types';
import { ForensicAnalysisResult } from '@/lib/prompts/verification-prompt';
import { CompletenessScore } from '@/lib/verification/completeness';
import { AnalysisSession } from '@/lib/analysis/session';

export interface ScoringComponents {
  metadataIntegrity: number;
  visualConsistency: number;
  ocrConsistency: number;
  evidenceCompleteness: number;
  weights: {
    metadata: number;
    visual: number;
    ocr: number;
    completeness: number;
  };
}

export interface ScoringResult {
  trustScore: TrustScore;
  verdict: VerificationVerdict;
  components: ScoringComponents;
  explanation: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Compute Verification Score
 * Adaptive weighting: metadata-heavy for real photos, AI-heavy for screenshots
 */
export function computeVerificationScore(
  session: AnalysisSession,
  geminiAnalysis: ForensicAnalysisResult | null,
  completenessScore: CompletenessScore
): ScoringResult {
  // Determine if we have real metadata or just screenshot
  const hasMetadata = session.metadata !== null;
  const weights = getAdaptiveWeights(hasMetadata);

  // Score components
  const metadataIntegrity = computeMetadataIntegrity(session);
  const visualConsistency = geminiAnalysis
    ? geminiAnalysis.visualConsistency.score
    : 50;
  const ocrConsistency = computeOCRConsistency(session, geminiAnalysis);

  // Compute weighted score
  const rawScore =
    metadataIntegrity * weights.metadata +
    visualConsistency * weights.visual +
    ocrConsistency * weights.ocr +
    completenessScore.overall * weights.completeness;

  // Clamp to 0-100
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawScore)));
  const trustScore = createTrustScore(clampedScore);

  // Determine verdict from score
  const verdict = scoreToVerdict(clampedScore, hasMetadata, geminiAnalysis);

  // Calculate confidence level
  const confidenceLevel = calculateConfidenceLevel(
    geminiAnalysis,
    completenessScore,
    hasMetadata
  );

  // Build explanation
  const explanation = buildScoreExplanation(
    trustScore,
    verdict,
    {
      metadataIntegrity,
      visualConsistency,
      ocrConsistency,
      evidenceCompleteness: completenessScore.overall,
      weights,
    },
    geminiAnalysis
  );

  return {
    trustScore,
    verdict,
    components: {
      metadataIntegrity,
      visualConsistency,
      ocrConsistency,
      evidenceCompleteness: completenessScore.overall,
      weights,
    },
    explanation,
    confidenceLevel,
  };
}

/**
 * Get adaptive weights based on evidence availability
 * Images with metadata: 40% metadata, 30% visual, 20% OCR, 10% completeness
 * Screenshots only: 0% metadata, 67% visual, 33% OCR, 0% completeness
 */
function getAdaptiveWeights(hasMetadata: boolean): ScoringComponents['weights'] {
  if (hasMetadata) {
    return {
      metadata: 0.40,
      visual: 0.30,
      ocr: 0.20,
      completeness: 0.10,
    };
  } else {
    return {
      metadata: 0.0,
      visual: 0.67,
      ocr: 0.33,
      completeness: 0.0,
    };
  }
}

/**
 * Compute metadata integrity score (0-100)
 * Based on presence, consistency, and coherence of metadata
 */
function computeMetadataIntegrity(session: AnalysisSession): number {
  if (!session.metadata) return 0;

  let score = 50; // Baseline for having metadata

  const meta = session.metadata;

  // Check critical fields
  if (meta.cameraModel) score += 10;
  if (meta.shootingDate) score += 10;
  if (meta.lensModel) score += 5;

  // Check settings coherence
  if (meta.isoSpeed && meta.fNumber && meta.exposureTime) {
    if (isCoherentCameraSettings(meta)) {
      score += 15;
    } else {
      score -= 10; // Incoherent settings suggest tampering
    }
  }

  // GPS coordinates add confidence
  if (meta.gpsCoordinates) score += 5;

  // File format consistency
  if (meta.mimeType === 'image/jpeg' && meta.colorSpace === 'sRGB') {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Check if camera settings are coherent and physically possible
 */
function isCoherentCameraSettings(metadata: any): boolean {
  const iso = metadata.isoSpeed;
  const aperture = metadata.fNumber;
  const shutter = metadata.exposureTime;

  // ISO must be reasonable (typically 50-102400)
  if (iso < 50 || iso > 102400) return false;

  // Aperture must be reasonable (typically 0.7-16)
  if (aperture < 0.5 || aperture > 64) return false;

  // Shutter speed must be reasonable (typically 1/8000 to 30 seconds)
  if (shutter < 0.00001 || shutter > 3600) return false;

  return true;
}

/**
 * Compute OCR consistency score (0-100)
 * High OCR confidence + Gemini agreement = higher score
 */
function computeOCRConsistency(
  session: AnalysisSession,
  geminiAnalysis: ForensicAnalysisResult | null
): number {
  if (!session.ocr || session.ocr.length === 0) {
    return 50; // No OCR = neutral
  }

  // Average OCR confidence
  const avgConfidence = Math.round(
    session.ocr.reduce((sum, o) => sum + o.confidence, 0) / session.ocr.length
  );

  let score = avgConfidence * 0.6; // Base score from OCR confidence

  // If Gemini analysis available, check agreement
  if (geminiAnalysis) {
    // High Gemini visual consistency + high OCR confidence = trust OCR more
    if (
      geminiAnalysis.visualConsistency.score > 75 &&
      avgConfidence > 75
    ) {
      score += 20;
    } else if (
      geminiAnalysis.visualConsistency.score < 50 &&
      avgConfidence < 50
    ) {
      // Both low = somewhat consistent
      score += 5;
    } else if (
      geminiAnalysis.visualConsistency.score > 75 &&
      avgConfidence < 50
    ) {
      // High visual but low OCR confidence = text not reliable
      score -= 15;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Convert score to verdict
 * Deterministic mapping, never leaves this to AI
 */
function scoreToVerdict(
  score: number,
  hasMetadata: boolean,
  geminiAnalysis: ForensicAnalysisResult | null
): VerificationVerdict {
  // Check for critical anomalies that override score
  if (geminiAnalysis?.anomalies?.some(a => a.severity === 'CRITICAL')) {
    return 'MODIFIED';
  }

  // Score thresholds vary based on metadata availability
  if (hasMetadata) {
    if (score >= 80) return 'AUTHENTIC';
    if (score >= 60) return 'INCONCLUSIVE';
    if (score >= 40) return 'MODIFIED';
    return 'MODIFIED';
  } else {
    // Screenshot/no metadata - higher bar for AUTHENTIC
    if (score >= 85) return 'AUTHENTIC';
    if (score >= 65) return 'INCONCLUSIVE';
    return 'MODIFIED';
  }
}

/**
 * Determine confidence level of the score
 */
function calculateConfidenceLevel(
  geminiAnalysis: ForensicAnalysisResult | null,
  completenessScore: CompletenessScore,
  hasMetadata: boolean
): 'HIGH' | 'MEDIUM' | 'LOW' {
  // HIGH confidence: metadata + OCR + high completeness + coherent AI analysis
  if (hasMetadata && completenessScore.overall > 75) {
    if (geminiAnalysis && geminiAnalysis.confidence > 70) {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  // MEDIUM confidence: some evidence
  if (completenessScore.overall > 50) {
    return 'MEDIUM';
  }

  // LOW confidence: minimal evidence
  return 'LOW';
}

/**
 * Build human-readable explanation of score
 */
function buildScoreExplanation(
  trustScore: TrustScore,
  verdict: VerificationVerdict,
  components: any,
  geminiAnalysis: ForensicAnalysisResult | null
): string {
  const parts: string[] = [];

  // Start with verdict
  parts.push(`**Verdict: ${verdict}**`);
  parts.push(`Verification Score: ${trustScore}/100`);

  // Explain scoring components
  parts.push(`\n**Score Breakdown:**`);
  parts.push(`- Metadata Integrity: ${components.metadataIntegrity}%`);
  parts.push(`- Visual Consistency: ${components.visualConsistency}%`);
  parts.push(`- OCR Consistency: ${components.ocrConsistency}%`);
  parts.push(`- Evidence Completeness: ${components.evidenceCompleteness}%`);

  // Explain weighting
  parts.push(`\n**Weighting Applied:**`);
  parts.push(
    `Metadata ${Math.round(components.weights.metadata * 100)}%, ` +
    `Visual ${Math.round(components.weights.visual * 100)}%, ` +
    `OCR ${Math.round(components.weights.ocr * 100)}%, ` +
    `Completeness ${Math.round(components.weights.completeness * 100)}%`
  );

  // Add key findings from Gemini if available
  if (geminiAnalysis) {
    parts.push(`\n**Key Findings:**`);
    if (geminiAnalysis.anomalies.length > 0) {
      parts.push(`Detected ${geminiAnalysis.anomalies.length} anomalies`);
    } else {
      parts.push('No anomalies detected');
    }
  }

  return parts.join('\n');
}
