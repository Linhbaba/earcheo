import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

// Seznam admin user IDs (Auth0 sub)
// TODO: Přesunout do env proměnné nebo databáze
const ADMIN_USER_IDS = [
  process.env.ADMIN_USER_ID,
].filter(Boolean);

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // Ověření admin práv
  if (!ADMIN_USER_IDS.includes(userId)) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // POST: Přidělit kredity uživateli
  if (req.method === 'POST') {
    try {
      const { targetUserId, amount, description } = req.body;

      if (!targetUserId || typeof targetUserId !== 'string') {
        return res.status(400).json({ error: 'Target user ID is required' });
      }

      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount is required' });
      }

      // Ověř, že cílový uživatel existuje
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, email: true, nickname: true },
      });

      if (!targetUser) {
        return res.status(404).json({ error: 'Target user not found' });
      }

      // Najdi nebo vytvoř UserCredits pro cílového uživatele
      let userCredits = await prisma.userCredits.findUnique({
        where: { userId: targetUserId },
      });

      if (!userCredits) {
        userCredits = await prisma.userCredits.create({
          data: {
            userId: targetUserId,
            balance: 0,
          },
        });
      }

      // Aktualizuj zůstatek
      const updated = await prisma.userCredits.update({
        where: { userId: targetUserId },
        data: {
          balance: { increment: amount },
        },
      });

      // Zaznamenej transakci
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId: targetUserId,
          amount: amount,
          type: 'ADMIN_GRANT',
          description: description || `Přiděleno adminem`,
          metadata: {
            grantedBy: userId,
          },
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

  // GET: Seznam všech uživatelů s jejich kredity
  if (req.method === 'GET') {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          nickname: true,
          credits: {
            select: {
              balance: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              findings: true,
            },
          },
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

