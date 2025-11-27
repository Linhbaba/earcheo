import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';

// GET handler - public (no auth required)
async function getFeatures(req: VercelRequest, res: VercelResponse, userId?: string) {
  try {
    const features = await prisma.featureRequest.findMany({
      include: {
        _count: {
          select: { votes: true },
        },
        votes: userId ? {
          where: { userId },
          select: { id: true },
        } : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response with new schema
    const formatted = features.map(f => ({
      id: f.id,
      title: f.title,
      description: f.description,
      category: f.category,
      userId: f.userId,
      votes: f._count.votes,
      userVoted: userId ? (f.votes && f.votes.length > 0) : false,
      createdAt: f.createdAt.toISOString(),
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Get features error:', error);
    return res.status(500).json({ error: 'Failed to fetch features' });
  }
}

// Protected handler for authenticated actions
async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET - List all feature requests (delegate to public handler)
  if (req.method === 'GET') {
    return getFeatures(req, res, userId);
  }

  // POST - Create new feature request
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
        include: {
          _count: {
            select: { votes: true },
          },
        },
      });

      // Auto-vote for own feature
      await prisma.featureVote.create({
        data: {
          userId,
          featureId: feature.id,
        },
      });

      return res.status(201).json({
        id: feature.id,
        title: feature.title,
        description: feature.description,
        category: feature.category,
        userId: feature.userId,
        votes: 1,
        userVoted: true,
        createdAt: feature.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Create feature error:', error);
      return res.status(500).json({ error: 'Failed to create feature' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Main export - handle both public and protected requests
export default async function(req: VercelRequest, res: VercelResponse) {
  // Allow GET without authentication
  if (req.method === 'GET') {
    // Try to get userId from token if available
    try {
      return await withAuth(handler)(req, res);
    } catch (err) {
      // No token or invalid token - continue as anonymous
      return getFeatures(req, res);
    }
  }
  
  // All other methods require authentication
  return withAuth(handler)(req, res);
}

