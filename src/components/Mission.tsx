
'use client'

import { CheckCircle } from 'lucide-react'

export default function Mission() {
  const features = [
    'Sensibilisation aux attaques d\'ingénierie sociale',
    'Rapports clairs, exploitables et pédagogiques',
    'Encadrement académique garantissant la rigueur technique',
  ]

  return (
    <section className="py-20 mx-auto px-6 border-b">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 italic text-emerald-800 underline decoration-orange-500">
            Notre Mission
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            CyberShield Africa protège les entreprises africaines contre les menaces numériques en rendant les audits 
            et tests de sécurité accessibles financièrement.
          </p>
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 mt-1 w-5 h-5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-2xl border-l-8 border-orange-500 animate-slide-up">
          <h3 className="text-xl font-bold mb-4 italic">L&#39;opportunité du marché</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4">
            La digitalisation rapide au Maroc et en Afrique expose les PME à des risques de fuites de données et pertes financières.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <span className="block text-2xl font-bold text-emerald-400">18K€+</span>
              <span className="text-[10px] uppercase">CA Année 1</span>
            </div>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-center">
              <span className="block text-2xl font-bold text-orange-400">0%</span>
              <span className="text-[10px] uppercase">Desserte Actuelle</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}