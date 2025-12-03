import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// GeoJSON Polygon validation
const geoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()).length(2))).min(1),
});

// Validation schema for updating sector
const updateSectorSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  geometry: geoJSONPolygonSchema.optional(),
  stripWidth: z.number().positive().optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Sector ID is required' });
  }

  // GET: Detail sektoru
  if (req.method === 'GET') {
    try {
      const sector = await prisma.sector.findFirst({
        where: { 
          id,
          userId, // Zajistí přístup pouze k vlastním sektorům
        },
        include: {
          tracks: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      return res.status(200).json(sector);
    } catch (error) {
      console.error('Get sector error:', error);
      return res.status(500).json({ error: 'Failed to get sector' });
    }
  }

  // PUT: Aktualizovat sektor
  if (req.method === 'PUT') {
    try {
      const validation = updateSectorSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      // Ověřit vlastnictví
      const existingSector = await prisma.sector.findFirst({
        where: { id, userId },
      });

      if (!existingSector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      const sector = await prisma.sector.update({
        where: { id },
        data: validation.data,
        include: {
          tracks: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return res.status(200).json(sector);
    } catch (error) {
      console.error('Update sector error:', error);
      return res.status(500).json({ error: 'Failed to update sector' });
    }
  }

  // DELETE: Smazat sektor
  if (req.method === 'DELETE') {
    try {
      // Ověřit vlastnictví
      const existingSector = await prisma.sector.findFirst({
        where: { id, userId },
      });

      if (!existingSector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      await prisma.sector.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Delete sector error:', error);
      return res.status(500).json({ error: 'Failed to delete sector' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

