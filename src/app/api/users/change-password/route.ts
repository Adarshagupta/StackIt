import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { hashPassword, comparePassword } from '@/lib/auth'
import { ZodError } from 'zod'

// POST /api/users/change-password - Change user password
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { currentPassword, newPassword } = body

      // Validate input
      if (!currentPassword || typeof currentPassword !== 'string') {
        return createErrorResponse('Current password is required', 400)
      }

      if (!newPassword || typeof newPassword !== 'string') {
        return createErrorResponse('New password is required', 400)
      }

      if (newPassword.length < 8) {
        return createErrorResponse('New password must be at least 8 characters', 400)
      }

      if (newPassword.length > 128) {
        return createErrorResponse('New password must be less than 128 characters', 400)
      }

      // Check password complexity
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
      if (!passwordRegex.test(newPassword)) {
        return createErrorResponse('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400)
      }

      // Get current user from database
      const user = await db.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          password: true
        }
      })

      if (!user) {
        return createErrorResponse('User not found', 404)
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return createErrorResponse('Current password is incorrect', 400)
      }

      // Check if new password is the same as current password
      const isSamePassword = await comparePassword(newPassword, user.password)
      if (isSamePassword) {
        return createErrorResponse('New password must be different from current password', 400)
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword)

      // Update user password
      await db.user.update({
        where: { id: req.user!.id },
        data: {
          password: hashedNewPassword
        }
      })

      return createSuccessResponse(
        { message: 'Password changed successfully' },
        'Password changed successfully'
      )

    } catch (error) {
      console.error('Change password error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid password data', 400)
      }

      return createErrorResponse('Failed to change password')
    }
  })
} 