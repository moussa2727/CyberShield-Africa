'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/src/components/admin/AdminLayout';
import { useRequireAdmin } from '@/src/contexts/AuthContext';
import { toast } from 'sonner';

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

  return (
    <AdminLayout title="Profil administrateur">
      <div className="space-y-8">
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Données du profil</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : profile ? (
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-none focus:outline-none focus:border-orange-500 hover:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-none focus:outline-none focus:border-orange-500 hover:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (admin)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed focus:ring-none focus:outline-none focus:border-gray-300 hover:border-gray-300"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">L'email administrateur ne peut pas être modifié.</p>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                disabled={profileUpdating}
              >
                {profileUpdating ? 'Mise à jour...' : 'Mettre à jour le profil'}
              </button>
            </form>
          ) : (
            <p className="text-sm text-red-600">Impossible de charger le profil.</p>
          )}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Modifier le mot de passe</h2>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-none focus:outline-none focus:border-orange-500 hover:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-none focus:outline-none focus:border-orange-500 hover:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-none focus:outline-none focus:border-orange-500 hover:border-orange-500"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              disabled={passwordUpdating}
            >
              {passwordUpdating ? 'Traitement...' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}
