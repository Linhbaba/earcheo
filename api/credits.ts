import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';

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

  // POST: Rezervovat kredity (před analýzou)
  if (req.method === 'POST') {
    try {
      const { amount, description } = req.body;

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      // Získej aktuální zůstatek
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

      // Odečti kredity
      const updated = await prisma.userCredits.update({
        where: { userId },
        data: {
          balance: { decrement: amount },
        },
      });

      // Zaznamenej transakci
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

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

