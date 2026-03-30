import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status }
    );
  }

  const result = await prisma.contact.updateMany({
    where: { isDeleted: false, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, data: { updated: result.count } });
}

