import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { ZodError } from 'zod'

// GET /api/users/profile - Get user profile
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const user = await db.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          role: true,
          createdAt: true,
          isActive: true,
          _count: {
            select: {
              questions: true,
              answers: true
            }
          }
        }
      })

      if (!user) {
        return createErrorResponse('User not found', 404)
      }

      return createSuccessResponse(user)
    } catch (error) {
      console.error('Get profile error:', error)
      return createErrorResponse('Failed to fetch profile')
    }
  })
}

// PUT /api/users/profile - Update user profile
export async function PUT(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { firstName, lastName, bio, email, username } = body

      // Validate input
      if (email && typeof email !== 'string') {
        return createErrorResponse('Invalid email format', 400)
      }

      if (username && typeof username !== 'string') {
        return createErrorResponse('Invalid username format', 400)
      }

      if (username && username.length < 3) {
        return createErrorResponse('Username must be at least 3 characters', 400)
      }

      if (username && username.length > 50) {
        return createErrorResponse('Username must be less than 50 characters', 400)
      }

      if (bio && typeof bio === 'string' && bio.length > 500) {
        return createErrorResponse('Bio must be less than 500 characters', 400)
      }

      // Check if username is already taken by another user
      if (username && username !== req.user!.username) {
        const existingUser = await db.user.findFirst({
          where: {
            username,
            NOT: {
              id: req.user!.id
            }
          }
        })

        if (existingUser) {
          return createErrorResponse('Username already taken', 400)
        }
      }

      // Check if email is already taken by another user
      if (email && email !== req.user!.email) {
        const existingUser = await db.user.findFirst({
          where: {
            email,
            NOT: {
              id: req.user!.id
            }
          }
        })

        if (existingUser) {
          return createErrorResponse('Email already in use', 400)
        }
      }

      // Update user profile
      const updatedUser = await db.user.update({
        where: { id: req.user!.id },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(bio !== undefined && { bio }),
          ...(email !== undefined && { email }),
          ...(username !== undefined && { username })
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          bio: true,
          avatar: true,
          role: true,
          createdAt: true,
          isActive: true,
          _count: {
            select: {
              questions: true,
              answers: true
            }
          }
        }
      })

      return createSuccessResponse(updatedUser, 'Profile updated successfully')
    } catch (error) {
      console.error('Update profile error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid profile data', 400)
      }

      return createErrorResponse('Failed to update profile')
    }
  })
} 