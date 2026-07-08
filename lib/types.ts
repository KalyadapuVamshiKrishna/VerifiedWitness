/**
 * VerifiedWitness Core Types
 * Conforming to TYPES.md specification
 */

// Trust Score Range: 0-100
export type TrustScore = number & { readonly __brand: 'TrustScore' };

export function createTrustScore(value: number): TrustScore {
  const clamped = Math.max(0, Math.min(100, Math.floor(value)));
  return clamped as TrustScore;
}

// Verification Verdict: AUTHENTIC, MODIFIED, INCONCLUSIVE, DEGRADED
export type VerificationVerdict = 'AUTHENTIC' | 'MODIFIED' | 'INCONCLUSIVE' | 'DEGRADED';

// Evidence Item Type
export interface EvidenceItem {
  id: string;
  type: 'METADATA' | 'OCR' | 'AI_ANALYSIS' | 'TIMELINE';
  title: string;
  description: string;
  status: 'VERIFIED' | 'ANOMALY' | 'INCONCLUSIVE';
  timestamp: Date;
  details?: Record<string, unknown>;
}

// Metadata Information
export interface MetadataInfo {
  cameraModel: string;
  lensModel: string;
  shootingDate: Date;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
  isoSpeed: number;
  fNumber: number;
  exposureTime: number;
  focalLength: number;
  flashFired: boolean;
  orientation: number;
  colorSpace: string;
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  exifHash: string;
  rawMetadata: Record<string, unknown>;
}

// OCR Result
export interface OCRResult {
  id: string;
  confidence: number;
  regions: {
    text: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
  fullText: string;
  languages: string[];
  timestamp: Date;
}

// AI Analysis Finding
export interface AIFinding {
  id: string;
  type: 'ANOMALY' | 'CONSISTENCY' | 'CONCERN';
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  confidence: number;
  evidence: string[];
  timestamp: Date;
}

// Recommendation
export interface Recommendation {
  id: string;
  type: 'ACTION' | 'CAUTION' | 'VERIFICATION';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Full Verification Report
export interface VerificationReport {
  id: string;
  fileHash: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  analyzedAt: Date;
  verdict: VerificationVerdict;
  trustScore: TrustScore;
  
  // Evidence Components
  metadata: MetadataInfo | null;
  ocrResults: OCRResult[];
  aiFindings: AIFinding[];
  
  // Timeline & Metadata Health
  timeline: EvidenceItem[];
  metadataHealth: {
    integrity: number;
    consistency: number;
    completeness: number;
    anomalies: string[];
  };
  
  // File Integrity Section
  fileIntegrity: {
    hash: string;
    hashAlgorithm: 'SHA-256';
    verified: boolean;
    integrityStatus: 'VERIFIED' | 'UNVERIFIED';
    generatedAt: Date;
  };
  
  // Evidence Quality Section
  evidenceQuality: {
    overall: number; // 0-100
    metadataCompleteness: number;
    ocrCompleteness: number;
    imageQualityScore: number;
    deviceCapabilityScore: number;
    explanation: string;
    reliability: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  
  // Summary & Recommendations
  summary: string;
  recommendations: Recommendation[];
  
  // Report Metadata
  analyzedBy?: string;
  tags?: string[];
}

// Analysis Request
export interface AnalysisRequest {
  file: File;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
  tags?: string[];
}

// Export Options
export type ExportFormat = 'PDF' | 'JSON' | 'CSV';

export interface ExportOptions {
  format: ExportFormat;
  includeRawMetadata: boolean;
  includeImages: boolean;
}

// Metadata Extraction Result
export interface MetadataResult {
  success: boolean;
  data: MetadataInfo | null;
  error?: string;
  warnings?: string[];
}

// OCR Extraction Result (already defined above as OCRResult)
export type OCRExtractionResult = {
  success: boolean;
  data: OCRResult | null;
  error?: string;
  warnings?: string[];
};
