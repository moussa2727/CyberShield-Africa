"use client"

import { Target, TrendingUp, Users, Shield, Eye, Zap } from "lucide-react";

const approaches = [
  {
    icon: Target,
    title: 'Analyse Approfondie',
    description: 'Identification précise des vulnérabilités spécifiques à votre secteur.',
    color: 'green'
  },
  {
    icon: TrendingUp,
    title: 'Stratégie Adaptée',
    description: 'Solutions personnalisées selon la taille et les besoins de votre PME.',
    color: 'orange'
  },
  {
    icon: Users,
    title: 'Accompagnement Humain',
    description: 'Support dédié et formation de vos équipes aux bonnes pratiques.',
    color: 'green'
  },
  {
    icon: Shield,
    title: 'Protection Continue',
    description: 'Surveillance 24/7 et mises à jour régulières de sécurité.',
    color: 'orange'
  },
  {
    icon: Eye,
    title: 'Transparence Totale',
    description: 'Rapports détaillés et communication claire sur votre posture de sécurité.',
    color: 'green'
  },
  {
    icon: Zap,
    title: 'Réaction Rapide',
    description: 'Intervention immédiate face aux incidents de sécurité détectés.',
    color: 'orange'
  }
]

export default function Approach() {
  return (
    <section id="approach" className="py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-4 py-1 bg-orange-100 rounded-full mb-4">
            <span className="text-orange-600 font-semibold text-sm">Notre Méthodologie</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            L&apos;approche <span className="text-green-600">Cyber Shield Africa</span>
          </h2>
          <p className="text-gray-600">
            Une approche cyber unique et adaptée aux entreprises africaines
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {approaches.map((approach, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                approach.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'
              }`}>
                <approach.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">{approach.title}</h3>
                <p className="text-gray-600 text-sm">{approach.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}