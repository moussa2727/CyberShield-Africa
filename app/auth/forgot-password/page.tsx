import ForgotPassword from '@/src/components/auth/Forgot-Password';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={32} />
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
}
