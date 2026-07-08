/**
 * Evidence Completeness Calculator
 * Deterministic scoring based on signal availability
 * Reflects the reliability of evidence, not AI confidence
 */

import { AnalysisSession } from '@/lib/analysis/session';

export interface CompletenessFactors {
  metadataAvailable: boolean;
  metadataConsistency: number; // 0-100
  ocrAvailable: boolean;
  ocrConfidence: number; // 0-100
  imageQuality: number; // 0-100 (based on dimensions, compression)
  fileIntegrity: boolean; // SHA-256 verification
  deviceCapabilities: number; // 0-100 (can we verify device authenticity?)
}

export interface CompletenessScore {
  overall: number; // 0-100
  metadataCompleteness: number;
  ocrCompleteness: number;
  imageQualityScore: number;
  deviceCapabilityScore: number;
  explanation: string;
}

/**
 * Calculate Evidence Completeness (10% of total score)
 * Only considers deterministic, verifiable signals
 */
export function calculateCompletenessScore(
  session: AnalysisSession
): CompletenessScore {
  const factors = extractCompletenessFactors(session);

  // Evidence Completeness = average of available signals
  const signals: number[] = [];

  if (factors.metadataAvailable) {
    signals.push(factors.metadataConsistency);
  }

  if (factors.ocrAvailable) {
    signals.push(factors.ocrConfidence);
  }

  signals.push(factors.imageQuality);
  signals.push(factors.fileIntegrity ? 100 : 50);

  if (factors.metadataAvailable) {
    signals.push(factors.deviceCapabilities);
  }

  const overall = signals.length > 0
    ? Math.round(signals.reduce((a, b) => a + b, 0) / signals.length)
    : 60; // Baseline for minimal evidence

  const explanation = buildCompletenessExplanation(factors);

  return {
    overall,
    metadataCompleteness: factors.metadataAvailable ? factors.metadataConsistency : 0,
    ocrCompleteness: factors.ocrAvailable ? factors.ocrConfidence : 0,
    imageQualityScore: factors.imageQuality,
    deviceCapabilityScore: factors.metadataAvailable ? factors.deviceCapabilities : 0,
    explanation,
  };
}

/**
 * Extract completeness factors from analysis session
 * Uses only deterministic signals
 */
function extractCompletenessFactors(session: AnalysisSession): CompletenessFactors {
  // Metadata availability
  const metadataAvailable = session.metadata !== null;
  const metadataConsistency = metadataAvailable
    ? calculateMetadataConsistency(session.metadata!)
    : 0;

  // OCR availability
  const ocrAvailable = session.ocr !== null && session.ocr.length > 0;
  const ocrConfidence = ocrAvailable
    ? Math.round(session.ocr.reduce((sum, o) => sum + o.confidence, 0) / session.ocr.length)
    : 0;

  // Image quality (based on dimensions)
  const imageQuality = calculateImageQuality(session);

  // File integrity
  const fileIntegrity = session.sessionHash !== '';

  // Device capability verification
  const deviceCapabilities = metadataAvailable
    ? verifyDeviceCapabilities(session.metadata!)
    : 0;

  return {
    metadataAvailable,
    metadataConsistency,
    ocrAvailable,
    ocrConfidence,
    imageQuality,
    fileIntegrity,
    deviceCapabilities,
  };
}

/**
 * Calculate metadata consistency score
 * Based on presence and coherence of key fields
 */
function calculateMetadataConsistency(metadata: any): number {
  let score = 50; // Baseline for having metadata

  // Check for key camera fields
  const cameraFields = [
    metadata.cameraModel,
    metadata.lensModel,
    metadata.shootingDate,
  ].filter(Boolean).length;

  score += cameraFields * 15; // +15 per critical field

  // Check for coherent settings
  if (metadata.isoSpeed && metadata.fNumber && metadata.exposureTime) {
    score += 10; // Settings are coherent
  }

  // Check for GPS data
  if (metadata.gpsCoordinates) {
    score += 5;
  }

  // Check for orientation and color space
  if (metadata.orientation && metadata.colorSpace) {
    score += 5;
  }

  return Math.min(100, score);
}

/**
 * Calculate image quality based on dimensions and characteristics
 */
function calculateImageQuality(session: AnalysisSession): number {
  if (!session.imagePreview?.dimensions) {
    return 50; // Unknown quality
  }

  const { width, height } = session.imagePreview.dimensions;
  const megapixels = (width * height) / 1_000_000;

  let score = 50; // Baseline

  // Megapixel range scoring
  if (megapixels < 0.5) score = 30; // Very low res (likely screenshot)
  else if (megapixels < 2) score = 50; // Low res
  else if (megapixels < 8) score = 75; // Medium res (typical smartphone)
  else if (megapixels < 20) score = 85; // High res
  else score = 95; // Very high res

  // Aspect ratio penalty for unusual dimensions (likely cropped/modified)
  const aspectRatio = width / height;
  if (aspectRatio < 0.5 || aspectRatio > 2) {
    score = Math.max(score - 15, 30);
  }

  return Math.min(100, score);
}

/**
 * Verify that metadata device capabilities match image characteristics
 */
function verifyDeviceCapabilities(metadata: any): number {
  let score = 50; // Baseline

  // Check if claimed camera could produce this image
  if (metadata.cameraModel) {
    // Verify ISO range is plausible
    if (metadata.isoSpeed && metadata.isoSpeed > 0 && metadata.isoSpeed <= 102400) {
      score += 10;
    }

    // Verify aperture is realistic
    if (metadata.fNumber && metadata.fNumber >= 0.5 && metadata.fNumber <= 64) {
      score += 10;
    }

    // Verify shutter speed is realistic
    if (metadata.exposureTime && metadata.exposureTime > 0 && metadata.exposureTime <= 3600) {
      score += 10;
    }

    // Verify focal length is realistic for the claimed lens
    if (metadata.focalLength && metadata.focalLength > 0 && metadata.focalLength <= 2000) {
      score += 10;
    }

    // Verify dimensions match claimed sensor and focal length
    const { width, height } = metadata.dimensions;
    if (width > 0 && height > 0 && width <= 20000 && height <= 20000) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

/**
 * Build human-readable explanation of completeness score
 */
function buildCompletenessExplanation(factors: CompletenessFactors): string {
  const parts: string[] = [];

  if (factors.metadataAvailable) {
    parts.push(
      `Metadata present (consistency: ${factors.metadataConsistency}%)`
    );
  } else {
    parts.push('No camera metadata (screenshot or heavily processed)');
  }

  if (factors.ocrAvailable) {
    parts.push(`Text extracted with ${factors.ocrConfidence}% average confidence`);
  }

  parts.push(`Image quality: ${getQualityLabel(factors.imageQuality)}`);
  parts.push(`File integrity: ${factors.fileIntegrity ? 'Verified' : 'Unable to verify'}`);

  return parts.join('. ');
}

function getQualityLabel(score: number): string {
  if (score < 40) return 'Very Low';
  if (score < 60) return 'Low';
  if (score < 75) return 'Medium';
  if (score < 85) return 'High';
  return 'Very High';
}
