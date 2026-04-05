import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] GET /api/messages/statistics - Requête reçue`);

  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    console.error(`[${timestamp}] GET /api/messages/statistics - Accès refusé:`, admin.error);
    return NextResponse.json({ success: false, error: admin.error }, { status: admin.status });
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, replied, today] = await Promise.all([
    prisma.contact.count({ where: { isDeleted: false } }),
    prisma.contact.count({ where: { isDeleted: false, isRead: false } }),
    prisma.contact.count({ where: { isDeleted: false, isReplied: true } }),
    prisma.contact.count({ where: { isDeleted: false, createdAt: { gte: startOfToday } } }),
  ]);

  console.log(`[${timestamp}] GET /api/messages/statistics - Stats récupérées`);

  return NextResponse.json({
    success: true,
    data: {
      total,
      unread,
      replied,
      today,
    },
  });
}
