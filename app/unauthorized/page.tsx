'use client';

import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <Shield className="text-red-600" size={48} />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Accès non autorisé
        </h1>
        
        <p className="text-gray-600 mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/admin/messages"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Retour à l'accueil</span>
          </Link>
          
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
