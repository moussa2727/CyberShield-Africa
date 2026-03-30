import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';
import { validateMarkAsRead } from '@/src/validators/messages';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status }
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const validation = validateMarkAsRead(body);

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

  const updated = await prisma.contact.update({
    where: { id },
    data: { isRead: validation.data.isRead },
  });

  return NextResponse.json({ success: true, data: updated });
}

