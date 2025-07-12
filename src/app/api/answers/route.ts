import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { answerSchema } from '@/lib/validations'
import { ZodError } from 'zod'
import { broadcastNewAnswer } from '@/lib/websocket'

// POST /api/answers - Create a new answer
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      
      // Validate request body
      const validatedData = answerSchema.parse(body)
      const { questionId, content } = validatedData
      
      // Check if question exists
      const question = await db.question.findUnique({
        where: { id: questionId },
        select: { id: true, authorId: true }
      })
      
      if (!question) {
        return createErrorResponse('Question not found', 404)
      }
      
      // Create answer with transaction
      const answer = await db.$transaction(async (tx: any) => {
        const newAnswer = await tx.answer.create({
          data: {
            content,
            questionId,
            authorId: req.user!.id
          },
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
        
        // Update question answer count
        await tx.question.update({
          where: { id: questionId },
          data: { answerCount: { increment: 1 } }
        })
        
        return newAnswer
      })
      
      // Broadcast new answer via WebSocket
      broadcastNewAnswer(questionId, answer)
      
      return createSuccessResponse(answer, 'Answer created successfully')
      
    } catch (error) {
      console.error('Create answer error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid answer data', 400)
      }
      
      return createErrorResponse('Failed to create answer')
    }
  })
} 