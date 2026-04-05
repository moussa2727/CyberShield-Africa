import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { env } from './env';

const JWT_SECRET = env.JWT_SECRET;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET;
const JWT_PASSWORD_RESET_SECRET = env.JWT_PASSWORD_RESET_SECRET;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh' | 'password_reset';
}

interface PasswordResetTokenPayload {
  userId: string;
  email: string;
  type: 'password_reset';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

// Configuration des cookies SameSite
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const, // Utilise 'strict' pour une meilleure sécurité
  path: '/',
};

const SESSION_FLAG_COOKIE = 'has_session';

export function generateTokens(user: any, rememberMe: boolean = false) {
  const accessExpiresIn = rememberMe ? '7d' : '1d';
  const refreshExpiresIn = rememberMe ? '30d' : '7d';

  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    } as TokenPayload,
    JWT_SECRET,
    { expiresIn: accessExpiresIn },
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'refresh',
    } as TokenPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: refreshExpiresIn },
  );

  return { accessToken, refreshToken };
}

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean = false,
) {
  const maxAgeAccess = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 jours ou 1 jour
  const maxAgeRefresh = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 jours ou 7 jours

  // Cookie pour l'access token
  response.cookies.set('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: maxAgeAccess,
  });

  // Cookie pour le refresh token
  response.cookies.set('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: maxAgeRefresh,
  });

  // Indicateur côté client (non sensible) pour éviter les appels /me inutiles
  response.cookies.set(SESSION_FLAG_COOKIE, '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: maxAgeRefresh,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete(SESSION_FLAG_COOKIE);
}

export async function verifyAccessToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    if (decoded.type !== 'access') {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;

    if (decoded.type !== 'refresh') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware helper pour vérifier l'authentification dans les routes API
export async function getAuthenticatedUser(request: Request) {
  // Essayer de récupérer le token des cookies d'abord
  let token: string | undefined;

  // Pour Next.js, les cookies sont dans l'URL ou dans les headers
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((cookie) => {
        const [name, ...rest] = cookie.split('=');
        return [name, rest.join('=')];
      }),
    );
    token = cookies['access_token'];
  }

  // Si pas de token dans les cookies, essayer le header Authorization
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  return await verifyAccessToken(token);
}

// Vérifier si l'utilisateur est admin
export async function isAdmin(request: Request) {
  const user = await getAuthenticatedUser(request);
  return user?.role === 'ADMIN';
}

// Middleware de protection pour les routes admin
export async function requireAdmin(request: Request) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      authorized: false,
      error: 'Non authentifié',
      status: 401,
    };
  }

  if (user.role !== 'ADMIN') {
    return {
      authorized: false,
      error: 'Accès non autorisé',
      status: 403,
    };
  }

  return {
    authorized: true,
    user,
  };
}

// Fonction pour générer un token de réinitialisation de mot de passe
export function generateToken(payload: any, options?: { expiresIn?: string }) {
  const secret = payload.type === 'password_reset' ? JWT_PASSWORD_RESET_SECRET : JWT_SECRET;
  const expiresIn = options?.expiresIn || '1h';

  // Typage explicite pour éviter les erreurs TypeScript
  const signOptions: jwt.SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  };

  return jwt.sign(payload, secret, signOptions);
}

// Fonction pour vérifier un token (générique)
export function verifyToken(token: string): any {
  try {
    // Essayer d'abord avec le secret de réinitialisation
    const decoded = jwt.verify(token, JWT_PASSWORD_RESET_SECRET) as any;
    return decoded;
  } catch (error) {
    try {
      // Essayer avec le secret normal
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return decoded;
    } catch (error2) {
      return null;
    }
  }
}

// Fonction pour hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}
