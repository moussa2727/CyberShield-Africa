'use client'

import { useEffect } from 'react'
import { Shield, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="bg-red-100 p-6 rounded-full">
              <Shield className="w-16 h-16 text-red-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              !
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Erreur Inattendue
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Une erreur inattendue s&apos;est produite. 
          Notre équipe a été notifiée et travaille à résoudre ce problème.
        </p>

        {/* Error Code Display */}
        <div className="bg-gray-100 rounded-lg p-4 mb-8 font-mono text-sm">
          <span className="text-gray-500">Error Code:</span>
          <span className="text-red-600 font-bold ml-2">500</span>
          <span className="text-gray-500 ml-2">|</span>
          <span className="text-gray-600 ml-2">Internal Error</span>
          {error.digest && (
            <>
              <span className="text-gray-500 ml-2">|</span>
              <span className="text-gray-400 ml-2">ID: {error.digest}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={reset}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          
          <Link href="/" className="block">
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;Accueil
            </button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Le problème persiste ? Contactez notre support :
          </p>
          <div className="flex flex-col gap-2">
            <Link href="mailto:support@cybershield-africa.ma" className="text-orange-600 hover:text-orange-700 text-sm transition">
              → Support Technique
            </Link>
            <Link href="/#contact" className="text-orange-600 hover:text-orange-700 text-sm transition">
              → Nous Contacter
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-xs text-gray-400">
          <p>CyberShield Africa - Sécurité Informatique au Maroc</p>
          <p className="mt-1">Nous sommes désolés pour ce désagrément</p>
        </div>
      </div>
    </div>
  )
}
