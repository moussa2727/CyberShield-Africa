'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Shield } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '#services', label: 'Services' },
    { href: '#approach', label: 'Approche' },
    { href: '#testimonials', label: 'Témoignages' },
    { href: '#contact', label: 'Contact', isButton: true },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 no-print ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200'
      }`}
    >
      <div className="mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Shield className="text-emerald-600 text-2xl w-8 h-8 group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-xl tracking-tight uppercase">
              CyberShield <span className="text-green-500">Africa</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center font-medium text-sm">
            {navLinks.map((link) => (
              link.isButton ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-all hover:scale-105"
                >
                  Demander un Devis
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    link.isButton
                      ? 'bg-emerald-600 text-white px-5 py-2 rounded-full text-center hover:bg-emerald-700'
                      : 'hover:text-emerald-600 transition-colors'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}