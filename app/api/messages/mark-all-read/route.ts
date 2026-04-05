import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] PUT /api/messages/mark-all-read - Requête reçue`);

  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    console.error(`[${timestamp}] PUT /api/messages/mark-all-read - Accès refusé:`, admin.error);
    return NextResponse.json({ success: false, error: admin.error }, { status: admin.status });
  }

  const result = await prisma.contact.updateMany({
    where: { isDeleted: false, isRead: false },
    data: { isRead: true },
  });

  console.log(`[${timestamp}] PUT /api/messages/mark-all-read - Opération terminée`);
  return NextResponse.json({ success: true, data: { updated: result.count } });
}
