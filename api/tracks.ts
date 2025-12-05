import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';
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

// Validation schema for updating track status
const updateTrackSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, sectorId } = req.query;

  // Routes with ID - /api/tracks/[id]
  if (id && typeof id === 'string') {
    // GET: Detail trasy
    if (req.method === 'GET') {
      try {
        const track = await prisma.track.findUnique({
          where: { id },
          include: {
            sector: { select: { userId: true } },
          },
        });

        if (!track || track.sector.userId !== userId) {
          return res.status(404).json({ error: 'Track not found' });
        }

        return res.status(200).json(track);
      } catch (error) {
        console.error('Get track error:', error);
        return res.status(500).json({ error: 'Failed to get track' });
      }
    }

    // PUT: Aktualizovat stav trasy
    if (req.method === 'PUT') {
      try {
        const validation = updateTrackSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Validation error', 
            details: validation.error.errors 
          });
        }

        const existingTrack = await prisma.track.findUnique({
          where: { id },
          include: {
            sector: { select: { userId: true } },
          },
        });

        if (!existingTrack || existingTrack.sector.userId !== userId) {
          return res.status(404).json({ error: 'Track not found' });
        }

        const track = await prisma.track.update({
          where: { id },
          data: { status: validation.data.status },
        });

        return res.status(200).json(track);
      } catch (error) {
        console.error('Update track error:', error);
        return res.status(500).json({ error: 'Failed to update track' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Routes without ID - /api/tracks
  // GET: Seznam tras pro sektor
  if (req.method === 'GET') {
    try {
      if (!sectorId || typeof sectorId !== 'string') {
        return res.status(400).json({ error: 'sectorId is required' });
      }

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

      const { sectorId: bodySectorId, tracks } = validation.data;

      const sector = await prisma.sector.findFirst({
        where: { id: bodySectorId, userId },
      });

      if (!sector) {
        return res.status(404).json({ error: 'Sector not found' });
      }

      await prisma.track.deleteMany({
        where: { sectorId: bodySectorId },
      });

      await prisma.track.createMany({
        data: tracks.map(track => ({
          sectorId: bodySectorId,
          geometry: track.geometry,
          order: track.order,
          status: 'PENDING',
        })),
      });

      const newTracks = await prisma.track.findMany({
        where: { sectorId: bodySectorId },
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
      if (!sectorId || typeof sectorId !== 'string') {
        return res.status(400).json({ error: 'sectorId is required' });
      }

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

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
