import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// Validation schema
const createEquipmentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['DETECTOR', 'GPS', 'OTHER']),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Seznam vybavení uživatele
  if (req.method === 'GET') {
    try {
      const equipment = await prisma.equipment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(equipment);
    } catch (error) {
      console.error('Get equipment error:', error);
      return res.status(500).json({ error: 'Failed to get equipment' });
    }
  }

  // POST: Přidat nové vybavení
  if (req.method === 'POST') {
    try {
      const validation = createEquipmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const equipment = await prisma.equipment.create({
        data: {
          ...validation.data,
          userId,
        },
      });

      return res.status(201).json(equipment);
    } catch (error) {
      console.error('Create equipment error:', error);
      return res.status(500).json({ error: 'Failed to create equipment' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

