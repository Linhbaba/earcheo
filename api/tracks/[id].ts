import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// Validation schema for updating track status
const updateTrackSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Track ID is required' });
  }

  // GET: Detail trasy
  if (req.method === 'GET') {
    try {
      const track = await prisma.track.findUnique({
        where: { id },
        include: {
          sector: {
            select: { userId: true },
          },
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

      // Ověřit vlastnictví přes sektor
      const existingTrack = await prisma.track.findUnique({
        where: { id },
        include: {
          sector: {
            select: { userId: true },
          },
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

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

