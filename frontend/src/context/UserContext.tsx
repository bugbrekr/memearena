import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services'
import { User } from '../types/api'

interface UserContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, password: string, email: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isLoggedIn()) {
        await refreshUser()
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const refreshUser = async () => {
    try {
      const response = await authService.getProfile()
      if (response.success && response.data) {
        setUser({
          id: '', // Backend doesn't return ID yet
          username: response.data.username,
          email: response.data.email,
          is_admin: response.data.is_admin || false
        })
      } else {
        // Token might be invalid, clear it
        authService.logout()
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to get user profile:', error)
      authService.logout()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ username, password })
      if (response.success) {
        await refreshUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const register = async (username: string, password: string, email: string): Promise<boolean> => {
    try {
      const response = await authService.register({ username, password, email })
      if (response.success) {
        await refreshUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  const value: UserContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
