'use client'

import { useState } from 'react'
import { MessageSquare, Mail, Send, Loader2 } from 'lucide-react'
import { validateCreateMessageField, validateCreateMessage } from '../validators/messages'
import type { ZodIssue } from 'zod'
import { toast } from 'sonner'

type FormErrors = {
  fullName?: string
  company?: string
  email?: string
  service?: string
  message?: string
}

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    service: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})

  const validateField = (field: keyof typeof formData, value: string) => {
    const error = validateCreateMessageField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    return !error
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setServerErrors({}) // Clear server errors on change
    if (touched[field]) {
      validateField(field, value)
    }
  }

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    validateField(field, formData[field])
  }

  const validateForm = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    setTouched(allTouched)

    // Validate all fields
    const result = validateCreateMessage(formData)
    
    if (!result.success) {
      const newErrors: FormErrors = {}
      result.error.issues.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof FormErrors
        newErrors[field] = issue.message
      })
      setErrors(newErrors)
      return false
    }
    
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setServerErrors({})

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        toast.success('Message reçu', {
          description: data?.emailNotificationSent
            ? 'Votre demande a bien été transmise à notre équipe. Nous vous recontactons rapidement.'
            : 'Votre demande a bien été enregistrée. Nous vous recontactons rapidement.',
        })
        setFormData({
          fullName: '',
          company: '',
          email: '',
          service: '',
          message: '',
        })
        setErrors({})
        setTouched({})
        setServerErrors({})
      } else if (data.errors) {
        // Handle validation errors from server
        setServerErrors(data.errors)
        setSubmitStatus('error')
        toast.error('Veuillez corriger le formulaire', {
          description: 'Certains champs sont invalides.',
        })
        
        // Mark fields with server errors as touched
        const serverErrorFields = Object.keys(data.errors)
        const newTouched = { ...touched }
        serverErrorFields.forEach(field => {
          newTouched[field] = true
        })
        setTouched(newTouched)
      } else {
        setSubmitStatus('error')
        toast.error('Erreur lors de l’envoi', {
          description: data?.error || 'Veuillez réessayer.',
        })
      }
    } catch {
      setSubmitStatus('error')
      toast.error('Erreur de connexion', {
        description: 'Veuillez réessayer.',
      })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setSubmitStatus('idle'), 5000)
    }
  }

  const contactMethods = [
    {
      icon: MessageSquare,
      title: 'Communauté Discord',
      description: 'Rejoignez notre serveur pour échanger sur les bonnes pratiques.',
      color: 'text-indigo-400',
    },
    {
      icon: Mail,
      title: 'E-mail Officiel',
      description: 'contact@cybershield-africa.ma',
      color: 'text-emerald-400',
    },
    {
      icon: Mail,
      title: 'LinkedIn',
      description: 'CyberShield Africa Officiel',
      color: 'text-blue-400',
    },
  ]

  const getFieldError = (field: keyof FormErrors): string | null => {
    if (serverErrors[field] && serverErrors[field].length > 0) {
      return serverErrors[field][0]
    }
    if (errors[field] && touched[field]) {
      return errors[field] || null
    }
    return null
  }

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white page-break">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Left Column */}
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-6 italic underline decoration-emerald-500">
              Contactez-nous
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Prêt à renforcer votre posture de sécurité ? Notre équipe locale au Maroc est prête à intervenir.
            </p>

            <div className="space-y-6">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition"
                >
                  <method.icon className={`${method.color} text-3xl`} />
                  <div>
                    <h4 className="font-bold">{method.title}</h4>
                    <p className="text-sm text-slate-400">{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white text-slate-900 p-8 rounded-3xl shadow-2xl border-t-8 border-orange-500 animate-slide-up">
            <h3 className="text-2xl font-bold mb-6 italic">Demander un Devis</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    placeholder="Nom complet"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    className={`w-full bg-slate-100 p-3 rounded-lg border outline-none transition ${
                      getFieldError('fullName')
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {getFieldError('fullName') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('fullName')}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    autoComplete="organization"
                    placeholder="Nom de l'entreprise"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    onBlur={() => handleBlur('company')}
                    className={`w-full bg-slate-100 p-3 rounded-lg border outline-none transition ${
                      getFieldError('company')
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {getFieldError('company') && (
                    <p className="text-red-500 text-xs mt-1">{getFieldError('company')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="E-mail professionnel"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full bg-slate-100 p-3 rounded-lg border outline-none transition ${
                    getFieldError('email')
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                {getFieldError('email') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('email')}</p>
                )}
              </div>
              
              <div>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={(e) => handleChange('service', e.target.value)}
                  onBlur={() => handleBlur('service')}
                  className={`w-full bg-slate-100 p-3 rounded-lg border outline-none transition ${
                    getFieldError('service')
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                >
                  <option value="">Sélectionnez un service</option>
                  <option value="pentest">Pentest Web</option>
                  <option value="audit">Audit de Sécurité</option>
                  <option value="formation">Formation Sensibilisation</option>
                </select>
                {getFieldError('service') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('service')}</p>
                )}
              </div>
              
              <div>
                <textarea
                  id="message"
                  name="message"
                  autoComplete="off"
                  placeholder="Décrivez votre besoin..."
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onBlur={() => handleBlur('message')}
                  className={`w-full bg-slate-100 p-3 rounded-lg border h-32 outline-none transition ${
                    getFieldError('message')
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                {getFieldError('message') && (
                  <p className="text-red-500 text-xs mt-1">{getFieldError('message')}</p>
                )}
              </div>
              
              {serverErrors.general && (
                <p className="text-red-500 text-sm text-center">{serverErrors.general[0]}</p>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-lg hover:bg-slate-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer ma demande
                  </>
                )}
              </button>
              
              {submitStatus === 'success' && (
                <p className="text-emerald-600 text-sm text-center">Message envoyé avec succès !</p>
              )}
              {submitStatus === 'error' && !serverErrors.general && (
                <p className="text-red-600 text-sm text-center">Erreur lors de l&apos;envoi. Veuillez réessayer.</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}