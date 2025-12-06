import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';
import { z } from 'zod';
import { deleteImage } from './_lib/image-processor';

// Validation schema for creating
const createFindingSchema = z.object({
  title: z.string().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  date: z.string().datetime(),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  
  // Typ nálezu
  findingType: z.enum(['COIN', 'STAMP', 'MILITARY', 'TERRAIN', 'GENERAL']).default('GENERAL'),
  
  // Existující rozšířená pole
  condition: z.string().max(100).optional(),
  depth: z.number().positive().optional(),
  locationName: z.string().max(200).optional(),
  historicalContext: z.string().max(2000).optional(),
  material: z.string().max(100).optional(),
  
  // Univerzální pole
  period: z.string().max(100).optional(),
  periodFrom: z.number().int().optional(),
  periodTo: z.number().int().optional(),
  dimensions: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  
  // Specifická pole - COIN
  denomination: z.string().max(100).optional(),
  mintYear: z.number().int().optional(),
  mint: z.string().max(100).optional(),
  catalogNumber: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
  
  // Specifická pole - STAMP
  stampYear: z.number().int().optional(),
  stampCatalogNumber: z.string().max(100).optional(),
  perforation: z.string().max(50).optional(),
  printType: z.string().max(100).optional(),
  cancellation: z.string().max(100).optional(),
  
  // Specifická pole - MILITARY
  army: z.string().max(100).optional(),
  conflict: z.string().max(100).optional(),
  unit: z.string().max(100).optional(),
  authenticity: z.string().max(50).optional(),
  
  // Specifická pole - TERRAIN
  detectorSignal: z.string().max(100).optional(),
  landType: z.string().max(100).optional(),
  soilConditions: z.string().max(100).optional(),
  
  // Provenience
  origin: z.string().max(100).optional(),
  acquisitionMethod: z.string().max(50).optional(),
  estimatedValue: z.string().max(100).optional(),
  storageLocation: z.string().max(200).optional(),
  
  visibility: z.enum(['PRIVATE', 'ANONYMOUS', 'PUBLIC']).default('PRIVATE'),
  isPublic: z.boolean().optional(),
  equipmentIds: z.array(z.string()).optional(),
  customFieldValues: z.array(z.object({
    customFieldId: z.string(),
    value: z.string(),
  })).optional(),
});

// Validation schema for updating
const updateFindingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  date: z.string().datetime().optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  
  // Typ nálezu
  findingType: z.enum(['COIN', 'STAMP', 'MILITARY', 'TERRAIN', 'GENERAL']).optional(),
  
  // Existující rozšířená pole
  condition: z.string().max(100).optional(),
  depth: z.number().positive().optional(),
  locationName: z.string().max(200).optional(),
  historicalContext: z.string().max(2000).optional(),
  material: z.string().max(100).optional(),
  
  // Univerzální pole
  period: z.string().max(100).optional(),
  periodFrom: z.number().int().optional(),
  periodTo: z.number().int().optional(),
  dimensions: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  
  // Specifická pole - COIN
  denomination: z.string().max(100).optional(),
  mintYear: z.number().int().optional(),
  mint: z.string().max(100).optional(),
  catalogNumber: z.string().max(100).optional(),
  grade: z.string().max(50).optional(),
  
  // Specifická pole - STAMP
  stampYear: z.number().int().optional(),
  stampCatalogNumber: z.string().max(100).optional(),
  perforation: z.string().max(50).optional(),
  printType: z.string().max(100).optional(),
  cancellation: z.string().max(100).optional(),
  
  // Specifická pole - MILITARY
  army: z.string().max(100).optional(),
  conflict: z.string().max(100).optional(),
  unit: z.string().max(100).optional(),
  authenticity: z.string().max(50).optional(),
  
  // Specifická pole - TERRAIN
  detectorSignal: z.string().max(100).optional(),
  landType: z.string().max(100).optional(),
  soilConditions: z.string().max(100).optional(),
  
  // Provenience
  origin: z.string().max(100).optional(),
  acquisitionMethod: z.string().max(50).optional(),
  estimatedValue: z.string().max(100).optional(),
  storageLocation: z.string().max(200).optional(),
  
  visibility: z.enum(['PRIVATE', 'ANONYMOUS', 'PUBLIC']).optional(),
  isPublic: z.boolean().optional(),
  equipmentIds: z.array(z.string()).optional(),
  customFieldValues: z.array(z.object({
    customFieldId: z.string(),
    value: z.string(),
  })).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  // Routes with ID - /api/findings/[id]
  if (id && typeof id === 'string') {
    // GET: Detail nálezu
    if (req.method === 'GET') {
      try {
        const finding = await prisma.finding.findFirst({
          where: { id, userId },
          include: {
            images: { orderBy: { order: 'asc' } },
            equipment: { include: { equipment: true } },
            customFieldValues: { include: { customField: true } },
          },
        });

        if (!finding) {
          return res.status(404).json({ error: 'Finding not found' });
        }

        return res.status(200).json({
          ...finding,
          equipment: finding.equipment.map(fe => fe.equipment),
        });
      } catch (error) {
        console.error('Get finding error:', error);
        return res.status(500).json({ error: 'Failed to get finding' });
      }
    }

    // PUT: Upravit nález
    if (req.method === 'PUT') {
      try {
        const validation = updateFindingSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Validation error', 
            details: validation.error.errors 
          });
        }

        const { equipmentIds, customFieldValues, date, isPublic, ...findingData } = validation.data;

        const updateData: Record<string, unknown> = {
          ...findingData,
          date: date ? new Date(date) : undefined,
        };

        if (findingData.visibility) {
          updateData.isPublic = findingData.visibility === 'PUBLIC';
        } else if (isPublic !== undefined) {
          updateData.visibility = isPublic ? 'PUBLIC' : 'PRIVATE';
          updateData.isPublic = isPublic;
        }

        const finding = await prisma.finding.updateMany({
          where: { id, userId },
          data: updateData,
        });

        if (finding.count === 0) {
          return res.status(404).json({ error: 'Finding not found' });
        }

        // Aktualizace vybavení
        if (equipmentIds) {
          await prisma.findingEquipment.deleteMany({
            where: { findingId: id },
          });

          if (equipmentIds.length > 0) {
            await prisma.findingEquipment.createMany({
              data: equipmentIds.map(equipmentId => ({
                findingId: id,
                equipmentId,
              })),
            });
          }
        }

        // Aktualizace vlastních polí
        if (customFieldValues) {
          // Smazat existující hodnoty
          await prisma.customFieldValue.deleteMany({
            where: { findingId: id },
          });

          // Vytvořit nové hodnoty
          if (customFieldValues.length > 0) {
            await prisma.customFieldValue.createMany({
              data: customFieldValues.map(cfv => ({
                findingId: id,
                customFieldId: cfv.customFieldId,
                value: cfv.value,
              })),
            });
          }
        }

        const updated = await prisma.finding.findUnique({
          where: { id },
          include: {
            images: { orderBy: { order: 'asc' } },
            equipment: { include: { equipment: true } },
            customFieldValues: { include: { customField: true } },
          },
        });

        return res.status(200).json(updated);
      } catch (error) {
        console.error('Update finding error:', error);
        return res.status(500).json({ error: 'Failed to update finding' });
      }
    }

    // DELETE: Smazat nález
    if (req.method === 'DELETE') {
      try {
        const finding = await prisma.finding.findFirst({
          where: { id, userId },
          include: { images: true },
        });

        if (!finding) {
          return res.status(404).json({ error: 'Finding not found' });
        }

        await Promise.all(
          finding.images.map(img => 
            deleteImage(img.originalUrl, img.thumbnailUrl, img.mediumUrl)
          )
        );

        await prisma.finding.delete({
          where: { id },
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Delete finding error:', error);
        return res.status(500).json({ error: 'Failed to delete finding' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Routes without ID - /api/findings
  // GET: Seznam nálezů uživatele
  if (req.method === 'GET') {
    try {
      const { limit = '50', offset = '0', category, isPublic, visibility } = req.query;

      const where: Record<string, unknown> = { userId };
      
      if (category && typeof category === 'string') {
        where.category = category;
      }
      
      if (visibility && typeof visibility === 'string') {
        where.visibility = visibility;
      } else if (isPublic !== undefined) {
        where.visibility = isPublic === 'true' ? 'PUBLIC' : 'PRIVATE';
      }

      const findings = await prisma.finding.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          equipment: { include: { equipment: true } },
          customFieldValues: { include: { customField: true } },
        },
        orderBy: { date: 'desc' },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      });

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

      const { equipmentIds, isPublic, customFieldValues, ...findingData } = validation.data;

      const finding = await prisma.finding.create({
        data: {
          // Základní pole
          title: findingData.title,
          latitude: findingData.latitude,
          longitude: findingData.longitude,
          date: new Date(findingData.date),
          description: findingData.description,
          category: findingData.category,
          findingType: findingData.findingType,
          
          // Existující rozšířená pole
          condition: findingData.condition,
          depth: findingData.depth,
          locationName: findingData.locationName,
          historicalContext: findingData.historicalContext,
          material: findingData.material,
          
          // Univerzální pole
          period: findingData.period,
          periodFrom: findingData.periodFrom,
          periodTo: findingData.periodTo,
          dimensions: findingData.dimensions,
          weight: findingData.weight,
          
          // Specifická pole - COIN
          denomination: findingData.denomination,
          mintYear: findingData.mintYear,
          mint: findingData.mint,
          catalogNumber: findingData.catalogNumber,
          grade: findingData.grade,
          
          // Specifická pole - STAMP
          stampYear: findingData.stampYear,
          stampCatalogNumber: findingData.stampCatalogNumber,
          perforation: findingData.perforation,
          printType: findingData.printType,
          cancellation: findingData.cancellation,
          
          // Specifická pole - MILITARY
          army: findingData.army,
          conflict: findingData.conflict,
          unit: findingData.unit,
          authenticity: findingData.authenticity,
          
          // Specifická pole - TERRAIN
          detectorSignal: findingData.detectorSignal,
          landType: findingData.landType,
          soilConditions: findingData.soilConditions,
          
          // Provenience
          origin: findingData.origin,
          acquisitionMethod: findingData.acquisitionMethod,
          estimatedValue: findingData.estimatedValue,
          storageLocation: findingData.storageLocation,
          
          visibility: findingData.visibility,
          isPublic: findingData.visibility === 'PUBLIC',
          userId,
          
          // Relace - vybavení
          equipment: equipmentIds && equipmentIds.length > 0 ? {
            create: equipmentIds.map(equipmentId => ({
              equipmentId,
            })),
          } : undefined,
          
          // Relace - vlastní pole
          customFieldValues: customFieldValues && customFieldValues.length > 0 ? {
            create: customFieldValues.map(cfv => ({
              customFieldId: cfv.customFieldId,
              value: cfv.value,
            })),
          } : undefined,
        },
        include: {
          images: true,
          equipment: { include: { equipment: true } },
          customFieldValues: { include: { customField: true } },
        },
      });

      return res.status(201).json(finding);
    } catch (error) {
      console.error('Create finding error:', error);
      return res.status(500).json({ error: 'Failed to create finding' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);

