import sharp from 'sharp';
import { put } from '@vercel/blob';

export interface ProcessedImages {
  originalUrl: string;
  thumbnailUrl: string;
  mediumUrl: string;
  filename: string;
  filesize: number;
}

/**
 * Process and upload image in 3 sizes:
 * - Original (optimized)
 * - Thumbnail (200x200)
 * - Medium (800x600)
 */
export async function processAndUploadImage(
  buffer: Buffer,
  filename: string,
  folder: string
): Promise<ProcessedImages> {
  const timestamp = Date.now();
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = `${folder}/${timestamp}`;

  try {
    // 1. Original (optimized, max 2048x2048)
    const optimizedBuffer = await sharp(buffer)
      .resize(2048, 2048, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();

    // 2. Thumbnail (200x200, cover crop)
    const thumbnailBuffer = await sharp(buffer)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'attention' // Smart crop
      })
      .webp({ quality: 80 })
      .toBuffer();

    // 3. Medium (800x600, contain)
    const mediumBuffer = await sharp(buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Upload all 3 versions to Vercel Blob
    const [original, thumbnail, medium] = await Promise.all([
      put(`${baseName}-original.webp`, optimizedBuffer, {
        access: 'public',
        addRandomSuffix: false,
      }),
      put(`${baseName}-thumb.webp`, thumbnailBuffer, {
        access: 'public',
        addRandomSuffix: false,
      }),
      put(`${baseName}-medium.webp`, mediumBuffer, {
        access: 'public',
        addRandomSuffix: false,
      }),
    ]);

    return {
      originalUrl: original.url,
      thumbnailUrl: thumbnail.url,
      mediumUrl: medium.url,
      filename,
      filesize: optimizedBuffer.length,
    };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Delete all versions of an image from Vercel Blob
 */
export async function deleteImage(
  originalUrl: string,
  thumbnailUrl: string,
  mediumUrl: string
): Promise<void> {
  const { del } = await import('@vercel/blob');
  
  try {
    await Promise.all([
      del(originalUrl),
      del(thumbnailUrl),
      del(mediumUrl),
    ]);
  } catch (error) {
    console.error('Image deletion error:', error);
    // Don't throw - partial deletion is acceptable
  }
}





