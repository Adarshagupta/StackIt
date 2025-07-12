import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, withOptionalAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse, requireOwnership } from '@/lib/middleware'
import { updateQuestionSchema } from '@/lib/validations'
import { ZodError } from 'zod'

// GET /api/questions/[id] - Get question by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withOptionalAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const questionId = params.id
      
      // Get question with full details
      const question = await db.question.findUnique({
        where: { id: questionId },
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
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  description: true
                }
              }
            }
          },
          answers: {
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
                }
              },
              _count: {
                select: {
                  votes: true,
                  comments: true
                }
              }
            },
            orderBy: [
              { isAccepted: 'desc' },
              { voteCount: 'desc' },
              { createdAt: 'asc' }
            ]
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
              answers: true,
              votes: true,
              views: true
            }
          }
        }
      })
      
      if (!question) {
        return createErrorResponse('Question not found', 404)
      }
      
      // Track view if user is not the author
      if (req.user && req.user.id !== question.authorId) {
        // Check if user has already viewed this question
        const existingView = await db.questionView.findUnique({
          where: {
            userId_questionId: {
              userId: req.user.id,
              questionId: questionId
            }
          }
        })
        
        if (!existingView) {
          await db.$transaction(async (tx: any) => {
            await tx.questionView.create({
              data: {
                userId: req.user!.id,
                questionId: questionId
              }
            })
            
            await tx.question.update({
              where: { id: questionId },
              data: {
                viewCount: { increment: 1 }
              }
            })
          })
        }
      } else if (!req.user) {
        // Anonymous view - increment view count
        await db.question.update({
          where: { id: questionId },
          data: {
            viewCount: { increment: 1 }
          }
        })
      }
      
      return createSuccessResponse(question)
      
    } catch (error) {
      console.error('Get question error:', error)
      return createErrorResponse('Failed to fetch question')
    }
  })
}

// PUT /api/questions/[id] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const questionId = params.id
      const body = await request.json()
      
      // Validate request body
      const validatedData = updateQuestionSchema.parse(body)
      
      // Get existing question
      const existingQuestion = await db.question.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          authorId: true
        }
      })
      
      if (!existingQuestion) {
        return createErrorResponse('Question not found', 404)
      }
      
      // Check ownership
      if (!requireOwnership(req.user!.id, existingQuestion.authorId, req.user!.role)) {
        return createErrorResponse('Not authorized to update this question', 403)
      }
      
      // Update question
      const updateData: any = {}
      
      if (validatedData.title) {
        updateData.title = validatedData.title
      }
      
      if (validatedData.content) {
        updateData.content = validatedData.content
      }
      
      let question
      
      if (validatedData.tags) {
        // Handle tags update
        const tagRecords: Array<{ id: string; name: string; color: string | null }> = []
        for (const tagName of validatedData.tags) {
          let tag = await db.tag.findUnique({
            where: { name: tagName.toLowerCase() }
          })
          
          if (!tag) {
            tag = await db.tag.create({
              data: {
                name: tagName.toLowerCase(),
                description: `Tag for ${tagName}`,
                color: '#3B82F6'
              }
            })
          }
          
          tagRecords.push(tag)
        }
        
        // Update with transaction
        question = await db.$transaction(async (tx: any) => {
          // Remove existing tags
          await tx.questionTag.deleteMany({
            where: { questionId: questionId }
          })
          
          // Update question and add new tags
          return await tx.question.update({
            where: { id: questionId },
            data: {
              ...updateData,
              tags: {
                create: tagRecords.map(tag => ({
                  tagId: tag.id
                }))
              }
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
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                      color: true
                    }
                  }
                }
              },
              _count: {
                select: {
                  answers: true,
                  votes: true,
                  views: true
                }
              }
            }
          })
        })
      } else {
        // Update without tags
        question = await db.question.update({
          where: { id: questionId },
          data: updateData,
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
            tags: {
              include: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true
                  }
                }
              }
            },
            _count: {
              select: {
                answers: true,
                votes: true,
                views: true
              }
            }
          }
        })
      }
      
      return createSuccessResponse(question, 'Question updated successfully')
      
    } catch (error) {
      console.error('Update question error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid question data', 400)
      }
      
      return createErrorResponse('Failed to update question')
    }
  })
}

// DELETE /api/questions/[id] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const questionId = params.id
      
      // Get existing question
      const existingQuestion = await db.question.findUnique({
        where: { id: questionId },
        select: {
          id: true,
          authorId: true,
          title: true
        }
      })
      
      if (!existingQuestion) {
        return createErrorResponse('Question not found', 404)
      }
      
      // Check ownership
      if (!requireOwnership(req.user!.id, existingQuestion.authorId, req.user!.role)) {
        return createErrorResponse('Not authorized to delete this question', 403)
      }
      
      // Delete question (cascade will handle related records)
      await db.question.delete({
        where: { id: questionId }
      })
      
      return createSuccessResponse(
        { id: questionId },
        'Question deleted successfully'
      )
      
    } catch (error) {
      console.error('Delete question error:', error)
      return createErrorResponse('Failed to delete question')
    }
  })
} 