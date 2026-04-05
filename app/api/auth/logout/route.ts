import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/src/lib/auth';
import { prisma } from '@/src/lib/prisma';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le refresh token du cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      // Supprimer le refresh token de la base de données
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });

    // Supprimer les cookies
    clearAuthCookies(response);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion' },
      { status: 500 },
    );
  }
}
