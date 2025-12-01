import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

// Protected handler for equipment CRUD
async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET - List user's equipment
  if (req.method === 'GET') {
    try {
      const equipment = await prisma.equipment.findMany({
        where: { userId },
        include: {
          _count: {
            select: { FindingEquipment: true }, // Count how many findings use this equipment
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Format response
      const formatted = equipment.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        manufacturer: e.manufacturer,
        model: e.model,
        notes: e.notes,
        usageCount: e._count.FindingEquipment,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Get equipment error:', error);
      return res.status(500).json({ error: 'Failed to fetch equipment' });
    }
  }

  // POST - Create new equipment
  if (req.method === 'POST') {
    try {
      const { name, type, manufacturer, model, notes } = req.body;

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!type || !['DETECTOR', 'GPS', 'OTHER'].includes(type)) {
        return res.status(400).json({ error: 'Invalid equipment type' });
      }

      const equipment = await prisma.equipment.create({
        data: {
          userId,
          name: name.trim(),
          type,
          manufacturer: manufacturer?.trim() || null,
          model: model?.trim() || null,
          notes: notes?.trim() || null,
        },
      });

      return res.status(201).json({
        id: equipment.id,
        name: equipment.name,
        type: equipment.type,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        notes: equipment.notes,
        usageCount: 0,
        createdAt: equipment.createdAt.toISOString(),
        updatedAt: equipment.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Create equipment error:', error);
      return res.status(500).json({ error: 'Failed to create equipment' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Main export with authentication
export default withAuth(handler);
