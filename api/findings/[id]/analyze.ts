import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_lib/db';
import { withAuth } from '../../_lib/auth';
import { 
  analyzeImages, 
  estimateCost, 
  CREDIT_COSTS,
  type FindingType,
  type AnalysisLevel,
  type UserContext,
} from '../../_lib/openai';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Finding ID is required' });
  }

  // GET: Získat historii analýz pro nález
  if (req.method === 'GET') {
    try {
      // Ověření vlastnictví
      const finding = await prisma.finding.findFirst({
        where: { id, userId },
        select: { id: true },
      });

      if (!finding) {
        return res.status(404).json({ error: 'Finding not found' });
      }

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

  // POST: Spustit novou AI analýzu
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

      // Validace úrovně
      if (!['quick', 'detailed', 'expert'].includes(level)) {
        return res.status(400).json({ error: 'Invalid analysis level' });
      }

      // Ověření vlastnictví a získání nálezu s obrázky
      const finding = await prisma.finding.findFirst({
        where: { id, userId },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!finding) {
        return res.status(404).json({ error: 'Finding not found' });
      }

      // Vyber obrázky pro analýzu
      let imagesToAnalyze = finding.images;
      if (imageIds && imageIds.length > 0) {
        imagesToAnalyze = finding.images.filter(img => imageIds.includes(img.id));
      }

      if (imagesToAnalyze.length === 0) {
        return res.status(400).json({ error: 'No images to analyze' });
      }

      // Omezení počtu obrázků
      const maxImages = level === 'expert' ? 6 : 4;
      imagesToAnalyze = imagesToAnalyze.slice(0, maxImages);

      // Spočítej cenu
      const creditsCost = estimateCost(level, imagesToAnalyze.length);

      // Ověř a odečti kredity
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

      // Odečti kredity
      await prisma.userCredits.update({
        where: { userId },
        data: {
          balance: { decrement: creditsCost },
        },
      });

      // Zaznamenej transakci
      await prisma.creditTransaction.create({
        data: {
          userId,
          amount: -creditsCost,
          type: 'ANALYSIS',
          description: `AI analýza (${level})`,
          metadata: {
            findingId: id,
            level,
            imageCount: imagesToAnalyze.length,
          },
        },
      });

      // Připrav URL obrázků (použij mediumUrl pro dobrý poměr kvalita/velikost)
      const imageUrls = imagesToAnalyze.map(img => img.mediumUrl);

      // Spusť analýzu
      const analysisStartTime = Date.now();
      
      try {
        const { result, tokensUsed } = await analyzeImages(
          imageUrls,
          findingType as FindingType,
          level,
          context
        );

        // Ulož výsledek analýzy
        const analysis = await prisma.findingAnalysis.create({
          data: {
            findingId: id,
            model: level === 'expert' ? 'gpt-4o' : 'gpt-4o', // Zatím stejný model
            level,
            result: result as any,
            tokensUsed,
            creditsCost,
          },
        });

        // Získej aktualizovaný zůstatek
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
        // Při chybě vrať kredity
        await prisma.userCredits.update({
          where: { userId },
          data: {
            balance: { increment: creditsCost },
          },
        });

        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: creditsCost,
            type: 'REFUND',
            description: 'Vrácení za neúspěšnou analýzu',
            metadata: {
              findingId: id,
              error: String(analysisError),
            },
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

export default withAuth(handler);

