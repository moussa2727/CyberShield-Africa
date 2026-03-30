# CyberShield Africa - Plateforme de Cybersécurité

Application web Next.js pour la gestion des services de cybersécurité, avec authentification, messagerie et administration.

## 🚀 Déploiement sur Vercel

### Prérequis

- Compte Vercel
- Compte GitHub/GitLab/Bitbucket
- Base de données PostgreSQL (Vercel Postgres recommandé)

### Étapes de déploiement

#### 1. Fork et Connectez le dépôt

1. Fork ce dépôt sur votre compte GitHub
2. Connectez votre compte Vercel à GitHub
3. Importez le projet dans Vercel

#### 2. Configuration de la base de données

1. Créez une base de données Vercel Postgres
2. Copiez la chaîne de connexion `DATABASE_URL`

#### 3. Variables d'environnement

Configurez ces variables dans les settings Vercel :

```bash
# URL de l'application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=CyberShield Africa

# Base de données
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# JWT Secrets (générez des clés sécurisées)
JWT_SECRET=votre-secret-jwt-32-caracteres-minimum
JWT_REFRESH_SECRET=votre-secret-refresh-32-caracteres-minimum  
JWT_PASSWORD_RESET_SECRET=votre-secret-reset-32-caracteres-minimum

# Email Gmail OAuth2
EMAIL_USER=votre-email@gmail.com
GMAIL_CLIENT_ID=votre-client-id-gmail
GMAIL_CLIENT_SECRET=votre-client-secret-gmail
GMAIL_REFRESH_TOKEN=votre-refresh-token-gmail

# Administration
ADMIN_EMAIL=admin@cybershield.africa

# Fonctionnalités
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_EXPORT=true
ENABLE_BULK_OPERATIONS=true
```

#### 4. Configuration Gmail OAuth2

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet et activez l'API Gmail
3. Créez des identifiants OAuth2
4. Configurez l'écran de consentement
5. Ajoutez `http://localhost:3000` et votre domaine Vercel comme URLs de redirection

#### 5. Déploiement automatique

Vercel va automatiquement :
- Installer les dépendances avec `pnpm install`
- Générer le client Prisma avec `prisma generate`
- Builder l'application avec `next build`
- Déployer sur les edge servers

### 📁 Structure du projet

```
├── app/                    # Pages Next.js App Router
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── admin/             # Pages admin
│   └── (pages)/           # Pages publiques
├── src/
│   ├── components/        # Composants React
│   ├── contexts/          # Contextes React
│   ├── hooks/             # Hooks personnalisés
│   └── lib/               # Utilitaires (auth, mailer, etc.)
├── prisma/                # Schéma et migrations Prisma
├── public/                # Fichiers statiques
└── vercel.json           # Configuration Vercel
```

### 🛠️ Fonctionnalités

- **Authentification** : Login, register, forgot password
- **Administration** : Gestion des messages, utilisateurs
- **Messagerie** : Formulaire de contact avec notifications email
- **Sécurité** : JWT tokens, middleware de protection
- **Responsive** : Design mobile-first avec Tailwind CSS

### 🔧 Développement local

```bash
# Installation
pnpm install

# Variables d'environnement
cp .env.example .env.local

# Base de données
pnpm prisma migrate dev

# Développement
pnpm dev

# Build
pnpm build
```

### 📊 Monitoring

- **Vercel Analytics** : Analytics et performances
- **Vercel Speed Insights** : Core Web Vitals
- **Logs** : Logs des fonctions serverless

### 🔒 Sécurité

- Tokens JWT avec expiration
- Middleware de protection des routes
- Validation des entrées avec Zod
- Headers de sécurité configurés
- HTTPS forcé sur Vercel

### 📈 Performance

- Images optimisées avec Next.js Image
- Cache configuré pour les assets statiques
- Build optimisé pour Vercel Edge Network
- Compression gzip activée

### 🐛 Débuggage

En cas de problème :

1. Vérifiez les logs Vercel
2. Validez les variables d'environnement
3. Testez la connexion à la base de données
4. Vérifiez les CORS et headers

### 📞 Support

Pour toute question sur le déploiement :
- Documentation Vercel : https://vercel.com/docs
- Support Vercel : https://vercel.com/support
- Issues GitHub : https://github.com/your-repo/issues

---

**Développé avec ❤️ pour CyberShield Africa**
