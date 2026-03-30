import { NextRequest, NextResponse } from 'next/server';
import {
  validateCreateMessage,
  validateRespondMessage,
  validateMessagesQuery,
  validateGetMessage,
  validateDeleteMessage,
  validateMarkAsRead,
  validateMarkAllAsRead,
  validateExportMessages,
  CreateMessageData,
  ExportMessagesData,
  MarkAsReadData,
  MessagesQueryData,
  RespondMessageData,
  validateGetStatistics,
  validateGetUnreadCount,
} from '@/src/validators/messages';
import { prisma } from '../../../src/lib/prisma'; 
import { requireAdmin } from '@/src/lib/auth';
import { notifyAdminNewContactMessage, emailService } from '@/src/lib/mailer';
import { ZodIssue, ZodError } from 'zod';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================
// HELPER FUNCTIONS
// ============================================

function validateRequest<T>(
  schema: (data: unknown) => { success: boolean; data?: T; error?: object },
  data: unknown
): { valid: boolean; data?: T; errors?: Record<string, string[]> } {
  const result = schema(data);
  
  if (!result.success) {
    const errors: Record<string, string[]> = {};
    
    if (result.error && 'issues' in result.error) {
      (result.error.issues as ZodIssue[]).forEach((issue: ZodIssue) => {
        const field = issue.path[0] as string;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(issue.message);
      });
    }
    
    return { valid: false, errors };
  }
  
  return { valid: true, data: result.data as T };
}

function handleApiError(error: Error): NextResponse {
  console.error('API Error:', error);
  
  // Handle validation errors
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    error.issues.forEach((issue: ZodIssue) => {
      const field = issue.path[0] as string;
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(issue.message);
    });
    
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        errors,
      },
      { status: 400 }
    );
  }
  
  // Handle duplicate response error
  if (error.message === 'Ce message a déjà reçu une réponse') {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
  
  // Handle not found errors
  if (error.message === 'Message de contact non trouvé') {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 404 }
    );
  }
  
  // Default error response
  return NextResponse.json(
    {
      success: false,
      error: 'Une erreur est survenue',
    },
    { status: 500 }
  );
}

async function ensureAdmin(request: NextRequest): Promise<NextResponse | null> {
  const admin = await requireAdmin(request);
  if (!admin.authorized) {
    return NextResponse.json(
      { success: false, error: admin.error },
      { status: admin.status }
    );
  }
  return null;
}

// ============================================
// MAIN API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    
    // Check if this is a respond endpoint
    if (url.pathname.includes('/respond')) {
      const adminResponse = await ensureAdmin(request);
      if (adminResponse) return adminResponse;

      const id = url.pathname.split('/').slice(-2)[0];
      const validation = validateRequest(validateRespondMessage, body);
      
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
      
      const data = validation.data as RespondMessageData;
      
      // Call your API with the validated data
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/messages/${id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({ response: data.response }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return handleApiError(result);
      }
      
      // Notifier l'utilisateur que l'admin a répondu
      if (result.success && result.data?.id) {
        try {
          // Récupérer les détails du message pour notifier l'utilisateur
          const messageResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/messages/${id}`, {
            headers: {
              'Authorization': request.headers.get('Authorization') || '',
            },
          });
          
          const messageData = await messageResponse.json();
          
          if (messageData.success && messageData.data?.email) {
            await emailService.notifyAdminResponse({
              fullName: messageData.data.fullName || 'Client',
              email: messageData.data.email,
              adminResponse: data.response,
            });
          }
        } catch (err) {
          console.error('Error notifying user of admin response:', err);
        }
      }
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }
    
    // Regular create message endpoint
    const validation = validateRequest(validateCreateMessage, body);
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }
    
    const data = validation.data as CreateMessageData;
    
    // Save to database using Prisma
    const contact = await prisma.contact.create({
      data: {
        fullName: data.fullName || 'non renseigné',
        email: data.email,
        message: data.message,
        company: data.company || null,
        service: data.service || null,
        isRead: false,
        isReplied: false,
      },
    });

    // Notifier l'admin par email (best-effort) et informer le client
    let emailNotificationSent = false;
    try {
      await notifyAdminNewContactMessage({
        senderEmail: data.email,
        senderName: data.fullName,
        company: data.company || null,
        service: data.service || null,
        message: data.message,
      });
      emailNotificationSent = true;
    } catch (err) {
      console.error('Email notify admin error:', err);
    }

    // Confirmer la réception à l'utilisateur
    let confirmationEmailSent = false;
    try {
      await emailService.confirmReceipt({
        fullName: data.fullName ?? '',
        email: data.email,
        service: data.service ?? undefined,
      });
      confirmationEmailSent = true;
    } catch (err) {
      console.error('Email confirmation error:', err);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Message reçu',
      data: contact,
      emailNotificationSent,
      confirmationEmailSent,
    });
    
  } catch (error) {
    return handleApiError((error as Error));
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Liste des messages (admin)
    const adminResponse = await ensureAdmin(request);
    if (adminResponse) return adminResponse;

    const rawQuery: Partial<MessagesQueryData> = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
      isRead: searchParams.get('isRead') ? searchParams.get('isRead') === 'true' : undefined,
      email: searchParams.get('email') || undefined,
      search: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: (searchParams.get('sortBy') as MessagesQueryData['sortBy']) || undefined,
      sortOrder: (searchParams.get('sortOrder') as MessagesQueryData['sortOrder']) || undefined,
      showDeleted: searchParams.get('showDeleted') ? searchParams.get('showDeleted') === 'true' : undefined,
      isReplied: searchParams.get('isReplied') ? searchParams.get('isReplied') === 'true' : undefined,
    };
    
    const validation = validateRequest(validateMessagesQuery, rawQuery);
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const query = validation.data as MessagesQueryData;

    const where: any = {};

    if (!query.showDeleted) {
      where.isDeleted = false;
    }
    if (query.isRead !== undefined) {
      where.isRead = query.isRead;
    }
    if (query.isReplied !== undefined) {
      where.isReplied = query.isReplied;
    }
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { service: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const orderBy: any = { [query.sortBy]: query.sortOrder };
    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [data, total, unreadCount] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.contact.count({ where }),
      prisma.contact.count({
        where: {
          isDeleted: false,
          isRead: false,
        },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        unreadCount,
      },
    });
    
  } catch (error) {
    return handleApiError(error as Error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const pathname = request.nextUrl.pathname;
    
    // Handle mark as read endpoint
    if (pathname.includes('/read')) {
      const adminResponse = await ensureAdmin(request);
      if (adminResponse) return adminResponse;

      const id = pathname.split('/').slice(-2)[0];
      const validation = validateRequest(validateMarkAsRead, body);
      
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
      
      const data = validation.data as MarkAsReadData;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({ isRead: data.isRead }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return handleApiError(result);
      }
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }
    
    // Handle respond endpoint (alternative path)
    if (pathname.includes('/respond')) {
      const adminResponse = await ensureAdmin(request);
      if (adminResponse) return adminResponse;

      const id = pathname.split('/').slice(-2)[0];
      const validation = validateRequest(validateRespondMessage, body);
      
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
      
      const data = validation.data as RespondMessageData;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/messages/${id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({ response: data.response }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return handleApiError(result);
      }
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid endpoint',
      },
      { status: 404 }
    );
    
  } catch (error) {
    return handleApiError(error as Error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminResponse = await ensureAdmin(request);
    if (adminResponse) return adminResponse;

    const { searchParams } = new URL(request.url);
    const pathname = request.nextUrl.pathname;
    const id = pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message ID is required',
        },
        { status: 400 }
      );
    }
    
    const permanent = searchParams.get('permanent') === 'true';
    
    const validation = validateRequest(validateDeleteMessage, { id, permanent });
    
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/messages/${id}/delete?permanent=${permanent}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      }
    );
    
    if (!response.ok && response.status !== 204) {
      const result = await response.json();
      return handleApiError(result);
    }
    
    return NextResponse.json({
      success: true,
      data: null,
    });
    
  } catch (error) {
    return handleApiError(error as Error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const pathname = request.nextUrl.pathname;
    
    // Handle mark all as read endpoint
    if (pathname.includes('/mark-all-read')) {
      const adminResponse = await ensureAdmin(request);
      if (adminResponse) return adminResponse;

      const validation = validateRequest(validateMarkAllAsRead, {});
      
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/messages/mark-all-read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return handleApiError(result);
      }
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }
    
    // Handle export endpoint
    if (pathname.includes('/export')) {
      const adminResponse = await ensureAdmin(request);
      if (adminResponse) return adminResponse;
      
      // Accept GET method for export
      if (request.method !== 'GET') {
        return NextResponse.json(
          {
            success: false,
            error: 'Method Not Allowed. Use GET method.',
          },
          { status: 405 }
        );
      }
      
      const validation = validateRequest(validateExportMessages, body);
      
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation error',
            errors: validation.errors,
          },
          { status: 400 }
        );
      }
      
      const data = validation.data as ExportMessagesData;
      
      const queryString = new URLSearchParams(
        Object.entries(data).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = value.toString();
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/messages/export?${queryString}`,
        {
          headers: {
            Authorization: request.headers.get('Authorization') || '',
          },
        }
      );
      
      if (!response.ok) {
        const result = await response.json();
        return handleApiError(result);
      }
      
      const blob = await response.blob();
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
          'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment',
        },
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid endpoint',
      },
      { status: 404 }
    );
    
  } catch (error) {
    return handleApiError(error as Error);
  }
}