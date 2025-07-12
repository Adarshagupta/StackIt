import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, AuthenticatedRequest, createSuccessResponse, createErrorResponse } from '@/lib/middleware'
import { ZodError } from 'zod'

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build where clause for search
    const where = search ? {
      name: {
        contains: search.toLowerCase(),
        mode: 'insensitive' as const
      }
    } : {}
    
    const tags = await db.tag.findMany({
      where,
      select: {
        id: true,
        name: true,
        color: true,
        description: true,
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: [
        { questions: { _count: 'desc' } },
        { name: 'asc' }
      ],
      take: limit
    })
    
    return NextResponse.json(tags)
    
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  return withAuth(request, async () => {
    try {
      const body = await request.json()
      const { name, description, color } = body
      
      if (!name || typeof name !== 'string') {
        return createErrorResponse('Tag name is required', 400)
      }
      
      // Clean the tag name (remove hashtags, lowercase, trim)
      const cleanName = name.replace(/^#+/, '').toLowerCase().trim()
      
      if (cleanName.length < 2) {
        return createErrorResponse('Tag name must be at least 2 characters', 400)
      }
      
      if (cleanName.length > 25) {
        return createErrorResponse('Tag name must be less than 25 characters', 400)
      }
      
      // Check if tag already exists
      const existingTag = await db.tag.findUnique({
        where: { name: cleanName }
      })
      
      if (existingTag) {
        return createSuccessResponse(existingTag, 'Tag already exists')
      }
      
      // Create new tag
      const tag = await db.tag.create({
        data: {
          name: cleanName,
          description: description || `Tag for ${cleanName}`,
          color: color || '#3B82F6'
        }
      })
      
      return createSuccessResponse(tag, 'Tag created successfully')
      
    } catch (error) {
      console.error('Create tag error:', error)
      
      if (error instanceof ZodError) {
        return createErrorResponse('Invalid tag data', 400)
      }
      
      return createErrorResponse('Failed to create tag')
    }
  })
} 