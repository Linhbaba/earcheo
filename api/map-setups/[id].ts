import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid setup ID' });
  }

  // Verify ownership
  const setup = await prisma.mapSetup.findUnique({
    where: { id },
  });

  if (!setup) {
    return res.status(404).json({ error: 'Map setup not found' });
  }

  if (setup.userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // PUT - Update map setup
  if (req.method === 'PUT') {
    try {
      const { name, config } = req.body;

      if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (config !== undefined && typeof config !== 'object') {
        return res.status(400).json({ error: 'Invalid config' });
      }

      const updated = await prisma.mapSetup.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(config !== undefined && { config }),
        },
      });

      return res.status(200).json({
        id: updated.id,
        name: updated.name,
        config: updated.config,
        createdAt: updated.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Update map setup error:', error);
      return res.status(500).json({ error: 'Failed to update map setup' });
    }
  }

  // DELETE - Delete map setup
  if (req.method === 'DELETE') {
    try {
      await prisma.mapSetup.delete({
        where: { id },
      });

      return res.status(204).end();
    } catch (error) {
      console.error('Delete map setup error:', error);
      return res.status(500).json({ error: 'Failed to delete map setup' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

