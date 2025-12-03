import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { withAuth } from '../_lib/auth';
import { z } from 'zod';

// Validation schema
const createFindingSchema = z.object({
  title: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  date: z.string().datetime(),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  
  // Extended fields (optional)
  condition: z.string().max(100).optional(),
  depth: z.number().positive().optional(),
  locationName: z.string().max(200).optional(),
  historicalContext: z.string().max(2000).optional(),
  material: z.string().max(100).optional(),
  
  visibility: z.enum(['PRIVATE', 'ANONYMOUS', 'PUBLIC']).default('PRIVATE'),
  isPublic: z.boolean().optional(), // Legacy
  equipmentIds: z.array(z.string()).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Seznam nálezů uživatele
  if (req.method === 'GET') {
    try {
      const { limit = '50', offset = '0', category, isPublic, visibility } = req.query;

      const where: any = { userId };
      
      if (category && typeof category === 'string') {
        where.category = category;
      }
      
      if (visibility && typeof visibility === 'string') {
        where.visibility = visibility;
      } else if (isPublic !== undefined) {
        // Legacy support
        where.visibility = isPublic === 'true' ? 'PUBLIC' : 'PRIVATE';
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
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

      // Transform equipment relation for easier frontend use
      const transformedFindings = findings.map(finding => ({
        ...finding,
        equipment: finding.equipment.map(fe => fe.equipment),
      }));

      return res.status(200).json(transformedFindings);
    } catch (error) {
      console.error('Get findings error:', error);
      return res.status(500).json({ error: 'Failed to get findings' });
    }
  }

  // POST: Vytvořit nový nález
  if (req.method === 'POST') {
    try {
      const validation = createFindingSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { equipmentIds, isPublic, ...findingData } = validation.data;

      const finding = await prisma.finding.create({
        data: {
          ...findingData,
          isPublic: findingData.visibility === 'PUBLIC', // Sync legacy field
          date: new Date(findingData.date),
          userId,
          equipment: equipmentIds && equipmentIds.length > 0 ? {
            create: equipmentIds.map(equipmentId => ({
              equipmentId,
            })),
          } : undefined,
        },
        include: {
          images: true,
          equipment: {
            include: {
              equipment: true,
            },
          },
        },
      });

      return res.status(201).json(finding);
    } catch (error) {
      console.error('Create finding error:', error);
      return res.status(500).json({ error: 'Failed to create finding' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);





