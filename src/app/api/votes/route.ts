import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { broadcastVoteUpdate } from '@/lib/websocket'

export async function POST(request: NextRequest) {
  try {
    const { questionId, answerId, type } = await request.json()
    
    // Get current user from auth
    const user = getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!questionId && !answerId) {
      return NextResponse.json(
        { error: 'Either questionId or answerId is required' },
        { status: 400 }
      )
    }
    
    if (!type || (type !== 'UP' && type !== 'DOWN')) {
      return NextResponse.json(
        { error: 'Type must be either UP or DOWN' },
        { status: 400 }
      )
    }
    
    // Check if user has already voted on this question/answer
    const existingVote = await db.vote.findFirst({
      where: {
        userId: user.id,
        ...(questionId && { questionId }),
        ...(answerId && { answerId })
      }
    })
    
    if (existingVote) {
      if (existingVote.type === type) {
        // Same vote type - remove the vote (toggle off)
        await db.vote.delete({
          where: { id: existingVote.id }
        })
      } else {
        // Different vote type - update the vote
        await db.vote.update({
          where: { id: existingVote.id },
          data: { type }
        })
      }
    } else {
      // No existing vote - create new vote
      await db.vote.create({
        data: {
          userId: user.id,
          type,
          ...(questionId && { questionId }),
          ...(answerId && { answerId })
        }
      })
    }
    
    // Calculate new vote counts
    const votes = await db.vote.findMany({
      where: {
        ...(questionId && { questionId }),
        ...(answerId && { answerId })
      },
      select: { type: true }
    })
    
    const upVotes = votes.filter((vote: any) => vote.type === 'UP').length
    const downVotes = votes.filter((vote: any) => vote.type === 'DOWN').length
    const voteCount = upVotes - downVotes
    
    // Update the question/answer vote count
    if (questionId) {
      await db.question.update({
        where: { id: questionId },
        data: { voteCount }
      })
    }
    
    if (answerId) {
      await db.answer.update({
        where: { id: answerId },
        data: { voteCount }
      })
    }
    
    // Broadcast vote update via WebSocket
    if (questionId) {
      broadcastVoteUpdate(questionId, {
        targetId: questionId,
        targetType: 'question',
        voteCount,
        userVote: existingVote ? (existingVote.type === type ? null : type) : type
      })
    }
    
    if (answerId) {
      // Get the question ID for the answer
      const answer = await db.answer.findUnique({
        where: { id: answerId },
        select: { questionId: true }
      })
      
      if (answer) {
        broadcastVoteUpdate(answer.questionId, {
          targetId: answerId,
          targetType: 'answer',
          voteCount,
          userVote: existingVote ? (existingVote.type === type ? null : type) : type
        })
      }
    }

    return NextResponse.json({
      success: true,
      voteCount,
      userVote: existingVote ? (existingVote.type === type ? null : type) : type
    })
    
  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionId = searchParams.get('questionId')
    const answerId = searchParams.get('answerId')
    
    // Get current user from auth
    const user = getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!questionId && !answerId) {
      return NextResponse.json(
        { error: 'Either questionId or answerId is required' },
        { status: 400 }
      )
    }
    
    // Find user's vote
    const votes = await db.vote.findMany({
      where: {
        userId: user.id,
        ...(questionId && { questionId }),
        ...(answerId && { answerId })
      },
      select: {
        id: true,
        type: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      success: true,
      votes
    })
    
  } catch (error) {
    console.error('Error getting votes:', error)
    return NextResponse.json(
      { error: 'Failed to get votes' },
      { status: 500 }
    )
  }
} 