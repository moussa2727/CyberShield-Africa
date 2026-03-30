import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

export async function GET(
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

  const message = await prisma.contact.findUnique({
    where: { id },
  });

  if (!message || message.isDeleted) {
    return NextResponse.json(
      { success: false, error: 'Message de contact non trouvé' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: message });
}

