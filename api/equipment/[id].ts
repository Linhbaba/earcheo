import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// Validation schema
const updateEquipmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['DETECTOR', 'GPS', 'OTHER']).optional(),
  manufacturer: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Equipment ID is required' });
  }

  // GET: Detail vybavení
  if (req.method === 'GET') {
    try {
      const equipment = await prisma.equipment.findFirst({
        where: { 
          id,
          userId, // Security: pouze vlastní vybavení
        },
      });

      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      return res.status(200).json(equipment);
    } catch (error) {
      console.error('Get equipment error:', error);
      return res.status(500).json({ error: 'Failed to get equipment' });
    }
  }

  // PUT: Upravit vybavení
  if (req.method === 'PUT') {
    try {
      const validation = updateEquipmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const equipment = await prisma.equipment.updateMany({
        where: { 
          id,
          userId, // Security: pouze vlastní vybavení
        },
        data: validation.data,
      });

      if (equipment.count === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Return updated equipment
      const updated = await prisma.equipment.findUnique({
        where: { id },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Update equipment error:', error);
      return res.status(500).json({ error: 'Failed to update equipment' });
    }
  }

  // DELETE: Smazat vybavení
  if (req.method === 'DELETE') {
    try {
      const equipment = await prisma.equipment.deleteMany({
        where: { 
          id,
          userId, // Security: pouze vlastní vybavení
        },
      });

      if (equipment.count === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete equipment error:', error);
      return res.status(500).json({ error: 'Failed to delete equipment' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);


