import { db } from '@/lib/db'
import MainLayout from '@/components/layouts/MainLayout'
import RightSidebar from '@/components/layouts/RightSidebar'
import HomeContent from '@/components/home/HomeContent'

interface QuestionWithDetails {
  id: string
  title: string
  content: string
  voteCount: number
  answerCount: number
  viewCount: number
  createdAt: Date
  author: {
    id: string
    username: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
    role: string
  }
  tags: Array<{
    tag: {
      id: string
      name: string
      color: string | null
      description: string | null
    }
  }>
  _count: {
    answers: number
    votes: number
    views: number
  }
}

async function getQuestions(): Promise<QuestionWithDetails[]> {
  try {
    const questions = await db.question.findMany({
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    return questions as QuestionWithDetails[]
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

async function getPopularQuestions(): Promise<QuestionWithDetails[]> {
  try {
    const questions = await db.question.findMany({
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
      orderBy: {
        voteCount: 'desc'
      },
      take: 3
    })
    return questions as QuestionWithDetails[]
  } catch (error) {
    console.error('Error fetching popular questions:', error)
    return []
  }
}

export default async function HomePage() {
  const [questions, popularQuestions] = await Promise.all([
    getQuestions(),
    getPopularQuestions()
  ])

  const rightSidebarContent = <RightSidebar popularQuestions={popularQuestions} />

  return (
    <MainLayout rightSidebarContent={rightSidebarContent}>
      <HomeContent 
        initialQuestions={questions} 
        initialPopularQuestions={popularQuestions}
      />
    </MainLayout>
  )
}
