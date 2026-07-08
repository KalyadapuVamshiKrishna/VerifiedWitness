/**
 * Analysis session management
 * Tracks processing state and evidence collection
 */

import { MetadataInfo, OCRResult } from '@/lib/types';

export type ProcessingStage = 'VALIDATING' | 'EXTRACTING_METADATA' | 'EXTRACTING_OCR' | 'READY';

export type ProcessingStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface ProcessingStageStatus {
  stage: ProcessingStage;
  status: ProcessingStatus;
  progress: number;
  error?: string;
  completedAt?: Date;
}

export interface AnalysisSession {
  // Session metadata
  id: string;
  filename: string;
  mimeType: string;
  createdAt: Date;
  
  // File data
  file: File;
  fileHash: string;
  fileSize: number;
  
  // Image preview
  imagePreview: {
    src: string;
    dimensions: { width: number; height: number };
  } | null;
  
  // Processing stages
  stages: {
    validation: ProcessingStageStatus;
    metadata: ProcessingStageStatus;
    ocr: ProcessingStageStatus;
  };
  
  // Extracted evidence
  metadata: MetadataInfo | null;
  ocr: OCRResult | null;
  
  // Errors and warnings
  errors: Array<{ stage: ProcessingStage; message: string }>;
  warnings: Array<{ stage: ProcessingStage; message: string }>;
  
  // Overall status
  overallStatus: 'UPLOADING' | 'VALIDATING' | 'EXTRACTING' | 'READY' | 'ERROR';
}

export function createSession(file: File, fileHash: string): AnalysisSession {
  return {
    id: generateSessionId(),
    filename: file.name,
    mimeType: file.type,
    createdAt: new Date(),
    file,
    fileHash,
    fileSize: file.size,
    imagePreview: null,
    stages: {
      validation: { stage: 'VALIDATING', status: 'PENDING', progress: 0 },
      metadata: { stage: 'EXTRACTING_METADATA', status: 'PENDING', progress: 0 },
      ocr: { stage: 'EXTRACTING_OCR', status: 'PENDING', progress: 0 },
    },
    metadata: null,
    ocr: null,
    errors: [],
    warnings: [],
    overallStatus: 'UPLOADING',
  };
}

export function updateSessionMetadata(
  session: AnalysisSession,
  metadata: MetadataInfo,
  warnings?: string[]
): AnalysisSession {
  const updated = { ...session };
  updated.metadata = metadata;
  updated.stages.metadata = {
    stage: 'EXTRACTING_METADATA',
    status: 'COMPLETED',
    progress: 100,
    completedAt: new Date(),
  };
  
  if (warnings) {
    updated.warnings.push(
      ...warnings.map((w) => ({
        stage: 'EXTRACTING_METADATA' as ProcessingStage,
        message: w,
      }))
    );
  }
  
  updateOverallStatus(updated);
  return updated;
}

export function updateSessionOCR(
  session: AnalysisSession,
  ocr: OCRResult,
  warnings?: string[]
): AnalysisSession {
  const updated = { ...session };
  updated.ocr = ocr;
  updated.stages.ocr = {
    stage: 'EXTRACTING_OCR',
    status: 'COMPLETED',
    progress: 100,
    completedAt: new Date(),
  };
  
  if (warnings) {
    updated.warnings.push(
      ...warnings.map((w) => ({
        stage: 'EXTRACTING_OCR' as ProcessingStage,
        message: w,
      }))
    );
  }
  
  updateOverallStatus(updated);
  return updated;
}

export function updateSessionOCRProgress(
  session: AnalysisSession,
  progress: number
): AnalysisSession {
  return {
    ...session,
    stages: {
      ...session.stages,
      ocr: {
        ...session.stages.ocr,
        status: 'RUNNING',
        progress: Math.min(100, progress),
      },
    },
  };
}

export function addSessionError(
  session: AnalysisSession,
  stage: ProcessingStage,
  error: string
): AnalysisSession {
  const updated = { ...session };
  updated.errors.push({ stage, message: error });
  updated.stages[stage === 'VALIDATING' ? 'validation' : stage === 'EXTRACTING_METADATA' ? 'metadata' : 'ocr'] = {
    stage,
    status: 'FAILED',
    progress: 0,
    error,
  };
  updated.overallStatus = 'ERROR';
  return updated;
}

export function markSessionReady(session: AnalysisSession): AnalysisSession {
  return {
    ...session,
    overallStatus: 'READY',
  };
}

export function createImagePreview(file: File): Promise<{ src: string; dimensions: { width: number; height: number } } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({
        src: url,
        dimensions: { width: img.naturalWidth, height: img.naturalHeight },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

function updateOverallStatus(session: AnalysisSession): void {
  const { validation, metadata, ocr } = session.stages;

  if (validation.status === 'FAILED' || metadata.status === 'FAILED') {
    session.overallStatus = 'ERROR';
  } else if (metadata.status === 'COMPLETED' && ocr.status === 'COMPLETED') {
    session.overallStatus = 'READY';
  } else if (ocr.status === 'RUNNING') {
    session.overallStatus = 'EXTRACTING';
  } else if (metadata.status === 'COMPLETED') {
    session.overallStatus = 'EXTRACTING';
  } else {
    session.overallStatus = 'VALIDATING';
  }
}

function generateSessionId(): string {
  return `VW-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
}
