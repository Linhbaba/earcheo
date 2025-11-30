import type { VercelRequest, VercelResponse } from '@vercel/node';
import { expressjwt as jwt, GetVerificationKey } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { prisma } from './db';

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'dev-jsfkqesvxjhvsnkd.us.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.earcheo.cz';
const AUTH0_ISSUER = process.env.AUTH0_ISSUER || `https://${AUTH0_DOMAIN}/`;

// JWT verification middleware
export const authMiddleware = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${AUTH0_ISSUER}.well-known/jwks.json`,
  }) as GetVerificationKey,
  audience: AUTH0_AUDIENCE,
  issuer: AUTH0_ISSUER,
  algorithms: ['RS256'],
});

// Helper to extract user ID from Auth0 token
export function getUserId(req: VercelRequest): string {
  const auth = (req as any).auth;
  if (!auth || !auth.sub) {
    throw new Error('Unauthorized: No user ID found');
  }
  return auth.sub;
}

// Helper to extract user info from Auth0 token
function getUserInfo(req: VercelRequest): { sub: string; email?: string; nickname?: string; picture?: string } {
  const auth = (req as any).auth;
  return {
    sub: auth.sub,
    email: auth.email || auth['https://earcheo.cz/email'],
    nickname: auth.nickname || auth['https://earcheo.cz/nickname'],
    picture: auth.picture || auth['https://earcheo.cz/picture'],
  };
}

// Ensure user exists in database (auto-create if needed)
async function ensureUserExists(req: VercelRequest, userId: string): Promise<void> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      const userInfo = getUserInfo(req);
      
      // Create user profile automatically
      await prisma.user.create({
        data: {
          id: userId,
          email: userInfo.email || `${userId}@unknown.com`,
          nickname: userInfo.nickname,
          avatarUrl: userInfo.picture,
        },
      });
      
      console.log(`Auto-created profile for user: ${userId}`);
    }
  } catch (error: any) {
    // Ignore duplicate errors (race condition)
    if (error.code !== 'P2002') {
      console.error('Error ensuring user exists:', error);
    }
  }
}

// Wrapper for protected API routes
export function withAuth(
  handler: (req: VercelRequest, res: VercelResponse, userId: string) => Promise<void | VercelResponse>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Run JWT verification
      await new Promise<void>((resolve, reject) => {
        authMiddleware(req as any, res as any, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const userId = getUserId(req);
      
      // Ensure user profile exists in database (auto-create if needed)
      await ensureUserExists(req, userId);
      
      await handler(req, res, userId);
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid or missing token' });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

