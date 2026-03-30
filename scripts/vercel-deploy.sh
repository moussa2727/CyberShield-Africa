#!/bin/bash

# Script de déploiement pour CyberShield Africa sur Vercel

echo "🚀 Déploiement de CyberShield Africa sur Vercel..."

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation en cours..."
    pnpm install -g vercel@latest
fi

# Vérifier si pnpm est installé
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm n'est pas installé. Installation en cours..."
    pnpm install -g pnpm@latest
fi

# Nettoyage du cache
echo "🧹 Nettoyage du cache..."
rm -rf .next
rm -rf node_modules/.cache

# Installation des dépendances
echo "📦 Installation des dépendances..."
pnpm install

# Génération du client Prisma
echo "🗄️ Génération du client Prisma..."
pnpm prisma generate

# Build de l'application
echo "🔨 Build de l'application..."
pnpm build

# Déploiement sur Vercel
echo "🌍 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé !"
echo "📊 N'oubliez pas de configurer les variables d'environnement dans Vercel Dashboard"
echo "🔗 Vérifiez que la base de données est connectée"
echo "📧 Testez l'envoi d'emails"
