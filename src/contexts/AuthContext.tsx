'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuthUser, getStoredUser, setStoredUser, clearStoredUser } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load and validate user from localStorage on mount
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        
        if (storedToken) {
          // Validate token with server
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser(data.user)
            setStoredUser(data.user)
          } else {
            // Token is invalid, clear stored data
            clearStoredUser()
            localStorage.removeItem('token')
          }
        } else {
          // No token, clear any stale user data
          clearStoredUser()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear any corrupted data
        clearStoredUser()
        localStorage.removeItem('token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (userData: AuthUser, token: string) => {
    try {
      // Store both user data and token
      setUser(userData)
      setStoredUser(userData)
      localStorage.setItem('token', token)
      
      // Set the auth cookie
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
    } catch (error) {
      console.error('Failed to complete login:', error)
      // If anything fails, clean up
      setUser(null)
      clearStoredUser()
      localStorage.removeItem('token')
      throw error
    }
  }

  const logout = async () => {
    setUser(null)
    clearStoredUser()
    localStorage.removeItem('token')
    
    // Clear the auth cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Failed to logout on server:', error)
      // Continue with local logout even if server fails
    }
  }

  const updateUser = (userData: AuthUser) => {
    setUser(userData)
    setStoredUser(userData)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
} 