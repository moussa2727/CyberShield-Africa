import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifyAccessToken } from '@/src/lib/auth';
import { updateProfileSchema } from '@/src/validators/auth/update-profile.validator';
import { env } from '@/src/lib/env';

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

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du profil' },
      { status: 500 }
    );
  }
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
    const validation = updateProfileSchema.safeParse(body);

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

    const { firstName, lastName, email } = validation.data;

    const adminEmail = env.ADMIN_EMAIL.toLowerCase();

    if (email && user.email.toLowerCase() === adminEmail && email.toLowerCase() !== adminEmail) {
      return NextResponse.json(
        { success: false, error: 'L\'email admin ne peut pas être modifié' },
        { status: 403 }
      );
    }

    if (email && email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà utilisé par un autre compte' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Me PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    );
  }
}
