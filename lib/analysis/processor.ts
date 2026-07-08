/**
 * Evidence processing pipeline
 * Orchestrates metadata and OCR extraction with error handling
 */

import { validateFile } from '@/lib/validation';
import { sha256Hash } from '@/lib/hash';
import { extractMetadata } from '@/lib/metadata';
import { extractOCR, OCRProgressCallback } from '@/lib/ocr';
import {
  AnalysisSession,
  createSession,
  updateSessionMetadata,
  updateSessionOCR,
  updateSessionOCRProgress,
  addSessionError,
  markSessionReady,
  createImagePreview,
} from '@/lib/analysis/session';
import { VerificationReport } from '@/lib/types';

export interface ProcessingOptions {
  skipOCR?: boolean;
  skipGemini?: boolean;
  onProgress?: (session: AnalysisSession) => void;
  onOCRProgress?: OCRProgressCallback;
  onVerificationProgress?: (message: string) => void;
}

/**
 * Process a file through the evidence pipeline
 * Returns updated session at each stage
 */
export async function processFile(
  file: File,
  options: ProcessingOptions = {}
): Promise<AnalysisSession> {
  // 1. Validation
  const validation = validateFile(file);
  if (!validation.valid) {
    const errorSession = createSession(file, 'PENDING');
    return addSessionError(errorSession, 'VALIDATING', validation.error || 'Validation failed');
  }

  // 2. Hash file
  const fileHash = await sha256Hash(file);

  // 3. Create session
  let session = createSession(file, fileHash);
  options.onProgress?.(session);

  // 4. Create image preview
  const preview = await createImagePreview(file);
  if (preview) {
    session.imagePreview = preview;
  }

  // 5. Extract metadata (fast, synchronous)
  const metadataResult = await extractMetadata(file);
  if (metadataResult.success && metadataResult.data) {
    session = updateSessionMetadata(session, metadataResult.data, metadataResult.warnings);
  } else {
    session = addSessionError(session, 'EXTRACTING_METADATA', metadataResult.error || 'Metadata extraction failed');
  }

  options.onProgress?.(session);

  // 6. Extract OCR (async, non-blocking, optional)
  if (!options.skipOCR) {
    // Start OCR asynchronously without blocking
    extractOCRAsync(session, options.onProgress, options.onOCRProgress).catch((err) => {
      console.error('[v0] OCR extraction error:', err);
    });
  } else {
    // Mark OCR as skipped
    session = markSessionReady(session);
    options.onProgress?.(session);
  }

  return session;
}

/**
 * Extract OCR asynchronously without blocking the UI
 * Continues in the background, updating session as it progresses
 */
async function extractOCRAsync(
  session: AnalysisSession,
  onSessionUpdate?: (session: AnalysisSession) => void,
  onOCRProgress?: OCRProgressCallback
): Promise<void> {
  try {
    let currentSession = session;

    const ocrResult = await extractOCR(
      session.file,
      session.id,
      (progress) => {
        currentSession = updateSessionOCRProgress(currentSession, progress);
        onOCRProgress?.(progress);
        onSessionUpdate?.(currentSession);
      }
    );

    if (ocrResult.success && ocrResult.data) {
      currentSession = updateSessionOCR(currentSession, ocrResult.data, ocrResult.warnings);
    } else {
      currentSession = addSessionError(currentSession, 'EXTRACTING_OCR', ocrResult.error || 'OCR extraction failed');
    }

    // Mark as ready
    currentSession = markSessionReady(currentSession);
    onSessionUpdate?.(currentSession);
  } catch (err) {
    console.error('[v0] OCR processing error:', err);
  }
}

/**
 * Generate verification report from analysis session
 * Calls Gemini and applies deterministic scoring
 */
export async function generateVerificationReport(
  session: AnalysisSession,
  options: { skipGemini?: boolean; onProgress?: (message: string) => void } = {}
): Promise<VerificationReport> {
  // Dynamically import to avoid circular dependencies
  const { generateVerificationReport: createReport } = await import('@/lib/verification/engine');
  return createReport(session, options);
}
