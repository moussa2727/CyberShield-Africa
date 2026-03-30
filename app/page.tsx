'use client'

import Header from '@/src/components/Header'
import Mission from '@/src/components/Mission'
import Services from '@/src/components/Services'
import Contact from '@/src/components/Contact'
import Footer from '@/src/components/Footer'
import Hero from '@/src/components/Hero'
import Approach from '@/src/components/Approach'
import Testimonials from '@/src/components/Testimonials'

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />
        <Hero />
        <Mission />
        <Services />
        <Approach />
        <Testimonials />
        <Contact />
        <Footer />
      </main>
    </>
   
  )
}
