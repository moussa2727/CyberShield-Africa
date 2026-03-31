'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (firstName: string, lastName: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hasSessionFlagCookie = () => {
    if (typeof document === 'undefined') return false;
    return document.cookie
      .split('; ')
      .some((c) => c === 'has_session=1' || c.startsWith('has_session='));
  };

  // Fonction pour stocker le token dans localStorage
  const setLocalStorageToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  };

  const getLocalStorageToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  };

  const removeLocalStorageToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  };

  // Vérifier l'authentification
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Essayer de récupérer le token du localStorage d'abord
      let token = getLocalStorageToken();
      
      if (!token) {
        // Si pas de token localStorage et aucun indice de session, ne pas appeler /me
        if (!hasSessionFlagCookie()) {
          setUser(null);
          return false;
        }

        // Sinon, faire une requête qui utilisera les cookies (httpOnly)
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
          return true;
        }
        return false;
      }

      // Si on a un token localStorage, l'utiliser
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        return true;
      } else {
        // Token invalide, essayer de le rafraîchir
        const refreshed = await refreshToken();
        if (!refreshed) {
          removeLocalStorageToken();
          setUser(null);
        }
        return refreshed;
      }
    } catch (error) {
      console.error('Check auth error:', error);
      setUser(null);
      return false;
    }
  }, []);

  // Rafraîchir le token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshTokenStorage = localStorage.getItem('refresh_token');
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenStorage }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.accessToken) {
        setLocalStorageToken(data.accessToken);
        if (data.user) {
          setUser(data.user);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  }, []);

  // Connexion
  const login = useCallback(async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        if (data.accessToken) {
          setLocalStorageToken(data.accessToken);
        }
        return { success: true };
      } else {
        setError(data.error || 'Erreur de connexion');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inscription
  const register = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password, confirmPassword }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        if (data.accessToken) {
          setLocalStorageToken(data.accessToken);
        }
        return { success: true };
      } else {
        setError(data.error || 'Erreur d\'inscription');
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Erreur de connexion au serveur';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Déconnexion
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      removeLocalStorageToken();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return { ...prevUser, ...userData };
    });
  }, []);

  // Vérifier l'auth au chargement
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkAuth();
      setIsLoading(false);
    };
    
    initAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push('/auth/login');
    }
  }, [auth.isLoading, auth.user, router]);

  return auth;
}

export function useRequireAdmin() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.user) {
        router.push('/auth/login');
      } else if (auth.user.role !== 'ADMIN') {
        router.push('/unauthorized');
      }
    }
  }, [auth.isLoading, auth.user, router]);

  return auth;
}