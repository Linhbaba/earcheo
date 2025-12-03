import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// GeoJSON Polygon validation
const geoJSONPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()).length(2))).min(1),
});

// Validation schema for creating sector
const createSectorSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  geometry: geoJSONPolygonSchema,
  stripWidth: z.number().positive().default(3),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Seznam sektorů uživatele
  if (req.method === 'GET') {
    try {
      const { limit = '50', offset = '0' } = req.query;

      const sectors = await prisma.sector.findMany({
        where: { userId },
        include: {
          tracks: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      return res.status(200).json(sectors);
    } catch (error) {
      console.error('Get sectors error:', error);
      return res.status(500).json({ error: 'Failed to get sectors' });
    }
  }

  // POST: Vytvořit nový sektor
  if (req.method === 'POST') {
    try {
      const validation = createSectorSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { name, description, geometry, stripWidth } = validation.data;

      const sector = await prisma.sector.create({
        data: {
          name,
          description,
          geometry,
          stripWidth,
          userId,
        },
        include: {
          tracks: true,
        },
      });

      return res.status(201).json(sector);
    } catch (error) {
      console.error('Create sector error:', error);
      return res.status(500).json({ error: 'Failed to create sector' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

