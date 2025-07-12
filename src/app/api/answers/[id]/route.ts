import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, withOptionalAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse, requireOwnership } from '@/lib/middleware'
import { answerSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// GET /api/answers/[id] - Get answer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const answerId = params.id
      
      // Get answer with full details
      const answer = await db.answer.findUnique({
        where: { id: answerId },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true
            }
          },
          question: {
            select: {
              id: true,
              title: true,
              authorId: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true
            }
          }
        }
      })
      
      if (!answer) {
        return createErrorResponse('Answer not found', 404)
      }
      
      return createSuccessResponse(answer)
      
    } catch (error) {
      console.error('Get answer error:', error)
      return createErrorResponse('Failed to fetch answer')
    }
  })
}

// PUT /api/answers/[id] - Update answer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const answerId = params.id
      const body = await request.json()
      
      // Validate request body (only content can be updated)
      const { content } = body
      
      if (!content || typeof content !== 'string') {
        return createErrorResponse('Content is required', 400)
      }
      
      if (content.length < 20) {
        return createErrorResponse('Answer must be at least 20 characters', 400)
      }
      
      if (content.length > 10000) {
        return createErrorResponse('Answer must be less than 10,000 characters', 400)
      }
      
      // Get existing answer
      const existingAnswer = await db.answer.findUnique({
        where: { id: answerId },
        select: {
          id: true,
          authorId: true
        }
      })
      
      if (!existingAnswer) {
        return createErrorResponse('Answer not found', 404)
      }
      
      // Check ownership
      if (!requireOwnership(req.user!.id, existingAnswer.authorId, req.user!.role)) {
        return createErrorResponse('Not authorized to update this answer', 403)
      }
      
      // Update answer
      const answer = await db.answer.update({
        where: { id: answerId },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true
            }
          },
          votes: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          },
          _count: {
            select: {
              votes: true,
              comments: true
            }
          }
        }
      })
      
      return createSuccessResponse(answer, 'Answer updated successfully')
      
    } catch (error) {
      console.error('Update answer error:', error)
      return createErrorResponse('Failed to update answer')
    }
  })
}

// DELETE /api/answers/[id] - Delete answer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const answerId = params.id
      
      // Get existing answer
      const existingAnswer = await db.answer.findUnique({
        where: { id: answerId },
        select: {
          id: true,
          authorId: true,
          questionId: true
        }
      })
      
      if (!existingAnswer) {
        return createErrorResponse('Answer not found', 404)
      }
      
      // Check ownership
      if (!requireOwnership(req.user!.id, existingAnswer.authorId, req.user!.role)) {
        return createErrorResponse('Not authorized to delete this answer', 403)
      }
      
      // Delete answer with transaction
      await db.$transaction(async (tx: any) => {
        await tx.answer.delete({
          where: { id: answerId }
        })
        
        // Update question answer count
        await tx.question.update({
          where: { id: existingAnswer.questionId },
          data: { answerCount: { decrement: 1 } }
        })
      })
      
      return createSuccessResponse(
        { id: answerId },
        'Answer deleted successfully'
      )
      
    } catch (error) {
      console.error('Delete answer error:', error)
      return createErrorResponse('Failed to delete answer')
    }
  })
} 