'use client'

import { 
  Shield, 
  AlertTriangle, 
  Download, 
  Wifi, 
  ShieldCheck, 
  GraduationCap,
  Globe,
} from 'lucide-react'

const services = [
  {
    icon: Shield,
    title: 'Périmètre ADF',
    description: 'Les entreprises d\'épargne et de prêt en ligne bénéficient d\'une protection renforcée.',
    stats: '1000+ sites',
    color: 'green'
  },
  {
    icon: AlertTriangle,
    title: 'Alarme & Clique',
    description: 'Détection et réponse instantanée aux menaces en temps réel.',
    stats: '1000+ sites',
    color: 'orange'
  },
  {
    icon: Download,
    title: 'Téléchargement Sécurisé',
    description: 'Téléchargement rapide et efficace avec vérification antivirus.',
    stats: 'Sécurisé',
    color: 'green'
  },
  {
    icon: Wifi,
    title: 'Portes PING',
    description: 'Éviter les attaques sur votre site web avec une surveillance constante.',
    stats: '1000+ sites',
    color: 'orange'
  },
  {
    icon: ShieldCheck,
    title: 'Audit de Sécurité',
    description: 'Réduire les risques de sécurité avec des audits approfondis.',
    stats: '1000+ sites',
    color: 'green'
  },
  {
    icon: GraduationCap,
    title: 'Formation & Sensibilisation',
    description: 'Informations sur les risques de sécurité pour vos équipes.',
    stats: '1000+ sites',
    color: 'orange'
  }
]

export default function Services() {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nos <span className="text-green-600">Services Principaux</span>
          </h2>
          <p className="text-gray-600">
            Des solutions complètes pour sécuriser l&apos;ensemble de votre infrastructure numérique
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-green-200"
            >
              <div className={`w-14 h-14 rounded-lg flex items-center justify-center mb-5 ${
                service.color === 'green' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-500'
              } group-hover:scale-110 transition-transform`}>
                <service.icon className="w-7 h-7" />
              </div>
              
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">{service.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}