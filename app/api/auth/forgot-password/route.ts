import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/src/lib/prisma';
import { generateToken } from '@/src/lib/auth';
import { sendPasswordResetEmail } from '@/src/lib/mailer';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Schéma de validation
const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email invalide',
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Toujours retourner un succès pour ne pas révéler si l'email existe ou non
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé',
      });
    }

    // Générer un token de réinitialisation
    const resetToken = generateToken(
      {
        userId: user.id,
        email: user.email,
        type: 'password_reset',
      },
      { expiresIn: '1h' },
    ); // Expire dans 1 heure

    // Mettre à jour le token de réinitialisation de l'utilisateur
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
      },
    });

    // Envoyer l'email de réinitialisation
    try {
      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.firstName,
        resetToken,
      });
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
      // On continue même si l'email échoue pour ne pas révéler d'informations
    }

    return NextResponse.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue',
      },
      { status: 500 },
    );
  }
}
