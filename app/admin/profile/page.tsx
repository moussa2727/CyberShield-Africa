'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { useRequireAdmin } from '@/src/hooks/useAuth';
import { toast } from 'sonner';
import { User, Mail, Key, Shield, Lock, Save, RefreshCw } from 'lucide-react';

// Force cette page à être dynamique
export const dynamic = 'force-dynamic';

interface AdminProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminProfile() {
  const auth = useRequireAdmin();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [profileUpdating, setProfileUpdating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const result = await response.json();

        if (!result.success) {
          toast.error(result.error || 'Impossible de récupérer le profil');
          return;
        }

        const user = result.user as AdminProfileData;
        setProfile(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
      } catch (error) {
        console.error('Erreur récupération profil:', error);
        toast.error('Erreur serveur lors de la récupération du profil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setProfileUpdating(true);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName,
          lastName,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Impossible de mettre à jour le profil');
        return;
      }

      const user = result.user as AdminProfileData;
      setProfile(user);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      toast.success('Profil mis à jour avec succès');

      if (typeof auth.updateUser === 'function') {
        await auth.updateUser({
          firstName: user.firstName,
          lastName: user.lastName,
        } as any);
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      toast.error('Erreur serveur lors de la mise à jour du profil');
    } finally {
      setProfileUpdating(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Merci de remplir tous les champs du mot de passe');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('La confirmation de mot de passe ne correspond pas');
      return;
    }

    setPasswordUpdating(true);

    try {
      const response = await fetch('/api/auth/me/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || 'Impossible de mettre à jour le mot de passe');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      toast.error('Erreur serveur lors de la mise à jour du mot de passe');
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Profil administrateur">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement du profil...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Profil administrateur">
      <div className="space-y-8">
        {/* Section Profil */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Informations personnelles</h2>
          </div>

          {profile ? (
            <form className="space-y-5" onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-100 cursor-not-allowed text-gray-500"
                    disabled
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-amber-500" />
                  <p className="text-xs text-gray-500">
                    L'email administrateur ne peut pas être modifié pour des raisons de sécurité.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={profileUpdating}
              >
                {profileUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Mettre à jour le profil
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">
                  Impossible de charger le profil. Veuillez réessayer.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Section Mot de passe */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-lg shadow-gray-100/50 p-6 transition-all duration-200 hover:shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-100">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md">
              <Key className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Modifier le mot de passe</h2>
          </div>

          <form className="space-y-5" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe actuel
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Minimum 8 caractères pour plus de sécurité
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={passwordUpdating}
            >
              {passwordUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4" />
                  Mettre à jour le mot de passe
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
