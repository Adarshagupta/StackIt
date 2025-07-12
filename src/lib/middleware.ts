import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, hasRole, Role } from '@/lib/auth'
import { db } from '@/lib/db'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    username: string
    role: Role
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      )
    }
    
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Verify user still exists and is active
    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true
      }
    })
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'User account not found or inactive' },
        { status: 401 }
      )
    }
    
    // Add user to request
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role as Role
    }
    
    return handler(authenticatedRequest)
    
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

export async function withRole(
  request: NextRequest,
  requiredRole: Role,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(request, async (authenticatedRequest) => {
    const user = authenticatedRequest.user!
    
    if (!hasRole(user.role, requiredRole)) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return handler(authenticatedRequest)
  })
}

export async function withOptionalAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth header, proceed without user
      return handler(request as AuthenticatedRequest)
    }
    
    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (payload) {
      // Valid token, try to get user
      const user = await db.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true
        }
      })
      
      if (user && user.isActive) {
        const authenticatedRequest = request as AuthenticatedRequest
        authenticatedRequest.user = {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role as Role
        }
      }
    }
    
    return handler(request as AuthenticatedRequest)
    
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    // If there's an error, just proceed without user
    return handler(request as AuthenticatedRequest)
  }
}

export function requireOwnership(
  userId: string,
  resourceOwnerId: string,
  userRole: Role
): boolean {
  return userId === resourceOwnerId || userRole === Role.ADMIN
}

export function createAuthResponse(message: string, statusCode: number = 401) {
  return NextResponse.json(
    { success: false, error: message },
    { status: statusCode }
  )
}

export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    message
  })
}

export function createErrorResponse(error: string, statusCode: number = 500) {
  return NextResponse.json(
    { success: false, error },
    { status: statusCode }
  )
}

export function createPaginatedResponse(
  data: any[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  })
} 