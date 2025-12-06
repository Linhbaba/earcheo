import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  // Routes with ID - /api/equipment/[id]
  if (id && typeof id === 'string') {
    // Verify ownership
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (equipment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // GET - Get single equipment
    if (req.method === 'GET') {
      try {
        const equipmentWithCount = await prisma.equipment.findUnique({
          where: { id },
          include: {
            _count: {
              select: { findings: true },
            },
          },
        });

        if (!equipmentWithCount) {
          return res.status(404).json({ error: 'Equipment not found' });
        }

        return res.status(200).json({
          id: equipmentWithCount.id,
          name: equipmentWithCount.name,
          type: equipmentWithCount.type,
          manufacturer: equipmentWithCount.manufacturer,
          model: equipmentWithCount.model,
          notes: equipmentWithCount.notes,
          usageCount: equipmentWithCount._count.findings,
          createdAt: equipmentWithCount.createdAt.toISOString(),
          updatedAt: equipmentWithCount.updatedAt.toISOString(),
        });
      } catch (error) {
        console.error('Get equipment error:', error);
        return res.status(500).json({ error: 'Failed to fetch equipment' });
      }
    }

    // PUT - Update equipment
    if (req.method === 'PUT') {
      try {
        const { name, type, manufacturer, model, notes } = req.body;

        if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
          return res.status(400).json({ error: 'Name is required' });
        }

        if (type !== undefined && !['DETECTOR', 'GPS', 'OTHER'].includes(type)) {
          return res.status(400).json({ error: 'Invalid equipment type' });
        }

        const updated = await prisma.equipment.update({
          where: { id },
          data: {
            ...(name !== undefined && { name: name.trim() }),
            ...(type !== undefined && { type }),
            ...(manufacturer !== undefined && { manufacturer: manufacturer?.trim() || null }),
            ...(model !== undefined && { model: model?.trim() || null }),
            ...(notes !== undefined && { notes: notes?.trim() || null }),
          },
          include: {
            _count: {
              select: { findings: true },
            },
          },
        });

        return res.status(200).json({
          id: updated.id,
          name: updated.name,
          type: updated.type,
          manufacturer: updated.manufacturer,
          model: updated.model,
          notes: updated.notes,
          usageCount: updated._count.findings,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        });
      } catch (error) {
        console.error('Update equipment error:', error);
        return res.status(500).json({ error: 'Failed to update equipment' });
      }
    }

    // DELETE - Delete equipment
    if (req.method === 'DELETE') {
      try {
        const findingsCount = await prisma.findingEquipment.count({
          where: { equipmentId: id },
        });

        if (findingsCount > 0) {
          return res.status(400).json({ 
            error: 'Cannot delete equipment that is used in findings',
            usageCount: findingsCount 
          });
        }

        await prisma.equipment.delete({
          where: { id },
        });

        return res.status(204).end();
      } catch (error) {
        console.error('Delete equipment error:', error);
        return res.status(500).json({ error: 'Failed to delete equipment' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Routes without ID - /api/equipment
  // GET - List user's equipment
  if (req.method === 'GET') {
    try {
      const equipmentList = await prisma.equipment.findMany({
        where: { userId },
        include: {
          _count: {
            select: { findings: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const formatted = equipmentList.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        manufacturer: e.manufacturer,
        model: e.model,
        notes: e.notes,
        usageCount: e._count.findings,
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

export default withAuth(handler);

