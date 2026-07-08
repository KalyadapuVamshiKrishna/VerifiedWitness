/**
 * VerifiedTrust™ Verification Engine
 * Orchestrates evidence analysis, AI consultation, and deterministic scoring
 */

import { AnalysisSession } from '@/lib/analysis/session';
import { VerificationReport, TrustScore } from '@/lib/types';
import { analyzeImageWithGemini } from '@/lib/gemini';
import { computeVerificationScore, ScoringResult } from '@/lib/verification/scorer';
import { calculateCompletenessScore } from '@/lib/verification/completeness';
import { ForensicAnalysisResult } from '@/lib/prompts/verification-prompt';

export interface VerificationOptions {
  skipGemini?: boolean;
  onProgress?: (message: string) => void;
}

/**
 * Generate Verification Report from Analysis Session
 * Combines evidence, Gemini insights, and deterministic scoring
 */
export async function generateVerificationReport(
  session: AnalysisSession,
  options: VerificationOptions = {}
): Promise<VerificationReport> {
  const report: VerificationReport = {
    id: `report-${Date.now()}`,
    fileHash: session.sessionHash,
    fileName: session.filename,
    fileSize: session.file.size,
    uploadedAt: session.createdAt,
    analyzedAt: new Date(),
    verdict: 'INCONCLUSIVE',
    trustScore: 50 as TrustScore,
    metadata: session.metadata || null,
    ocrResults: session.ocr,
    aiFindings: [],
    timeline: [],
    metadataHealth: {
      integrity: 0,
      consistency: 0,
      completeness: 0,
      anomalies: [],
    },
    summary: '',
    recommendations: [],
  };

  try {
    // Step 1: Calculate completeness score (deterministic)
    options.onProgress?.('Calculating evidence completeness...');
    const completenessScore = calculateCompletenessScore(session);

    // Step 2: Get Gemini analysis if available and not skipped
    options.onProgress?.('Analyzing image with AI...');
    let geminiAnalysis: ForensicAnalysisResult | null = null;

    if (!options.skipGemini && session.imagePreview?.blob) {
      const blob = session.imagePreview.blob;
      const buffer = await blob.arrayBuffer();
      const imageData = new Uint8Array(buffer);

      geminiAnalysis = await analyzeImageWithGemini(imageData, blob.type, {
        fileName: session.filename,
        fileSize: session.file.size,
        imageDimensions: session.imagePreview.dimensions,
        metadataSummary: session.metadata
          ? formatMetadataSummary(session.metadata)
          : undefined,
        ocrText: session.ocr.map(o => o.fullText).join('\n') || undefined,
        ocrConfidence:
          session.ocr.length > 0
            ? Math.round(
              session.ocr.reduce((sum, o) => sum + o.confidence, 0) / session.ocr.length
            )
            : undefined,
      });
    }

    // Step 3: Compute verification score (deterministic)
    options.onProgress?.('Computing verification score...');
    const scoringResult = computeVerificationScore(
      session,
      geminiAnalysis,
      completenessScore
    );

    // Step 4: Build report with scoring results
    options.onProgress?.('Building verification report...');
    report.trustScore = scoringResult.trustScore;
    report.verdict = scoringResult.verdict;
    report.summary = buildReportSummary(
      scoringResult,
      completenessScore,
      geminiAnalysis
    );

    // Add AI findings from Gemini
    if (geminiAnalysis) {
      report.aiFindings = buildAIFindings(geminiAnalysis);
    }

    // Build evidence timeline
    report.timeline = buildTimeline(session, geminiAnalysis, completenessScore);

    // Calculate metadata health metrics
    report.metadataHealth = calculateMetadataHealth(
      session,
      geminiAnalysis,
      scoringResult
    );

    // Add File Integrity section
    report.fileIntegrity = {
      hash: session.sessionHash,
      hashAlgorithm: 'SHA-256' as const,
      verified: session.sessionHash !== '',
      integrityStatus: session.sessionHash !== '' ? 'VERIFIED' : 'UNVERIFIED',
      generatedAt: new Date(),
    };

    // Add Evidence Quality section
    report.evidenceQuality = {
      overall: completenessScore.overall,
      metadataCompleteness: completenessScore.metadataCompleteness,
      ocrCompleteness: completenessScore.ocrCompleteness,
      imageQualityScore: completenessScore.imageQualityScore,
      deviceCapabilityScore: completenessScore.deviceCapabilityScore,
      explanation: completenessScore.explanation,
      reliability:
        completenessScore.overall > 75
          ? 'HIGH'
          : completenessScore.overall > 50
            ? 'MEDIUM'
            : 'LOW',
    };

    // Generate recommendations
    report.recommendations = generateRecommendations(
      scoringResult,
      geminiAnalysis,
      completenessScore
    );

    options.onProgress?.('Report generation complete');

    return report;
  } catch (err) {
    console.error('[v0] Error generating verification report:', err);
    // Return partial report with error state
    report.summary = `Error generating report: ${err instanceof Error ? err.message : 'Unknown error'}`;
    return report;
  }
}

/**
 * Format metadata into human-readable summary for Gemini
 */
function formatMetadataSummary(metadata: any): string {
  const parts: string[] = [];

  if (metadata.cameraModel) parts.push(`Camera: ${metadata.cameraModel}`);
  if (metadata.lensModel) parts.push(`Lens: ${metadata.lensModel}`);
  if (metadata.shootingDate)
    parts.push(`Shot: ${new Date(metadata.shootingDate).toISOString()}`);

  if (metadata.isoSpeed) parts.push(`ISO: ${metadata.isoSpeed}`);
  if (metadata.fNumber) parts.push(`F/${metadata.fNumber}`);
  if (metadata.exposureTime)
    parts.push(`Shutter: 1/${Math.round(1 / metadata.exposureTime)}s`);
  if (metadata.focalLength) parts.push(`Focal: ${metadata.focalLength}mm`);

  if (metadata.gpsCoordinates) {
    const { latitude, longitude } = metadata.gpsCoordinates;
    parts.push(`GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
  }

  if (metadata.dimensions) {
    const { width, height } = metadata.dimensions;
    parts.push(`Resolution: ${width}x${height}`);
  }

  return parts.join(' | ');
}

/**
 * Build AI findings from Gemini analysis
 */
function buildAIFindings(geminiAnalysis: ForensicAnalysisResult) {
  const findings = [];

  // Add anomalies as findings
  for (const anomaly of geminiAnalysis.anomalies) {
    findings.push({
      id: `anomaly-${Date.now()}-${Math.random()}`,
      type: 'ANOMALY' as const,
      category: anomaly.type,
      severity: anomaly.severity === 'CRITICAL' ? 'CRITICAL' : anomaly.severity === 'HIGH' ? 'HIGH' : anomaly.severity === 'MEDIUM' ? 'MEDIUM' : 'LOW',
      title: anomaly.type.replace(/_/g, ' '),
      description: anomaly.description,
      confidence: geminiAnalysis.confidence,
      evidence: [],
      timestamp: new Date(),
    });
  }

  // Add consistency findings
  if (geminiAnalysis.metadataConsistency.findings.length > 0) {
    findings.push({
      id: `metadata-consistency-${Date.now()}`,
      type: 'CONSISTENCY' as const,
      category: 'METADATA_CONSISTENCY',
      severity: 'MEDIUM' as const,
      title: 'Metadata Consistency',
      description: geminiAnalysis.metadataConsistency.findings.join('; '),
      confidence: geminiAnalysis.confidence,
      evidence: [],
      timestamp: new Date(),
    });
  }

  return findings;
}

/**
 * Build evidence timeline
 */
function buildTimeline(
  session: AnalysisSession,
  geminiAnalysis: ForensicAnalysisResult | null,
  completenessScore: any
) {
  const timeline = [];

  // File received
  timeline.push({
    id: `timeline-1`,
    type: 'METADATA' as const,
    title: 'File Received',
    description: `${session.filename} (${(session.file.size / 1024).toFixed(0)} KB)`,
    status: 'VERIFIED' as const,
    timestamp: session.createdAt,
  });

  // Metadata extracted
  if (session.metadata) {
    timeline.push({
      id: `timeline-2`,
      type: 'METADATA' as const,
      title: 'Evidence Metadata',
      description: `Camera: ${session.metadata.cameraModel}`,
      status: 'VERIFIED' as const,
      timestamp: new Date(session.metadata.shootingDate),
    });
  }

  // OCR completed
  if (session.ocr.length > 0) {
    timeline.push({
      id: `timeline-3`,
      type: 'OCR' as const,
      title: 'Text Evidence',
      description: `${session.ocr.reduce((sum, o) => sum + o.fullText.length, 0)} characters extracted`,
      status: 'VERIFIED' as const,
      timestamp: session.ocr[0]?.timestamp || new Date(),
    });
  }

  // AI Analysis
  if (geminiAnalysis) {
    timeline.push({
      id: `timeline-4`,
      type: 'AI_ANALYSIS' as const,
      title: 'Forensic Analysis',
      description: `${geminiAnalysis.anomalies.length} anomalies detected`,
      status: geminiAnalysis.anomalies.length === 0 ? 'VERIFIED' : 'ANOMALY' as const,
      timestamp: new Date(),
    });
  }

  // Completeness assessment
  timeline.push({
    id: `timeline-5`,
    type: 'TIMELINE' as const,
    title: 'Evidence Quality Assessment',
    description: completenessScore.explanation,
    status: completenessScore.overall > 70 ? 'VERIFIED' : 'INCONCLUSIVE' as const,
    timestamp: new Date(),
  });

  return timeline;
}

/**
 * Calculate metadata health metrics
 */
function calculateMetadataHealth(
  session: AnalysisSession,
  geminiAnalysis: ForensicAnalysisResult | null,
  scoringResult: ScoringResult
) {
  const anomalies: string[] = [];

  if (geminiAnalysis) {
    for (const anomaly of geminiAnalysis.anomalies) {
      anomalies.push(`${anomaly.type}: ${anomaly.description}`);
    }
  }

  return {
    integrity: scoringResult.components.metadataIntegrity,
    consistency: scoringResult.components.visualConsistency,
    completeness: scoringResult.components.evidenceCompleteness,
    anomalies,
  };
}

/**
 * Build report summary
 */
function buildReportSummary(
  scoringResult: ScoringResult,
  completenessScore: any,
  geminiAnalysis: ForensicAnalysisResult | null
): string {
  const parts: string[] = [];

  parts.push(`**Verification Result: ${scoringResult.verdict}**`);
  parts.push(`Score: ${scoringResult.trustScore}/100 (${scoringResult.confidenceLevel} confidence)`);

  if (scoringResult.verdict === 'AUTHENTIC') {
    parts.push(
      'The image shows no signs of manipulation or inconsistency. Evidence integrity is high.'
    );
  } else if (scoringResult.verdict === 'MODIFIED') {
    parts.push(
      'The image shows signs of modification, inconsistency, or manipulation.'
    );
  } else if (scoringResult.verdict === 'INCONCLUSIVE') {
    parts.push(
      'The evidence is insufficient for a definitive verdict. Further analysis recommended.'
    );
  } else {
    parts.push(
      'The image shows degraded evidence quality, limiting verification capability.'
    );
  }

  parts.push(`\n**Evidence Quality: ${getQualityLabel(completenessScore.overall)}/100**`);
  parts.push(completenessScore.explanation);

  if (geminiAnalysis?.anomalies.length > 0) {
    parts.push(`\n**Anomalies Detected: ${geminiAnalysis.anomalies.length}**`);
    for (const anomaly of geminiAnalysis.anomalies.slice(0, 5)) {
      parts.push(`- ${anomaly.type}: ${anomaly.description}`);
    }
  }

  return parts.join('\n');
}

/**
 * Generate recommendations
 */
function generateRecommendations(
  scoringResult: ScoringResult,
  geminiAnalysis: ForensicAnalysisResult | null,
  completenessScore: any
) {
  const recommendations = [];

  if (scoringResult.verdict === 'MODIFIED' || scoringResult.verdict === 'INCONCLUSIVE') {
    recommendations.push({
      id: `rec-1`,
      type: 'VERIFICATION' as const,
      title: 'Request Original File',
      description:
        'Request the original unprocessed image from the source to enable more accurate analysis.',
      priority: 'HIGH' as const,
    });
  }

  if (geminiAnalysis?.anomalies.some(a => a.severity === 'CRITICAL')) {
    recommendations.push({
      id: `rec-2`,
      type: 'CAUTION' as const,
      title: 'Critical Issues Detected',
      description: 'This image contains critical anomalies. Manual review by experts recommended.',
      priority: 'HIGH' as const,
    });
  }

  if (completenessScore.overall < 50) {
    recommendations.push({
      id: `rec-3`,
      type: 'ACTION' as const,
      title: 'Insufficient Evidence',
      description:
        'Evidence quality is low. Consider requesting the original image or additional supporting documentation.',
      priority: 'MEDIUM' as const,
    });
  }

  return recommendations;
}

function getQualityLabel(score: number): string {
  if (score < 40) return 'Poor';
  if (score < 60) return 'Fair';
  if (score < 75) return 'Good';
  if (score < 85) return 'Excellent';
  return 'Outstanding';
}
