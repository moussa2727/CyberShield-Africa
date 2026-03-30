import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/src/lib/prisma';
import { generateTokens, setAuthCookies } from '@/src/lib/auth';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le refresh token (cookie ou body)
    let refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      const body = await request.json().catch(() => ({}));
      refreshToken = body.refreshToken;
    }

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token requis' },
        { status: 401 }
      );
    }

    // Vérifier le refresh token dans la base de données
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Refresh token invalide ou expiré' },
        { status: 401 }
      );
    }

    // Vérifier le token JWT
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Refresh token invalide' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur correspond
    if (decoded.userId !== storedToken.userId) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur existe toujours
    const user = storedToken.user;
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Compte désactivé' },
        { status: 401 }
      );
    }

    // Générer de nouveaux tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Supprimer l'ancien refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id }
    });

    // Sauvegarder le nouveau refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

    // Mettre à jour les cookies
    setAuthCookies(response, accessToken, newRefreshToken);

    return response;

  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du rafraîchissement' },
      { status: 500 }
    );
  }
}