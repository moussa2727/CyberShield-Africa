import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';
import { validateRespondMessage } from '@/src/validators/messages';
import { notifySenderAdminReply } from '@/src/lib/mailer';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  const validation = validateRespondMessage(body);

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

  const { response, markAsRead } = validation.data;

  const updated = await prisma.contact.update({
    where: { id },
    data: {
      adminResponse: response,
      respondedAt: new Date(),
      isReplied: true,
      isRead: markAsRead ? true : undefined,
    },
  });

  // Notifier l'expéditeur que l'admin a répondu (best-effort)
  notifySenderAdminReply({
    to: updated.email,
    senderName: updated.fullName,
    adminResponse: response,
  }).catch((err) => console.error('Email notify sender error:', err));

  return NextResponse.json({ success: true, data: updated });
}

