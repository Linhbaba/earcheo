import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';
import { withAuth } from './_lib/auth';
import { z } from 'zod';

// Collector types enum values
const collectorTypeValues = ['NUMISMATIST', 'PHILATELIST', 'MILITARIA', 'DETECTORIST'] as const;

// Validation schema
const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  location: z.string().max(100).optional(),
  contact: z.string().max(100).optional(),
  experience: z.string().max(1000).optional(),
  collectorTypes: z.array(z.enum(collectorTypeValues)).optional(),
  onboardingCompleted: z.boolean().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url(),
  })).optional(),
  favoriteLocations: z.array(z.object({
    name: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    notes: z.string().optional(),
  })).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse, userId: string) {
  // GET: Získat profil
  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          socialLinks: true,
          favoriteLocations: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // POST: Vytvořit nový profil (při prvním přihlášení)
  if (req.method === 'POST') {
    try {
      const { email, nickname, avatarUrl } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await prisma.user.create({
        data: {
          id: userId,
          email,
          nickname,
          avatarUrl,
        },
      });

      return res.status(201).json(user);
    } catch (error: any) {
      console.error('Create profile error:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Profile already exists' });
      }
      
      return res.status(500).json({ error: 'Failed to create profile' });
    }
  }

  // PUT: Aktualizovat profil
  if (req.method === 'PUT') {
    try {
      const validation = updateProfileSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation error', 
          details: validation.error.errors 
        });
      }

      const { socialLinks, favoriteLocations, ...profileData } = validation.data;

      // Update main profile
      const user = await prisma.user.update({
        where: { id: userId },
        data: profileData,
      });
      
      console.log('[Profile Update] Updated data:', profileData);
      console.log('[Profile Update] Result:', user);

      // Update social links (replace all)
      if (socialLinks) {
        await prisma.socialLink.deleteMany({
          where: { userId },
        });

        if (socialLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: socialLinks
              .filter(link => link.platform && link.url)
              .map(link => ({
                platform: link.platform!,
                url: link.url!,
                userId,
              })),
          });
        }
      }

      // Update favorite locations (replace all)
      if (favoriteLocations) {
        await prisma.favoriteLocation.deleteMany({
          where: { userId },
        });

        if (favoriteLocations.length > 0) {
          await prisma.favoriteLocation.createMany({
            data: favoriteLocations
              .filter(loc => loc.name && loc.latitude !== undefined && loc.longitude !== undefined)
              .map(loc => ({
                name: loc.name!,
                latitude: loc.latitude!,
                longitude: loc.longitude!,
                notes: loc.notes,
                userId,
              })),
          });
        }
      }

      // Return updated profile
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          socialLinks: true,
          favoriteLocations: true,
        },
      });

      return res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withAuth(handler);





