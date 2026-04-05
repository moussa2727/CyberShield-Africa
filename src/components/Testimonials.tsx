'use client';

import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Amara Koné',
    position: 'CEO, FinTech Mali',
    content:
      'Cyber Shield Africa a transformé notre approche de la sécurité. Leur expertise et leur réactivité sont exceptionnelles.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Fatima Zahra',
    position: 'Directrice IT, Banque Digitale',
    content:
      'Des audits approfondis et des recommandations claires. Notre infrastructure est désormais plus sécurisée que jamais.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/1.jpg',
  },
  {
    name: 'Mohamed Diop',
    position: 'Fondateur, Startup Sénégal',
    content:
      'Leur approche pédagogique nous a permis de comprendre les enjeux et de former nos équipes efficacement.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50">
      <div className="mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-4 py-1 bg-green-100 rounded-full mb-4">
            <span className="text-green-600 font-semibold text-sm">Ils nous font confiance</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-green-600">Témoignages</span> Authentiques
          </h2>
          <p className="text-gray-600">
            Découvrez ce que nos clients pensent de nos services de cybersécurité
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-xl transition-all border border-gray-100"
            >
              <Quote className="w-8 h-8 text-orange-300 mb-4" />
              <p className="text-gray-600 mb-6 italic">{testimonial.content}</p>

              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                </div>
              </div>

              <div className="flex gap-1 mt-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-500 text-orange-500" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
