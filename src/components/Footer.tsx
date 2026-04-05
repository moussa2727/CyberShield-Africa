import { Shield, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900 pt-16 pb-8">
      <div className="mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo et description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <span className="font-bold text-xl">CYBERSHIELD</span>
                <span className="block text-xs text-green-500">AFRICA</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Sécurisez la transformation numérique de votre PME en Afrique avec des solutions
              adaptées et accessibles.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Liens Rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#services" className="hover:text-green-500 transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#approach" className="hover:text-green-500 transition">
                  Approche
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-green-500 transition">
                  Témoignages
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-green-500 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Nos Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Audit de Sécurité</li>
              <li>Pentest Web</li>
              <li>Formation & Sensibilisation</li>
              <li>Surveillance 24/7</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>contact@cybershield.africa</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+221 78 123 45 67</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Dakar, Sénégal</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center gap-6 mb-8 pt-8 border-t border-gray-800">
          <a href="#" className="text-gray-400 hover:text-green-500 transition">
            <FaFacebook className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-500 transition">
            <FaTwitter className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-500 transition">
            <FaLinkedin className="w-5 h-5" />
          </a>
          <a href="#" className="text-gray-400 hover:text-green-500 transition">
            <FaGithub className="w-5 h-5" />
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
          <p>&copy; 2026 Cyber Shield Africa. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
