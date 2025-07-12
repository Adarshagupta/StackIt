import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, withOptionalAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse, createPaginatedResponse } from '@/lib/middleware'
import { questionSchema, searchSchema } from '@/lib/validations'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'newest'
    const sort = searchParams.get('sort') || 'newest'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    let where: any = {}
    
    // Apply search filter
    if (search) {
      where = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ]
      }
    }
    
    // Apply filter conditions
    if (filter === 'unanswered') {
      where.answers = {
        none: {}
      }
    }
    
    // Define sort order
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'votes':
        orderBy = { voteCount: 'desc' }
        break
      case 'views':
        orderBy = { viewCount: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }
    
    if (filter === 'popular') {
      orderBy = { voteCount: 'desc' }
    }

    const questions = await db.question.findMany({
      where,
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
        _count: {
          select: {
            answers: true,
            votes: true,
            views: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    // Calculate actual vote counts
    const questionsWithVotes = await Promise.all(
      questions.map(async (question: any) => {
        const votes = await db.vote.findMany({
          where: { questionId: question.id },
          select: { type: true }
        })
        
        const upVotes = votes.filter((vote: any) => vote.type === 'UP').length
        const downVotes = votes.filter((vote: any) => vote.type === 'DOWN').length
        const voteCount = upVotes - downVotes
        
        return {
          ...question,
          voteCount,
          answerCount: question._count.answers,
          viewCount: question._count.views
        }
      })
    )

    return NextResponse.json({
      questions: questionsWithVotes,
      hasMore: questions.length === limit,
      total: questions.length
    })

  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      
      // Validate request body
      const validatedData = questionSchema.parse(body)
      
      // Check if tags exist, create them if they don't
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
      
      // Create question with transaction
      const question = await db.$transaction(async (tx: any) => {
        const newQuestion = await tx.question.create({
          data: {
            title: validatedData.title,
            content: validatedData.content,
            authorId: req.user!.id,
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
        
        return newQuestion
      })
      
      return createSuccessResponse(question, 'Question created successfully')
      
    } catch (error) {
      console.error('Create question error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid question data', 400)
      }
      
      return createErrorResponse('Failed to create question')
    }
  })
} 