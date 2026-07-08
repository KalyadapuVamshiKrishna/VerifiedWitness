/**
 * OCR extraction using Tesseract.js
 * Non-blocking async processing with progress tracking
 */

import Tesseract from 'tesseract.js';
import { OCRResult } from '@/lib/types';
import { isImageFile } from '@/lib/validation';

export interface OCRExtractionResult {
  success: boolean;
  data: OCRResult | null;
  error?: string;
  warnings?: string[];
}

export type OCRProgressCallback = (progress: number) => void;

/**
 * Extract text from image using Tesseract.js
 * Runs in worker thread, non-blocking
 */
export async function extractOCR(
  file: File,
  sessionId: string,
  onProgress?: OCRProgressCallback
): Promise<OCRExtractionResult> {
  // OCR only supported for images
  if (!isImageFile(file)) {
    return {
      success: false,
      data: null,
      error: 'OCR is only available for image files. PDF text extraction coming in a future update.',
    };
  }

  try {
    const url = URL.createObjectURL(file);

    // Initialize Tesseract with progress tracking
    const {
      data: { text, confidence, lines },
    } = await Tesseract.recognize(url, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing') {
          const progress = Math.round(m.progress * 100);
          onProgress?.(progress);
        }
      },
    });

    URL.revokeObjectURL(url);

    // Parse recognized lines into regions
    const regions = (lines || [])
      .map((line: any) => ({
        text: line.text || '',
        confidence: line.confidence || 0,
        boundingBox: {
          x: line.bbox?.x0 || 0,
          y: line.bbox?.y0 || 0,
          width: (line.bbox?.x1 || 0) - (line.bbox?.x0 || 0),
          height: (line.bbox?.y1 || 0) - (line.bbox?.y0 || 0),
        },
      }))
      .filter((r: any) => r.text.trim().length > 0);

    // Compute overall confidence
    const overallConfidence =
      regions.length > 0
        ? regions.reduce((sum: number, r: any) => sum + r.confidence, 0) / regions.length
        : 0;

    const result: OCRResult = {
      id: `OCR-${sessionId}`,
      confidence: Math.round(overallConfidence),
      regions,
      fullText: text || '',
      languages: ['English'],
      timestamp: new Date(),
    };

    return {
      success: true,
      data: result,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: `OCR extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Quick text detection without full OCR
 * Useful for preview/validation before full extraction
 */
export async function detectText(file: File): Promise<boolean> {
  if (!isImageFile(file)) return false;

  try {
    const url = URL.createObjectURL(file);

    const {
      data: { text },
    } = await Tesseract.recognize(url, 'eng', {
      logger: () => {
        // Silent progress
      },
    });

    URL.revokeObjectURL(url);
    return (text || '').trim().length > 0;
  } catch (err) {
    return false;
  }
}
