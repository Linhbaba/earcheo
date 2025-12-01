import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid equipment ID' });
  }

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
            select: { FindingEquipment: true },
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
        usageCount: equipmentWithCount._count.FindingEquipment,
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
            select: { FindingEquipment: true },
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
        usageCount: updated._count.FindingEquipment,
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
      // Check if equipment is used in findings
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

export default withAuth(handler);
