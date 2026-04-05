import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { requireAdmin } from '@/src/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const timestamp = new Date().toISOString();

  console.log(`[${timestamp}] GET /api/messages/[id] - Requête reçue`);

  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    console.error(`[${timestamp}] GET /api/messages/[id] - Accès refusé`);
    return NextResponse.json({ success: false, error: admin.error }, { status: admin.status });
  }

  const { id } = await params;

  const message = await prisma.contact.findUnique({
    where: { id },
  });

  if (!message || message.isDeleted) {
    console.warn(`[${timestamp}] GET /api/messages/[id] - Message non trouvé`);
    return NextResponse.json(
      { success: false, error: 'Message de contact non trouvé' },
      { status: 404 },
    );
  }

  console.log(`[${timestamp}] GET /api/messages/[id] - Message trouvé`);
  return NextResponse.json({ success: true, data: message });
}
