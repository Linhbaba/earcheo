import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_lib/db';
import { withAuth } from '../../_lib/auth';
import { processAndUploadImage, deleteImage } from '../../_lib/image-processor';
import { 
  analyzeImages, 
  estimateCost, 
  type FindingType,
  type AnalysisLevel,
  type UserContext,
} from '../../_lib/openai';

// Config for larger body size (images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, action, imageId } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Finding ID is required' });
  }

  // Verify ownership
  const finding = await prisma.finding.findFirst({
    where: { 
      id,
      userId,
    },
    include: {
      images: { orderBy: { order: 'asc' } },
    },
  });

  if (!finding) {
    return res.status(404).json({ error: 'Finding not found' });
  }

  // ============ ANALYZE ROUTES (?action=analyze) ============
  if (action === 'analyze') {
    // GET: Historie analýz
    if (req.method === 'GET') {
      try {
        const analyses = await prisma.findingAnalysis.findMany({
          where: { findingId: id },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json({ analyses });
      } catch (error) {
        console.error('Get analyses error:', error);
        return res.status(500).json({ error: 'Failed to get analyses' });
      }
    }

    // POST: Nová AI analýza
    if (req.method === 'POST') {
      try {
        const { 
          imageIds, 
          level = 'quick', 
          findingType = 'GENERAL',
          context,
        } = req.body as {
          imageIds?: string[];
          level?: AnalysisLevel;
          findingType?: FindingType;
          context?: UserContext;
        };

        if (!['quick', 'detailed', 'expert'].includes(level)) {
          return res.status(400).json({ error: 'Invalid analysis level' });
        }

        let imagesToAnalyze = finding.images;
        if (imageIds && imageIds.length > 0) {
          imagesToAnalyze = finding.images.filter(img => imageIds.includes(img.id));
        }

        if (imagesToAnalyze.length === 0) {
          return res.status(400).json({ error: 'No images to analyze' });
        }

        const maxImages = level === 'expert' ? 6 : 4;
        imagesToAnalyze = imagesToAnalyze.slice(0, maxImages);

        const creditsCost = estimateCost(level, imagesToAnalyze.length);

        const userCredits = await prisma.userCredits.findUnique({
          where: { userId },
        });

        if (!userCredits || userCredits.balance < creditsCost) {
          return res.status(400).json({
            error: 'Insufficient credits',
            balance: userCredits?.balance || 0,
            required: creditsCost,
          });
        }

        await prisma.userCredits.update({
          where: { userId },
          data: { balance: { decrement: creditsCost } },
        });

        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: -creditsCost,
            type: 'ANALYSIS',
            description: `AI analýza (${level})`,
            metadata: { findingId: id, level, imageCount: imagesToAnalyze.length },
          },
        });

        const imageUrls = imagesToAnalyze.map(img => img.mediumUrl);
        const analysisStartTime = Date.now();
        
        try {
          const { result, tokensUsed } = await analyzeImages(
            imageUrls,
            findingType as FindingType,
            level,
            context
          );

          const analysis = await prisma.findingAnalysis.create({
            data: {
              findingId: id,
              model: 'gpt-4o',
              level,
              result: result as any,
              tokensUsed,
              creditsCost,
            },
          });

          const updatedCredits = await prisma.userCredits.findUnique({
            where: { userId },
          });

          return res.status(200).json({
            analysis,
            result,
            balance: updatedCredits?.balance || 0,
            duration: Date.now() - analysisStartTime,
          });
        } catch (analysisError) {
          // Refund on error
          await prisma.userCredits.update({
            where: { userId },
            data: { balance: { increment: creditsCost } },
          });

          await prisma.creditTransaction.create({
            data: {
              userId,
              amount: creditsCost,
              type: 'REFUND',
              description: 'Vrácení za neúspěšnou analýzu',
              metadata: { findingId: id, error: String(analysisError) },
            },
          });

          console.error('Analysis error:', analysisError);
          return res.status(500).json({ error: 'Analysis failed, credits refunded' });
        }
      } catch (error) {
        console.error('Analyze finding error:', error);
        return res.status(500).json({ error: 'Failed to analyze finding' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ============ IMAGE ROUTES (default) ============
  
  // POST: Upload new image
  if (req.method === 'POST') {
    try {
      const { image, filename } = req.body;

      if (!image || !filename) {
        return res.status(400).json({ error: 'Image and filename are required' });
      }

      const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(413).json({ error: 'Image too large. Maximum size is 10MB' });
      }

      const processed = await processAndUploadImage(buffer, filename, `findings/${id}`);

      const maxOrder = await prisma.findingImage.findFirst({
        where: { findingId: id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

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

  // DELETE: Delete image
  if (req.method === 'DELETE') {
    try {
      if (!imageId || typeof imageId !== 'string') {
        return res.status(400).json({ error: 'Image ID is required' });
      }

      const image = await prisma.findingImage.findFirst({
        where: { id: imageId, findingId: id },
      });

      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }

      await deleteImage(image.originalUrl, image.thumbnailUrl, image.mediumUrl);

      await prisma.findingImage.delete({
        where: { id: imageId },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete image error:', error);
      return res.status(500).json({ error: 'Failed to delete image' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
