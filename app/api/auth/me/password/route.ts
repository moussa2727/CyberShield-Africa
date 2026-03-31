import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/src/lib/prisma';
import { verifyAccessToken } from '@/src/lib/auth';
import { updatePasswordSchema } from '@/src/validators/auth/update-password.validator';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function getTokenFromRequest(request: NextRequest) {
  let token = request.cookies.get('access_token')?.value;
  if (!token) {
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  return token;
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const user = await verifyAccessToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updatePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const isCurrentCorrect = await bcrypt.compare(currentPassword, dbUser.password);
    if (!isCurrentCorrect) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe actuel est incorrect' },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    });

  } catch (error) {
    console.error('Me/password PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du mot de passe' },
      { status: 500 }
    );
  }
}
