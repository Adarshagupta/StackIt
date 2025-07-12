import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { broadcastAnswerAccepted } from '@/lib/websocket'

// POST /api/answers/[id]/accept - Accept an answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const answerId = params.id
      
      // Get answer and associated question
      const answer = await db.answer.findUnique({
        where: { id: answerId },
        include: {
          question: {
            select: {
              id: true,
              authorId: true,
              isAnswered: true
            }
          }
        }
      })
      
      if (!answer) {
        return createErrorResponse('Answer not found', 404)
      }
      
      // Check if user is the question author
      if (answer.question.authorId !== req.user!.id) {
        return createErrorResponse('Only the question author can accept answers', 403)
      }
      
      // Toggle acceptance status
      const newAcceptedStatus = !answer.isAccepted
      
      // Update answer and question status with transaction
      const result = await db.$transaction(async (tx: any) => {
        // If accepting this answer, unaccept all other answers for this question
        if (newAcceptedStatus) {
          await tx.answer.updateMany({
            where: {
              questionId: answer.questionId,
              isAccepted: true
            },
            data: {
              isAccepted: false
            }
          })
        }
        
        // Update the current answer
        const updatedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: { isAccepted: newAcceptedStatus },
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
        
        // Update question answered status
        await tx.question.update({
          where: { id: answer.questionId },
          data: { isAnswered: newAcceptedStatus }
        })
        
        return updatedAnswer
      })
      
      // Broadcast answer acceptance via WebSocket
      broadcastAnswerAccepted(answer.questionId, {
        answerId,
        isAccepted: newAcceptedStatus
      })
      
      return createSuccessResponse(
        result,
        newAcceptedStatus ? 'Answer accepted successfully' : 'Answer unaccepted successfully'
      )
      
    } catch (error) {
      console.error('Accept answer error:', error)
      return createErrorResponse('Failed to accept answer')
    }
  })
}

// DELETE /api/answers/[id]/accept - Unaccept an answer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const answerId = params.id
      
      // Get answer and associated question
      const answer = await db.answer.findUnique({
        where: { id: answerId },
        include: {
          question: {
            select: {
              id: true,
              authorId: true
            }
          }
        }
      })
      
      if (!answer) {
        return createErrorResponse('Answer not found', 404)
      }
      
      // Check if user is the question author
      if (answer.question.authorId !== req.user!.id) {
        return createErrorResponse('Only the question author can unaccept answers', 403)
      }
      
      // Check if answer is actually accepted
      if (!answer.isAccepted) {
        return createErrorResponse('Answer is not accepted', 400)
      }
      
      // Unaccept answer and update question status
      const result = await db.$transaction(async (tx: any) => {
        const updatedAnswer = await tx.answer.update({
          where: { id: answerId },
          data: { isAccepted: false },
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
        
        // Update question answered status
        await tx.question.update({
          where: { id: answer.questionId },
          data: { isAnswered: false }
        })
        
        return updatedAnswer
      })
      
      // Broadcast answer unacceptance via WebSocket
      broadcastAnswerAccepted(answer.questionId, {
        answerId,
        isAccepted: false
      })
      
      return createSuccessResponse(result, 'Answer unaccepted successfully')
      
    } catch (error) {
      console.error('Unaccept answer error:', error)
      return createErrorResponse('Failed to unaccept answer')
    }
  })
} 