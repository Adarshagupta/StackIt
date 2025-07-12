import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export interface User {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string
  avatar: string | null
  role: string
}

export interface AuthUser {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  email: string
  avatar: string | null
  role: string
}

export function createToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Alias for createToken for compatibility
export const generateToken = createToken

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      email: decoded.email,
      avatar: decoded.avatar,
      role: decoded.role
    }
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function hasRole(user: AuthUser, requiredRole: Role): boolean {
  const roleHierarchy = {
    [Role.USER]: 1,
    [Role.MODERATOR]: 2,
    [Role.ADMIN]: 3
  }
  
  return roleHierarchy[user.role as Role] >= roleHierarchy[requiredRole]
}

export function getCurrentUser(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    
    return verifyToken(token)
  } catch (error) {
    return null
  }
}

export function setAuthCookie(response: Response, token: string) {
  response.headers.set(
    'Set-Cookie',
    `auth-token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
  )
}

export function clearAuthCookie(response: Response) {
  response.headers.set(
    'Set-Cookie',
    'auth-token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  )
}

// For client-side use
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    return null
  }
}

export function setStoredUser(user: AuthUser) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('user')
}

export function logout() {
  clearStoredUser()
  // Clear the auth cookie by making a request to logout endpoint
  fetch('/api/auth/logout', { method: 'POST' })
} 