import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_lib/db';
import { withAuth } from '../../_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Feature ID is required' });
  }

  // POST - Toggle vote
  if (req.method === 'POST') {
    try {
      // Check if feature exists
      const feature = await prisma.featureRequest.findUnique({
        where: { id },
      });

      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      // Check if user already voted
      const existingVote = await prisma.featureVote.findUnique({
        where: {
          userId_featureId: {
            userId,
            featureId: id,
          },
        },
      });

      if (existingVote) {
        // Remove vote
        await prisma.featureVote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // Add vote
        await prisma.featureVote.create({
          data: {
            userId,
            featureId: id,
          },
        });
      }

      // Return updated feature with vote count and user vote status
      const updatedFeature = await prisma.featureRequest.findUnique({
        where: { id },
        include: {
          _count: {
            select: { votes: true },
          },
          votes: {
            where: { userId },
            select: { id: true },
          },
        },
      });

      if (!updatedFeature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      // Format response
      const response = {
        id: updatedFeature.id,
        title: updatedFeature.title,
        description: updatedFeature.description,
        category: updatedFeature.category,
        userId: updatedFeature.userId,
        votes: updatedFeature._count.votes,
        userVoted: updatedFeature.votes.length > 0,
        createdAt: updatedFeature.createdAt.toISOString(),
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Vote error:', error);
      return res.status(500).json({ error: 'Failed to vote' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
