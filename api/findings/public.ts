import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { FindingVisibility } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '50', offset = '0', category } = req.query;

    const where: any = {
      visibility: {
        in: [FindingVisibility.PUBLIC, FindingVisibility.ANONYMOUS],
      },
    };

    if (category && typeof category === 'string') {
      where.category = category;
    }

    const findings = await prisma.finding.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        equipment: {
          include: {
            equipment: true,
          },
        },
        user: {
          select: {
            id: true,
            nickname: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    // Transform findings to respect privacy
    const sanitizedFindings = findings.map(finding => {
      const isAnonymous = finding.visibility === 'ANONYMOUS';
      return {
        ...finding,
        user: isAnonymous ? null : finding.user, // Hide user for anonymous
        equipment: finding.equipment.map(fe => fe.equipment),
      };
    });

    return res.status(200).json(sanitizedFindings);
  } catch (error) {
    console.error('Get public findings error:', error);
    return res.status(500).json({ error: 'Failed to get public findings' });
  }
}

