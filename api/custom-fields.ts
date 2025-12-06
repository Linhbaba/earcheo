import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';
import { z } from 'zod';

// Maximální počet vlastních polí na uživatele
const MAX_CUSTOM_FIELDS = 10;

// Validation schema for creating
const createCustomFieldSchema = z.object({
  name: z.string().min(1).max(100),
  fieldType: z.enum(['text', 'number', 'date', 'select']),
  options: z.string().max(500).optional(), // Pro select: "Ano,Ne,Možná"
  icon: z.string().max(50).optional(),
});

// Validation schema for updating
const updateCustomFieldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  fieldType: z.enum(['text', 'number', 'date', 'select']).optional(),
  options: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).optional(),
});

// Validation schema for reordering
const reorderSchema = z.object({
  orderedIds: z.array(z.string()),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  const { id } = req.query;

  // Routes with ID - /api/custom-fields/[id]
  if (id && typeof id === 'string') {
    // GET: Detail vlastního pole
    if (req.method === 'GET') {
      try {
        const customField = await prisma.customField.findFirst({
          where: { id, userId },
        });

        if (!customField) {
          return res.status(404).json({ error: 'Custom field not found' });
        }

        return res.status(200).json(customField);
      } catch (error) {
        console.error('Get custom field error:', error);
        return res.status(500).json({ error: 'Failed to get custom field' });
      }
    }

    // PUT: Upravit vlastní pole
    if (req.method === 'PUT') {
      try {
        const validation = updateCustomFieldSchema.safeParse(req.body);
        
        if (!validation.success) {
          return res.status(400).json({ 
            error: 'Validation error', 
            details: validation.error.errors 
          });
        }

        const existing = await prisma.customField.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return res.status(404).json({ error: 'Custom field not found' });
        }

        const updated = await prisma.customField.update({
          where: { id },
          data: validation.data,
        });

        return res.status(200).json(updated);
      } catch (error) {
        console.error('Update custom field error:', error);
        return res.status(500).json({ error: 'Failed to update custom field' });
      }
    }

    // DELETE: Smazat vlastní pole
    if (req.method === 'DELETE') {
      try {
        const existing = await prisma.customField.findFirst({
          where: { id, userId },
        });

        if (!existing) {
          return res.status(404).json({ error: 'Custom field not found' });
        }

        // Smazání pole smaže i všechny jeho hodnoty (onDelete: Cascade)
        await prisma.customField.delete({
          where: { id },
        });

        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Delete custom field error:', error);
        return res.status(500).json({ error: 'Failed to delete custom field' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Routes without ID - /api/custom-fields

  // GET: Seznam vlastních polí uživatele
  if (req.method === 'GET') {
    try {
      const customFields = await prisma.customField.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });

      return res.status(200).json(customFields);
    } catch (error) {
      console.error('Get custom fields error:', error);
      return res.status(500).json({ error: 'Failed to get custom fields' });
    }
  }

  // POST: Vytvořit nové vlastní pole
  if (req.method === 'POST') {
    try {
      // Kontrola limitu
      const count = await prisma.customField.count({
        where: { userId },
      });

      if (count >= MAX_CUSTOM_FIELDS) {
        return res.status(400).json({ 
          error: `Maximum number of custom fields (${MAX_CUSTOM_FIELDS}) reached` 
        });
      }

      const validation = createCustomFieldSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      // Najít nejvyšší order
      const maxOrder = await prisma.customField.findFirst({
        where: { userId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const customField = await prisma.customField.create({
        data: {
          name: validation.data.name,
          fieldType: validation.data.fieldType,
          options: validation.data.options,
          icon: validation.data.icon,
          order: (maxOrder?.order ?? -1) + 1,
          user: { connect: { id: userId } },
        },
      });

      return res.status(201).json(customField);
    } catch (error) {
      console.error('Create custom field error:', error);
      return res.status(500).json({ error: 'Failed to create custom field' });
    }
  }

  // PATCH: Přeuspořádat vlastní pole
  if (req.method === 'PATCH') {
    try {
      const validation = reorderSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { orderedIds } = validation.data;

      // Ověřit, že všechna ID patří uživateli
      const existingFields = await prisma.customField.findMany({
        where: { userId },
        select: { id: true },
      });

      const existingIds = new Set(existingFields.map(f => f.id));
      const allIdsValid = orderedIds.every(id => existingIds.has(id));

      if (!allIdsValid) {
        return res.status(400).json({ error: 'Invalid field IDs' });
      }

      // Aktualizovat pořadí
      await Promise.all(
        orderedIds.map((id, index) =>
          prisma.customField.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      const customFields = await prisma.customField.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });

      return res.status(200).json(customFields);
    } catch (error) {
      console.error('Reorder custom fields error:', error);
      return res.status(500).json({ error: 'Failed to reorder custom fields' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);
