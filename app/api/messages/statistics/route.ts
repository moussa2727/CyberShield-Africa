import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status }
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, unread, replied, today] = await Promise.all([
    prisma.contact.count({ where: { isDeleted: false } }),
    prisma.contact.count({ where: { isDeleted: false, isRead: false } }),
    prisma.contact.count({ where: { isDeleted: false, isReplied: true } }),
    prisma.contact.count({ where: { isDeleted: false, createdAt: { gte: startOfToday } } }),
  ]);

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

