import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_lib/db';

/**
 * GET /api/stats - Veřejné statistiky platformy
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Paralelní dotazy pro rychlost
    const [
      totalUsers, 
      totalFindings, 
      publicFindings, 
      totalEquipment,
      coinCount,
      stampCount,
      militaryCount,
      terrainCount,
      generalCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.finding.count(),
      prisma.finding.count({ where: { isPublic: true } }),
      prisma.equipment.count(),
      prisma.finding.count({ where: { findingType: 'COIN' } }),
      prisma.finding.count({ where: { findingType: 'STAMP' } }),
      prisma.finding.count({ where: { findingType: 'MILITARY' } }),
      prisma.finding.count({ where: { findingType: 'TERRAIN' } }),
      prisma.finding.count({ where: { findingType: 'GENERAL' } }),
    ]);

    const stats = {
      totalUsers,
      totalFindings,
      publicFindings,
      totalEquipment,
      byType: {
        coins: coinCount,
        stamps: stampCount,
        military: militaryCount,
        terrain: terrainCount,
        general: generalCount,
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache na 5 minut
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

