import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth, authMiddleware } from './_lib/auth';

// GET handler - public (no auth required)
async function getFeatures(req: VercelRequest, res: VercelResponse, userId?: string) {
  try {
    const features = await prisma.featureRequest.findMany({
      include: {
        _count: { select: { votes: true } },
        votes: userId ? { where: { userId }, select: { id: true } } : false,
        user: { select: { nickname: true } },
        comments: {
          include: {
            user: { select: { id: true, nickname: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      category: f.category,
      status: f.status,
      authorId: f.userId,
      authorName: f.user.nickname || 'Anonym',
      votes: f._count.votes,
      hasVoted: userId ? (f.votes && f.votes.length > 0) : false,
      createdAt: f.createdAt.toISOString(),
      comments: f.comments.map(c => ({
        id: c.id,
        content: c.content,
        authorId: c.userId,
        authorName: c.user.nickname || 'Anonym',
        createdAt: c.createdAt.toISOString(),
      })),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Get features error:', error);
    return res.status(500).json({ error: 'Failed to fetch features' });
  }
}

// Protected handler
async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id, action } = req.query;

  // VOTE action: POST /api/features?id=xxx&action=vote
  if (id && typeof id === 'string' && action === 'vote' && req.method === 'POST') {
    try {
      const feature = await prisma.featureRequest.findUnique({ where: { id } });
      if (!feature) return res.status(404).json({ error: 'Feature not found' });

      const existingVote = await prisma.featureVote.findUnique({
        where: { userId_featureId: { userId, featureId: id } },
      });

      if (existingVote) {
        await prisma.featureVote.delete({ where: { id: existingVote.id } });
      } else {
        await prisma.featureVote.create({ data: { userId, featureId: id } });
      }

      const updated = await prisma.featureRequest.findUnique({
        where: { id },
        include: {
          _count: { select: { votes: true } },
          votes: { where: { userId }, select: { id: true } },
          user: { select: { nickname: true } },
          comments: {
            include: { user: { select: { id: true, nickname: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!updated) return res.status(404).json({ error: 'Feature not found' });

      return res.status(200).json({
        id: updated.id,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        status: updated.status,
        authorId: updated.userId,
        authorName: updated.user.nickname || 'Anonym',
        votes: updated._count.votes,
        hasVoted: updated.votes.length > 0,
        createdAt: updated.createdAt.toISOString(),
        comments: updated.comments.map(c => ({
          id: c.id,
          content: c.content,
          authorId: c.userId,
          authorName: c.user.nickname || 'Anonym',
          createdAt: c.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Vote error:', error);
      return res.status(500).json({ error: 'Failed to vote' });
    }
  }

  // COMMENT action: POST /api/features?id=xxx&action=comment
  if (id && typeof id === 'string' && action === 'comment' && req.method === 'POST') {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      const feature = await prisma.featureRequest.findUnique({ where: { id } });
      if (!feature) return res.status(404).json({ error: 'Feature not found' });

      await prisma.featureComment.create({
        data: {
          featureId: id,
          userId,
          content: content.trim(),
        },
      });

      // Return updated feature with comments
      const updated = await prisma.featureRequest.findUnique({
        where: { id },
        include: {
          _count: { select: { votes: true } },
          votes: { where: { userId }, select: { id: true } },
          user: { select: { nickname: true } },
          comments: {
            include: { user: { select: { id: true, nickname: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!updated) return res.status(404).json({ error: 'Feature not found' });

      return res.status(200).json({
        id: updated.id,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        status: updated.status,
        authorId: updated.userId,
        authorName: updated.user.nickname || 'Anonym',
        votes: updated._count.votes,
        hasVoted: updated.votes.length > 0,
        createdAt: updated.createdAt.toISOString(),
        comments: updated.comments.map(c => ({
          id: c.id,
          content: c.content,
          authorId: c.userId,
          authorName: c.user.nickname || 'Anonym',
          createdAt: c.createdAt.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Comment error:', error);
      return res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  // DELETE: DELETE /api/features?id=xxx
  if (id && typeof id === 'string' && req.method === 'DELETE') {
    try {
      const feature = await prisma.featureRequest.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!feature) return res.status(404).json({ error: 'Feature not found' });
      if (feature.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

      await prisma.featureRequest.delete({ where: { id } });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete feature error:', error);
      return res.status(500).json({ error: 'Failed to delete feature' });
    }
  }

  // GET - List (delegate to public handler with userId)
  if (req.method === 'GET') {
    return getFeatures(req, res, userId);
  }

  // POST - Create new feature
  if (req.method === 'POST') {
    try {
      const { title, description, category } = req.body;

      if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Title is required' });
      }

      const feature = await prisma.featureRequest.create({
        data: {
          userId,
          title: title.trim(),
          description: description?.trim() || '',
          category: category?.trim() || 'Ostatní',
        },
      });

      // Auto-vote
      await prisma.featureVote.create({ data: { userId, featureId: feature.id } });

      // Get user nickname
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { nickname: true } });

      return res.status(201).json({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        category: feature.category,
        status: feature.status,
        authorId: feature.userId,
        authorName: user?.nickname || 'Anonym',
        votes: 1,
        hasVoted: true,
        createdAt: feature.createdAt.toISOString(),
        comments: [],
      });
    } catch (error) {
      console.error('Create feature error:', error);
      return res.status(500).json({ error: 'Failed to create feature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper to extract userId without throwing
async function tryGetUserId(req: VercelRequest): Promise<string | undefined> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as any, {} as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return (req as any).auth?.sub;
  } catch {
    return undefined;
  }
}

// Main export
export default async function(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const userId = await tryGetUserId(req);
    return getFeatures(req, res, userId);
  }
  
  return withAuth(handler)(req, res);
}

