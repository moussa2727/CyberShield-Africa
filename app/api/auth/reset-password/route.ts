import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { verifyToken, hashPassword } from '@/src/lib/auth';

// Schéma de validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.error.issues
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Vérifier le token
    const tokenData = verifyToken(token);
    if (!tokenData || tokenData.type !== 'password_reset') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token invalide ou expiré' 
        },
        { status: 400 }
      );
    }

    // Vérifier l'utilisateur et son token
    const user = await prisma.user.findFirst({
      where: {
        id: tokenData.userId,
        resetToken: token,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token invalide ou expiré' 
        },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(password);

    // Mettre à jour le mot de passe et supprimer le token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue' 
      },
      { status: 500 }
    );
  }
}
