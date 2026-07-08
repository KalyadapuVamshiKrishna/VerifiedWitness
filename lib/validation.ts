/**
 * File validation utilities
 */

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/tiff',
  'image/x-tiff',
]);

const SUPPORTED_DOCUMENT_TYPES = new Set(['application/pdf']);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

export function validateFile(file: File): ValidationResult {
  const warnings: string[] = [];

  // Check file size
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of 50MB (${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  // Check MIME type
  const isImage = SUPPORTED_IMAGE_TYPES.has(file.type);
  const isPdf = SUPPORTED_DOCUMENT_TYPES.has(file.type);

  if (!isImage && !isPdf) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || 'unknown'}. Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF, PDF`,
    };
  }

  // Warn about PDF OCR limitations
  if (isPdf) {
    warnings.push('PDF OCR support is coming in a future update. Text extraction will not be available.');
  }

  return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.has(file.type);
}

export function isPdfFile(file: File): boolean {
  return SUPPORTED_DOCUMENT_TYPES.has(file.type);
}
