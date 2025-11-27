import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET - List all feature requests
  if (req.method === 'GET') {
    try {
      const features = await prisma.featureRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
          votes: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Format response
      const formatted = features.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        status: f.status,
        authorId: f.userId,
        authorName: f.user.nickname || f.user.email,
        votes: f.votes.length,
        votedBy: f.votes.map(v => v.userId),
        hasVoted: f.votes.some(v => v.userId === userId),
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Get features error:', error);
      return res.status(500).json({ error: 'Failed to fetch features' });
    }
  }

  // POST - Create new feature request
  if (req.method === 'POST') {
    try {
      const { title, description } = req.body;

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const feature = await prisma.featureRequest.create({
        data: {
          userId,
          title: title.trim(),
          description: description?.trim() || '',
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
          votes: true,
        },
      });

      // Auto-vote for own feature
      const vote = await prisma.featureVote.create({
        data: {
          userId,
          featureId: feature.id,
        },
      });

      return res.status(201).json({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        status: feature.status,
        authorId: feature.userId,
        authorName: feature.user.nickname || feature.user.email,
        votes: 1,
        votedBy: [userId],
        hasVoted: true,
        createdAt: feature.createdAt.toISOString(),
        updatedAt: feature.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Create feature error:', error);
      return res.status(500).json({ error: 'Failed to create feature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

