'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Register from '@/src/components/auth/Register';

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <Register />
    </Suspense>
  );
}
