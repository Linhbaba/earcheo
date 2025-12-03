import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// GeoJSON LineString validation
const geoJSONLineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.array(z.number()).length(2)).min(2),
});

// Validation schema for creating tracks (bulk)
const createTracksSchema = z.object({
  sectorId: z.string(),
  tracks: z.array(z.object({
    geometry: geoJSONLineStringSchema,
    order: z.number().int().nonnegative(),
  })),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Seznam tras pro sektor
  if (req.method === 'GET') {
    try {
      const { sectorId } = req.query;

      if (!sectorId || typeof sectorId !== 'string') {
        return res.status(400).json({ error: 'sectorId is required' });
      }

      // Ověřit vlastnictví sektoru
      const sector = await prisma.sector.findFirst({
        where: { id: sectorId, userId },
      });

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      const tracks = await prisma.track.findMany({
        where: { sectorId },
        orderBy: { order: 'asc' },
      });

      return res.status(200).json(tracks);
    } catch (error) {
      console.error('Get tracks error:', error);
      return res.status(500).json({ error: 'Failed to get tracks' });
    }
  }

  // POST: Vytvořit trasy (bulk) - nahradí existující
  if (req.method === 'POST') {
    try {
      const validation = createTracksSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { sectorId, tracks } = validation.data;

      // Ověřit vlastnictví sektoru
      const sector = await prisma.sector.findFirst({
        where: { id: sectorId, userId },
      });

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      // Smazat existující trasy
      await prisma.track.deleteMany({
        where: { sectorId },
      });

      // Vytvořit nové trasy
      const createdTracks = await prisma.track.createMany({
        data: tracks.map(track => ({
          sectorId,
          geometry: track.geometry,
          order: track.order,
          status: 'PENDING',
        })),
      });

      // Vrátit nově vytvořené trasy
      const newTracks = await prisma.track.findMany({
        where: { sectorId },
        orderBy: { order: 'asc' },
      });

      return res.status(201).json(newTracks);
    } catch (error) {
      console.error('Create tracks error:', error);
      return res.status(500).json({ error: 'Failed to create tracks' });
    }
  }

  // DELETE: Smazat všechny trasy sektoru
  if (req.method === 'DELETE') {
    try {
      const { sectorId } = req.query;

      if (!sectorId || typeof sectorId !== 'string') {
        return res.status(400).json({ error: 'sectorId is required' });
      }

      // Ověřit vlastnictví sektoru
      const sector = await prisma.sector.findFirst({
        where: { id: sectorId, userId },
      });

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      await prisma.track.deleteMany({
        where: { sectorId },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Delete tracks error:', error);
      return res.status(500).json({ error: 'Failed to delete tracks' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

