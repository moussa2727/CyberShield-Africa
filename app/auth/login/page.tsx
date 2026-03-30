'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Login from '@/src/components/auth/Login';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={32} /></div>}>
      <Login />
    </Suspense>
  );
}