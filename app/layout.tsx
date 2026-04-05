import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CyberShield Africa | Sécurité Numérique PME',
  description:
    'Protégez votre entreprise contre les menaces numériques avec CyberShield Africa. Services de cybersécurité accessibles pour les PME africaines.',
  keywords: 'cybersécurité, PME, Afrique, Maroc, audit sécurité, pentest',
  authors: [{ name: 'CyberShield Africa' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
