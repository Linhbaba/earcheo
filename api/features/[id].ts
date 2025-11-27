import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Feature ID is required' });
  }

  // DELETE - Delete feature request (only by author)
  if (req.method === 'DELETE') {
    try {
      const feature = await prisma.featureRequest.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      if (feature.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await prisma.featureRequest.delete({
        where: { id },
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete feature error:', error);
      return res.status(500).json({ error: 'Failed to delete feature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
