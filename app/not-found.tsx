'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="bg-green-100 p-6 rounded-full">
              <Shield className="w-16 h-16 text-green-600" />
            </div>
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              404
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Page Non Trouvée
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Oops! La page que vous recherchez semble avoir disparu. 
          Elle a peut-être été déplacée, supprimée ou n&apos;a jamais existé.
        </p>

       

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Retour à l&apos;Accueil
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Page Précédente
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Vous cherchez quelque chose de spécifique ?
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/#services" className="text-green-600 hover:text-green-700 text-sm transition">
              → Nos Services
            </Link>
            <Link href="/#contact" className="text-green-600 hover:text-green-700 text-sm transition">
              → Nous Contacter
            </Link>
           
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-xs text-gray-400">
          <p>CyberShield Africa - Sécurité Informatique au Maroc</p>
          <p className="mt-1">Protégeant vos données depuis 2026</p>
        </div>
      </div>
    </div>
  )
}
