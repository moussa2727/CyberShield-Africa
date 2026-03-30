import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './src/lib/auth';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Routes publiques
  const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/api/auth/login', '/api/auth/register', '/api/auth/forgot-password', '/api/auth/reset-password'];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Vérifier si c'est une route API protégée
  if (path.startsWith('/api/')) {
    // Routes API publiques
    const publicApiPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/forgot-password', '/api/auth/reset-password'];
    if (publicApiPaths.includes(path)) {
      return NextResponse.next();
    }

    // Vérifier l'authentification pour les autres routes API
    let token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérifier le rôle admin pour certaines routes
    if (path.startsWith('/api/messages') && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Pages protégées
  const protectedPaths = ['/admin', '/messages'];
  if (protectedPaths.some(p => path.startsWith(p))) {
    let token = request.cookies.get('access_token')?.value;
    
    if (!token) {
      // Rediriger vers la page de connexion
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    const user = await verifyAccessToken(token);
    
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier le rôle admin pour /admin
    if (path.startsWith('/admin') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/messages/:path*',
    '/auth/:path*',
  ],
};