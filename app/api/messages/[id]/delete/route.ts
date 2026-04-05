import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] DELETE /api/messages/[id]/delete - Requête reçue`);

  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    console.error(`[${timestamp}] DELETE /api/messages/[id]/delete - Accès refusé`);
    return NextResponse.json({ success: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const permanent = searchParams.get('permanent') === 'true';

  console.log(
    `[${timestamp}] DELETE /api/messages/[id]/delete - Suppression ${permanent ? 'définitive' : 'logique'}`,
  );

  if (permanent) {
    await prisma.contact.delete({ where: { id } });
    console.log(`[${timestamp}] DELETE /api/messages/[id]/delete - Suppression définitive réussie`);
    return new NextResponse(null, { status: 204 });
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  console.log(`[${timestamp}] DELETE /api/messages/[id]/delete - Suppression logique réussie`);
  return NextResponse.json({ success: true, data: updated });
}
