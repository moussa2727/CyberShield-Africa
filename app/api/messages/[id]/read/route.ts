import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';
import { validateMarkAsRead } from '@/src/validators/messages';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] PATCH /api/messages/[id]/read - Requête reçue`);

  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    console.error(`[${timestamp}] PATCH /api/messages/[id]/read - Accès refusé`);
    return NextResponse.json({ success: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const validation = validateMarkAsRead(body);

  if (!validation.success) {
    console.error(`[${timestamp}] PATCH /api/messages/[id]/read - Validation échouée`);
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        errors: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: { isRead: validation.data.isRead },
  });

  console.log(`[${timestamp}] PATCH /api/messages/[id]/read - Statut lu mis à jour`);
  return NextResponse.json({ success: true, data: updated });
}
