'use client';

import { Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-linear-to-br from-green-50 via-white to-orange-50">
      <div className="mx-auto px-4 md:px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-600">Sécurité Numérique PME</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Sécurisez la <span className="text-green-600">Transformation Numérique</span> de Votre
            PME en Afrique
          </h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Les entreprises d&apos;épargne et de prêt en ligne sont des acteurs clés dans le secteur
            financier. Protégez vos données et vos transactions avec nos solutions adaptées.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:scale-105"
            >
              Sécuriser mon entreprise
            </a>
            <a
              href="#services"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-all"
            >
              Découvrir nos services
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
