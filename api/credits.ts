import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';
import { 
  analyzeImages, 
  estimateCost,
  type FindingType,
  type AnalysisLevel,
  type UserContext,
} from './_lib/openai';

// Admin user IDs
const ADMIN_USER_IDS = [
  process.env.ADMIN_USER_ID,
].filter(Boolean);

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Získat zůstatek uživatele
  if (req.method === 'GET') {
    try {
      // Najdi nebo vytvoř UserCredits
      let userCredits = await prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits) {
        // Vytvoř nový záznam s počátečním bonusem
        userCredits = await prisma.userCredits.create({
          data: {
            userId,
            balance: 10, // Počáteční bonus pro nové uživatele
          },
        });

        // Zaznamenej bonus transakci
        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: 10,
            type: 'BONUS',
            description: 'Uvítací bonus za registraci',
          },
        });
      }

      // Získej historii transakcí (posledních 20)
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return res.status(200).json({
        balance: userCredits.balance,
        transactions,
      });
    } catch (error) {
      console.error('Get credits error:', error);
      return res.status(500).json({ error: 'Failed to get credits' });
    }
  }

  // POST: Analýza nebo rezervace kreditů
  if (req.method === 'POST') {
    const { action } = req.body;

    // AI Analýza obrázků (bez existujícího nálezu)
    if (action === 'analyze') {
      try {
        const { 
          images, // base64 nebo URL
          level = 'quick',
          findingType = 'GENERAL',
          context,
        } = req.body as {
          images: string[];
          level?: AnalysisLevel;
          findingType?: FindingType;
          context?: UserContext;
        };

        if (!images || !Array.isArray(images) || images.length === 0) {
          return res.status(400).json({ error: 'Images are required' });
        }

        // Validace velikosti obrázků (max 4MB per image, ~5.3MB base64)
        const MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5MB
        for (const img of images) {
          if (img.length > MAX_BASE64_SIZE) {
            return res.status(400).json({ 
              error: 'Image too large. Maximum size is 4MB per image.' 
            });
          }
        }

        if (!['quick', 'detailed', 'expert'].includes(level)) {
          return res.status(400).json({ error: 'Invalid analysis level' });
        }

        // Limit obrázků
        const maxImages = level === 'expert' ? 6 : 4;
        const imagesToAnalyze = images.slice(0, maxImages);

        // Spočítej cenu
        const creditsCost = estimateCost(level, imagesToAnalyze.length);

        // Ověř kredity
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
          data: { balance: { decrement: creditsCost } },
        });

        // Zaznamenej transakci
        await prisma.creditTransaction.create({
          data: {
            userId,
            amount: -creditsCost,
            type: 'ANALYSIS',
            description: `AI analýza (${level})`,
            metadata: { level, imageCount: imagesToAnalyze.length },
          },
        });

        const analysisStartTime = Date.now();

        try {
          const { result, tokensUsed } = await analyzeImages(
            imagesToAnalyze,
            findingType as FindingType,
            level,
            context
          );

          // Získej aktualizovaný zůstatek
          const updatedCredits = await prisma.userCredits.findUnique({
            where: { userId },
          });

          return res.status(200).json({
            result,
            tokensUsed,
            balance: updatedCredits?.balance || 0,
            duration: Date.now() - analysisStartTime,
          });
        } catch (analysisError) {
          // Vrať kredity při chybě
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
              metadata: { error: String(analysisError) },
            },
          });

          console.error('Analysis error:', analysisError);
          return res.status(500).json({ error: 'Analysis failed, credits refunded' });
        }
      } catch (error) {
        console.error('Analyze error:', error);
        return res.status(500).json({ error: 'Failed to analyze' });
      }
    }

    // Rezervace kreditů (původní funkcionalita)
    try {
      const { amount, description } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      const userCredits = await prisma.userCredits.findUnique({
        where: { userId },
      });

      if (!userCredits || userCredits.balance < amount) {
        return res.status(400).json({ 
          error: 'Insufficient credits',
          balance: userCredits?.balance || 0,
          required: amount,
        });
      }

      const updated = await prisma.userCredits.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
        },
      });

      const transaction = await prisma.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: 'ANALYSIS',
          description: description || 'AI analýza',
        },
      });

      return res.status(200).json({
        balance: updated.balance,
        transaction,
      });
    } catch (error) {
      console.error('Reserve credits error:', error);
      return res.status(500).json({ error: 'Failed to reserve credits' });
    }
  }

  // PUT: Admin - přidělit kredity uživateli
  if (req.method === 'PUT') {
    if (!ADMIN_USER_IDS.includes(userId)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    try {
      const { targetUserId, amount, description } = req.body;

      if (!targetUserId || typeof targetUserId !== 'string') {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount is required' });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, nickname: true },
      });

      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      let userCredits = await prisma.userCredits.findUnique({
        where: { userId: targetUserId },
      });

      if (!userCredits) {
        userCredits = await prisma.userCredits.create({
          data: { userId: targetUserId, balance: 0 },
        });
      }

      const updated = await prisma.userCredits.update({
        where: { userId: targetUserId },
        data: { balance: { increment: amount } },
      });

      const transaction = await prisma.creditTransaction.create({
        data: {
          userId: targetUserId,
          amount: amount,
          type: 'ADMIN_GRANT',
          description: description || 'Přiděleno adminem',
          metadata: { grantedBy: userId },
        },
      });

      return res.status(200).json({
        success: true,
        user: targetUser,
        balance: updated.balance,
        transaction,
      });
    } catch (error) {
      console.error('Admin grant credits error:', error);
      return res.status(500).json({ error: 'Failed to grant credits' });
    }
  }

  // PATCH: Admin - seznam uživatelů s kredity
  if (req.method === 'PATCH') {
    if (!ADMIN_USER_IDS.includes(userId)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nickname: true,
          credits: { select: { balance: true, updatedAt: true } },
          _count: { select: { findings: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      const usersWithCredits = users.map(user => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        balance: user.credits?.balance || 0,
        lastCreditUpdate: user.credits?.updatedAt,
        findingsCount: user._count.findings,
      }));

      return res.status(200).json({ users: usersWithCredits });
    } catch (error) {
      console.error('Admin list users error:', error);
      return res.status(500).json({ error: 'Failed to list users' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
