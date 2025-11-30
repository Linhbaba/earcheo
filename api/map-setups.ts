import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';

const MAX_SETUPS = 10;

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  // Routes with ID - single setup operations
  if (id && typeof id === 'string') {
    const setup = await prisma.mapSetup.findUnique({ where: { id } });

    if (!setup) {
      return res.status(404).json({ error: 'Map setup not found' });
    }

    if (setup.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // PUT - Update
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

    // DELETE
    if (req.method === 'DELETE') {
      try {
        await prisma.mapSetup.delete({ where: { id } });
        return res.status(204).end();
      } catch (error) {
        console.error('Delete map setup error:', error);
        return res.status(500).json({ error: 'Failed to delete map setup' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Routes without ID - list/create operations
  
  // GET - List
  if (req.method === 'GET') {
    try {
      const setups = await prisma.mapSetup.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json(setups.map(s => ({
        id: s.id,
        name: s.name,
        config: s.config,
        createdAt: s.createdAt.toISOString(),
      })));
    } catch (error) {
      console.error('Get map setups error:', error);
      return res.status(500).json({ error: 'Failed to fetch map setups' });
    }
  }

  // POST - Create
  if (req.method === 'POST') {
    try {
      const { name, config } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      if (!config || typeof config !== 'object') {
        return res.status(400).json({ error: 'Config is required' });
      }

      const count = await prisma.mapSetup.count({ where: { userId } });
      if (count >= MAX_SETUPS) {
        return res.status(400).json({ error: `Maximum ${MAX_SETUPS} setups allowed` });
      }

      const setup = await prisma.mapSetup.create({
        data: { userId, name: name.trim(), config },
      });

      return res.status(201).json({
        id: setup.id,
        name: setup.name,
        config: setup.config,
        createdAt: setup.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Create map setup error:', error);
      return res.status(500).json({ error: 'Failed to create map setup' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

