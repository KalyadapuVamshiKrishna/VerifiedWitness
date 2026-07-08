/**
 * Mock Verification Report
 * Realistic forensic data for demonstration
 */

import { VerificationReport, createTrustScore } from '@/lib/types';

export const mockVerificationReport: VerificationReport = {
  id: 'VW-2024-0847-A3',
  fileHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  fileName: 'IMG_20240715_143022.jpg',
  fileSize: 3847291,
  uploadedAt: new Date('2024-07-15T14:30:22Z'),
  analyzedAt: new Date('2024-07-15T14:35:48Z'),
  verdict: 'AUTHENTIC',
  trustScore: createTrustScore(94),

  metadata: {
    cameraModel: 'Canon EOS R5',
    lensModel: 'RF 24-105mm F4L IS USM',
    shootingDate: new Date('2024-07-15T10:45:12Z'),
    gpsCoordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    isoSpeed: 400,
    fNumber: 5.6,
    exposureTime: 0.004,
    focalLength: 85,
    flashFired: false,
    orientation: 1,
    colorSpace: 'sRGB',
    fileSize: 3847291,
    mimeType: 'image/jpeg',
    dimensions: {
      width: 5792,
      height: 3888,
    },
    exifHash: 'sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
    rawMetadata: {
      make: 'Canon',
      model: 'Canon EOS R5',
      dateTimeOriginal: '2024:07:15 10:45:12',
      digitalZoomRatio: 1,
      whiteBalance: 'Auto',
      lightSource: 'Daylight',
      meteringMode: 'Evaluative',
      focusMode: 'AI Servo AF',
      afPointSelected: '47-Point Zone',
    },
  },

  ocrResults: [],

  aiFindings: [
    {
      id: 'AI-001',
      type: 'CONSISTENCY',
      category: 'Metadata Integrity',
      severity: 'LOW',
      title: 'Metadata Consistent with Capture Context',
      description: 'EXIF timestamps align with GPS location metadata. No signs of temporal anomalies detected.',
      confidence: 0.98,
      evidence: ['VW-2024-0847-A3'],
      timestamp: new Date('2024-07-15T14:35:22Z'),
    },
    {
      id: 'AI-002',
      type: 'ANOMALY',
      category: 'Compression Analysis',
      severity: 'LOW',
      title: 'Standard JPEG Compression Pattern',
      description: 'Compression artifacts match Canon R5 native encoding. No evidence of re-compression or manipulation detected.',
      confidence: 0.96,
      evidence: ['VW-2024-0847-A3'],
      timestamp: new Date('2024-07-15T14:35:28Z'),
    },
    {
      id: 'AI-003',
      type: 'CONSISTENCY',
      category: 'Optical Analysis',
      severity: 'LOW',
      title: 'Optical Properties Match Camera Profile',
      description: 'Lens distortion, vignetting, and chromatic aberration consistent with RF 24-105mm at 85mm focal length.',
      confidence: 0.94,
      evidence: ['VW-2024-0847-A3'],
      timestamp: new Date('2024-07-15T14:35:35Z'),
    },
  ],

  timeline: [
    {
      id: 'TL-001',
      type: 'METADATA',
      title: 'File Created',
      description: 'EXIF timestamp recorded',
      status: 'VERIFIED',
      timestamp: new Date('2024-07-15T10:45:12Z'),
      details: {
        timezone: 'UTC',
        source: 'Camera Clock',
      },
    },
    {
      id: 'TL-002',
      type: 'METADATA',
      title: 'GPS Location Recorded',
      description: 'Location data: 40.7128°N, 74.0060°W (New York, NY)',
      status: 'VERIFIED',
      timestamp: new Date('2024-07-15T10:45:12Z'),
      details: {
        accuracy: '±5m',
        source: 'Camera GPS Module',
      },
    },
    {
      id: 'TL-003',
      type: 'METADATA',
      title: 'File Written to Storage',
      description: 'Image committed to memory card',
      status: 'VERIFIED',
      timestamp: new Date('2024-07-15T10:45:15Z'),
      details: {
        storage: 'CFast Type B Card',
        writeSpeed: '160 MB/s',
      },
    },
    {
      id: 'TL-004',
      type: 'METADATA',
      title: 'File Uploaded to VerifiedWitness',
      description: 'Ingestion timestamp recorded',
      status: 'VERIFIED',
      timestamp: new Date('2024-07-15T14:30:22Z'),
      details: {
        ipAddress: '192.168.1.100',
        uploadMethod: 'Web Interface',
      },
    },
  ],

  metadataHealth: {
    integrity: 98,
    consistency: 96,
    completeness: 92,
    anomalies: [],
  },

  fileIntegrity: {
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    hashAlgorithm: 'SHA-256' as const,
    verified: true,
    integrityStatus: 'VERIFIED' as const,
    generatedAt: new Date('2024-07-15T14:35:48Z'),
  },

  evidenceQuality: {
    overall: 92,
    metadataCompleteness: 98,
    ocrCompleteness: 0,
    imageQualityScore: 95,
    deviceCapabilityScore: 87,
    explanation: 'Metadata present (consistency: 98%). Image quality: Very High. File integrity: Verified. Device capabilities match claimed specifications.',
    reliability: 'HIGH' as const,
  },

  summary:
    'This image shows high authenticity indicators. The EXIF metadata is complete and consistent with the camera model and shooting conditions. Optical analysis confirms natural lens properties without signs of digital manipulation. Compression patterns are consistent with native Canon R5 encoding. GPS coordinates align with metadata timestamps. No significant anomalies detected during analysis.',

  recommendations: [
    {
      id: 'REC-001',
      type: 'VERIFICATION',
      title: 'Chain of Custody Documentation',
      description: 'Maintain detailed records of file handling and storage to support authenticity claim.',
      priority: 'HIGH',
    },
    {
      id: 'REC-002',
      type: 'ACTION',
      title: 'Cross-Reference with Additional Evidence',
      description: 'Compare with other corroborating evidence from the same incident or timeframe.',
      priority: 'MEDIUM',
    },
    {
      id: 'REC-003',
      type: 'CAUTION',
      title: 'Consider Context',
      description: 'While this image is authentic, always evaluate photographic evidence within broader investigative context.',
      priority: 'MEDIUM',
    },
  ],

  tags: ['investigation', 'evidence', 'high-confidence'],
};

/**
 * Generate a mock report for demonstration purposes
 * Variations to test different verdict types
 */
export function generateMockReport(variant: 'authentic' | 'modified' | 'inconclusive' = 'authentic') {
  const base = { ...mockVerificationReport };

  if (variant === 'modified') {
    return {
      ...base,
      id: 'VW-2024-0848-M1',
      verdict: 'MODIFIED' as const,
      trustScore: createTrustScore(42),
      fileIntegrity: {
        hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z',
        hashAlgorithm: 'SHA-256' as const,
        verified: true,
        integrityStatus: 'VERIFIED' as const,
        generatedAt: new Date('2024-07-15T14:35:48Z'),
      },
      evidenceQuality: {
        overall: 64,
        metadataCompleteness: 72,
        ocrCompleteness: 0,
        imageQualityScore: 68,
        deviceCapabilityScore: 52,
        explanation: 'Metadata inconsistencies detected. Multiple compression generations suggest re-encoding. Image quality degraded. Device capability mismatches indicate potential tampering.',
        reliability: 'MEDIUM' as const,
      },
      summary:
        'This image exhibits signs of digital modification. Analysis detected inconsistencies in compression patterns and evidence of selective editing. The metadata shows signs of tampering.',
      aiFindings: [
        {
          id: 'AI-001',
          type: 'ANOMALY' as const,
          category: 'Compression Analysis',
          severity: 'HIGH' as const,
          title: 'Irregular Compression Artifacts',
          description: 'Detected multiple compression generations, indicating previous encoding cycles.',
          confidence: 0.87,
          evidence: ['VW-2024-0848-M1'],
          timestamp: new Date('2024-07-15T14:35:22Z'),
        },
        {
          id: 'AI-002',
          type: 'ANOMALY' as const,
          category: 'Pixel-Level Analysis',
          severity: 'CRITICAL' as const,
          title: 'Evidence of Content Manipulation',
          description: 'Detected seamless cloning in background area. Clone stamp tool signatures identified.',
          confidence: 0.91,
          evidence: ['VW-2024-0848-M1'],
          timestamp: new Date('2024-07-15T14:35:28Z'),
        },
      ],
    };
  }

  if (variant === 'inconclusive') {
    return {
      ...base,
      id: 'VW-2024-0849-INC',
      verdict: 'INCONCLUSIVE' as const,
      trustScore: createTrustScore(58),
      fileIntegrity: {
        hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b',
        hashAlgorithm: 'SHA-256' as const,
        verified: true,
        integrityStatus: 'VERIFIED' as const,
        generatedAt: new Date('2024-07-15T14:35:48Z'),
      },
      evidenceQuality: {
        overall: 58,
        metadataCompleteness: 72,
        ocrCompleteness: 0,
        imageQualityScore: 65,
        deviceCapabilityScore: 48,
        explanation: 'Metadata present but with inconsistencies (consistency: 64%). Image quality: Medium. Contradictory signals detected. Further analysis recommended.',
        reliability: 'MEDIUM' as const,
      },
      summary:
        'This image contains contradictory authenticity indicators. Some metadata suggests authenticity while compression analysis shows unusual patterns. Additional context or expert review recommended.',
      metadataHealth: {
        integrity: 72,
        consistency: 64,
        completeness: 68,
        anomalies: ['Missing IPTC data', 'GPS timestamp mismatch'],
      },
    };
  }

  return base;
}
