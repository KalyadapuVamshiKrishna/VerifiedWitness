/**
 * Metadata extraction using exifr
 * Synchronous extraction with graceful fallbacks for missing data
 */

import { parse } from 'exifr';
import { MetadataInfo } from '@/lib/types';
import { sha256Buffer } from '@/lib/hash';

export interface MetadataExtractionResult {
  success: boolean;
  data: MetadataInfo | null;
  error?: string;
  warnings?: string[];
}

/**
 * Extract metadata from image file
 * Returns null if extraction fails, with error message
 */
export async function extractMetadata(file: File): Promise<MetadataExtractionResult> {
  try {
    const buffer = await file.arrayBuffer();
    const warnings: string[] = [];

    let exifData: any = {};
    try {
      exifData = (await parse(file)) || {};
    } catch (err) {
      warnings.push('Could not extract EXIF data from file');
    }

    // Extract dimensions from image file
    const dimensions = await extractImageDimensions(file);
    if (!dimensions) {
      warnings.push('Could not determine image dimensions');
    }

    // Compute metadata hash
    const metadataHash = await sha256Buffer(buffer);

    const metadata: MetadataInfo = {
      cameraModel: exifData.Model || 'Unknown',
      lensModel: exifData.LensModel || 'Unknown',
      shootingDate: exifData.DateTimeOriginal || new Date(),
      gpsCoordinates: extractGpsCoordinates(exifData),
      isoSpeed: exifData.ISO || 0,
      fNumber: exifData.FNumber || 0,
      exposureTime: exifData.ExposureTime || 0,
      focalLength: exifData.FocalLength || 0,
      flashFired: exifData.Flash ? Boolean(exifData.Flash) : false,
      orientation: exifData.Orientation || 1,
      colorSpace: exifData.ColorSpace || 'sRGB',
      fileSize: file.size,
      mimeType: file.type,
      dimensions: dimensions || { width: 0, height: 0 },
      exifHash: metadataHash,
      rawMetadata: {
        make: exifData.Make || 'Unknown',
        model: exifData.Model || 'Unknown',
        dateTimeOriginal: formatDate(exifData.DateTimeOriginal),
        digitalZoomRatio: exifData.DigitalZoomRatio || 1,
        whiteBalance: exifData.WhiteBalance ? 'Manual' : 'Auto',
        lightSource: exifData.LightSource || 'Unknown',
        meteringMode: exifData.MeteringMode || 'Unknown',
        focusMode: exifData.FocusMode || 'Unknown',
        afPointSelected: exifData.AFPointSelected || 'Unknown',
      },
    };

    return {
      success: true,
      data: metadata,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: `Metadata extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Extract GPS coordinates from EXIF data
 */
function extractGpsCoordinates(exifData: any): { latitude: number; longitude: number } | undefined {
  try {
    if (exifData.Latitude && exifData.Longitude) {
      return {
        latitude: exifData.Latitude,
        longitude: exifData.Longitude,
      };
    }
  } catch (err) {
    // Silently ignore GPS extraction errors
  }
  return undefined;
}

/**
 * Extract image dimensions from file
 */
function extractImageDimensions(
  file: File
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Format date for display
 */
function formatDate(date: any): string {
  if (!date) return 'Unknown';
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return String(date);
}
