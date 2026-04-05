'use client';

import { AuthProvider } from '../src/hooks/useAuth';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      {children}
    </AuthProvider>
  );
}
