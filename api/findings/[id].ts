import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';
import { deleteImage } from '../_lib/image-processor';

// Validation schema
const updateFindingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  date: z.string().datetime().optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  condition: z.string().max(100).optional(),
  depth: z.number().positive().optional(),
  locationName: z.string().max(200).optional(),
  historicalContext: z.string().max(2000).optional(),
  material: z.string().max(100).optional(),
  isPublic: z.boolean().optional(),
  equipmentIds: z.array(z.string()).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Finding ID is required' });
  }

  // GET: Detail nálezu
  if (req.method === 'GET') {
    try {
      const finding = await prisma.finding.findFirst({
        where: { 
          id,
          userId, // Security: pouze vlastní nálezy
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          equipment: {
            include: {
              equipment: true,
            },
          },
        },
      });

      if (!finding) {
        return res.status(404).json({ error: 'Finding not found' });
      }

      // Transform equipment for easier frontend use
      const transformed = {
        ...finding,
        equipment: finding.equipment.map(fe => fe.equipment),
      };

      return res.status(200).json(transformed);
    } catch (error) {
      console.error('Get finding error:', error);
      return res.status(500).json({ error: 'Failed to get finding' });
    }
  }

  // PUT: Upravit nález
  if (req.method === 'PUT') {
    try {
      const validation = updateFindingSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { equipmentIds, date, ...findingData } = validation.data;

      // Update finding
      const finding = await prisma.finding.updateMany({
        where: { 
          id,
          userId, // Security: pouze vlastní nálezy
        },
        data: {
          ...findingData,
          date: date ? new Date(date) : undefined,
        },
      });

      if (finding.count === 0) {
        return res.status(404).json({ error: 'Finding not found' });
      }

      // Update equipment relations if provided
      if (equipmentIds) {
        // Delete old relations
        await prisma.findingEquipment.deleteMany({
          where: { findingId: id },
        });

        // Create new relations
        if (equipmentIds.length > 0) {
          await prisma.findingEquipment.createMany({
            data: equipmentIds.map(equipmentId => ({
              findingId: id,
              equipmentId,
            })),
          });
        }
      }

      // Return updated finding
      const updated = await prisma.finding.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          equipment: {
            include: {
              equipment: true,
            },
          },
        },
      });

      return res.status(200).json(updated);
    } catch (error) {
      console.error('Update finding error:', error);
      return res.status(500).json({ error: 'Failed to update finding' });
    }
  }

  // DELETE: Smazat nález (včetně fotek)
  if (req.method === 'DELETE') {
    try {
      // Get images to delete from Vercel Blob
      const finding = await prisma.finding.findFirst({
        where: { 
          id,
          userId,
        },
        include: {
          images: true,
        },
      });

      if (!finding) {
        return res.status(404).json({ error: 'Finding not found' });
      }

      // Delete images from Vercel Blob
      await Promise.all(
        finding.images.map(img => 
          deleteImage(img.originalUrl, img.thumbnailUrl, img.mediumUrl)
        )
      );

      // Delete finding (cascade deletes images and equipment relations)
      await prisma.finding.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete finding error:', error);
      return res.status(500).json({ error: 'Failed to delete finding' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);


