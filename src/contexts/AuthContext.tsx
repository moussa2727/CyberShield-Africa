'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'sonner'

// Interface pour l'utilisateur
export interface User {
  id: string
  fullName: string
  email: string
  company?: string
  role: 'user' | 'admin'
  lastLogin?: string
}

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  isAdmin: () => boolean
  isAuthenticated: () => boolean
}

// Interface pour les données d'inscription
interface RegisterData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  company?: string
  role?: 'user' | 'admin'
}

// Créer le contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider d'authentification
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      const result = await response.json()

      if (result.success) {
        setUser(result.data.user)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Échec de la connexion')
        toast.error(result.error || 'Échec de la connexion')
        return
      }

      setUser(result.user)
      toast.success('Connexion réussie !')
    } catch (error) {
      setError('Erreur lors de la connexion')
      toast.error('Erreur lors de la connexion')
      console.error('Erreur login:', error)
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de l\'inscription')
      }

      setUser(result.data.user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      setError(null)

      await fetch('/api/auth/logout', {
        method: 'POST',
      })

      setUser(null)
      toast.success('Déconnexion réussie !')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      toast.error('Erreur lors de la déconnexion')
      // Même si l'API échoue, on déconnecte localement
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        setUser(result.data.user)
      } else {
        // Si le refresh token est invalide, déconnecter
        setUser(null)
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error)
      setUser(null)
    }
  }

  const updateUser = async (userData: Partial<User>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour')
      }

      setUser(result.data.user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isAuthenticated = () => {
    return user !== null
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    isAdmin,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}

// Hook pour protéger les composants
export function useRequireAuth() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated()) {
      window.location.href = '/login'
    }
  }, [auth.loading, auth.isAuthenticated])

  return auth
}

// Hook pour protéger les routes admin
export function useRequireAdmin() {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.loading) {
      if (!auth.isAuthenticated()) {
        window.location.href = '/login'
      } else if (!auth.isAdmin()) {
        window.location.href = '/unauthorized'
      }
    }
  }, [auth.loading, auth.isAuthenticated, auth.isAdmin])

  return auth
}
