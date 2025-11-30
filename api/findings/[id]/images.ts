import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_lib/db';
import { withAuth } from '../../_lib/auth';
import { processAndUploadImage, deleteImage } from '../../_lib/image-processor';

// Config for larger body size (images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Finding ID is required' });
  }

  // Verify ownership
  const finding = await prisma.finding.findFirst({
    where: { 
      id,
      userId, // Security: pouze vlastní nálezy
    },
  });

  if (!finding) {
    return res.status(404).json({ error: 'Finding not found' });
  }

  // POST: Nahrát novou fotku
  if (req.method === 'POST') {
    try {
      const { image, filename } = req.body;

      if (!image || !filename) {
        return res.status(400).json({ 
          error: 'Image and filename are required' 
        });
      }

      // Decode base64 image
      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Check file size (max 10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(413).json({ 
          error: 'Image too large. Maximum size is 10MB' 
        });
      }

      // Process and upload
      const processed = await processAndUploadImage(
        buffer,
        filename,
        `findings/${id}`
      );

      // Get current max order
      const maxOrder = await prisma.findingImage.findFirst({
        where: { findingId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      // Save to database
      const findingImage = await prisma.findingImage.create({
        data: {
          findingId: id,
          originalUrl: processed.originalUrl,
          thumbnailUrl: processed.thumbnailUrl,
          mediumUrl: processed.mediumUrl,
          filename: processed.filename,
          filesize: processed.filesize,
          order: (maxOrder?.order ?? -1) + 1,
        },
      });

      return res.status(201).json(findingImage);
    } catch (error) {
      console.error('Upload image error:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  }

  // DELETE: Smazat fotku
  if (req.method === 'DELETE') {
    try {
      const { imageId } = req.query;

      if (!imageId || typeof imageId !== 'string') {
        return res.status(400).json({ error: 'Image ID is required' });
      }

      // Get image
      const image = await prisma.findingImage.findFirst({
        where: { 
          id: imageId,
          findingId: id,
        },
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      // Delete from Vercel Blob
      await deleteImage(
        image.originalUrl,
        image.thumbnailUrl,
        image.mediumUrl
      );

      // Delete from database
      await prisma.findingImage.delete({
        where: { id: imageId },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete image error:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);





