import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import MainLayout from '@/components/layouts/MainLayout'
import QuestionDetailClient from '@/components/questions/QuestionDetailClient'

interface Vote {
  id: string
  type: 'UP' | 'DOWN'
  userId: string
  questionId?: string
  answerId?: string
}

interface Tag {
  id: string
  name: string
}

interface QuestionTag {
  tag: Tag
}

interface User {
  id: string
  username: string
  email: string
  reputation: number
  createdAt: Date
}

interface Comment {
  id: string
  content: string
  createdAt: Date
  author: User
}

interface Answer {
  id: string
  content: string
  isAccepted: boolean
  createdAt: Date
  author: User
  votes: Vote[]
  comments: Comment[]
}

interface QuestionDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getQuestionWithAnswers(id: string) {
  const currentUserId = "cmd00k5ax00011as72wyai9l8" // This should come from auth context
  
  try {
    const question = await db.question.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true
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
              select: {
                id: true,
                type: true,
                userId: true
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
            }
          },
          orderBy: {
            voteCount: 'desc'
          }
        },
        votes: {
          select: {
            id: true,
            type: true,
            userId: true
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
            answers: true,
            votes: true,
            views: true
          }
        }
      }
    })

    if (!question) {
      return null
    }

    // Calculate vote counts for question
    const upVotes = question.votes.filter((vote: any) => vote.type === 'UP').length
    const downVotes = question.votes.filter((vote: any) => vote.type === 'DOWN').length
    const voteCount = upVotes - downVotes

    // Calculate vote counts for answers
    const answersWithVoteCounts = question.answers.map((answer: any) => {
      const answerUpVotes = answer.votes.filter((vote: any) => vote.type === 'UP').length
      const answerDownVotes = answer.votes.filter((vote: any) => vote.type === 'DOWN').length
      const answerVoteCount = answerUpVotes - answerDownVotes

      return {
        ...answer,
        voteCount: answerVoteCount,
        userVote: answer.votes.find((vote: any) => vote.userId === currentUserId)?.type || null
      }
    })

    return {
      ...question,
      voteCount,
      userVote: question.votes.find((vote: any) => vote.userId === currentUserId)?.type || null,
      answers: answersWithVoteCounts
    }
  } catch (error) {
    console.error('Error fetching question:', error)
    return null
  }
}

export default async function QuestionDetailPage({ params }: QuestionDetailPageProps) {
  const { id } = await params
  const question = await getQuestionWithAnswers(id)
  
  if (!question) {
    notFound()
  }

  return (
    <MainLayout>
      <QuestionDetailClient question={question} />
    </MainLayout>
  )
}