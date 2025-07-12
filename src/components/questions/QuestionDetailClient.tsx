'use client'

import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Check, MoreHorizontal, Share2, Flag, Edit3, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'
import VoteControls from '@/components/ui/VoteControls'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import AnswerForm from '@/components/answers/AnswerForm'
import { Button } from '@/components/ui/Button'

interface Vote {
  id: string
  type: 'UP' | 'DOWN'
  userId: string
  user: {
    id: string
    username: string
  }
}

interface Answer {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  isAccepted: boolean
  authorId: string
  author: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar: string | null
    role: string
  }
  votes: Vote[]
  _count: {
    votes: number
    comments: number
  }
}

interface Question {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  views: number
  authorId: string
  author: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar: string | null
    role: string
  }
  votes: Vote[]
  answers: Answer[]
  tags: Array<{
    id: string
    name: string
    color: string | null
  }>
  _count: {
    votes: number
    answers: number
  }
}

interface QuestionDetailClientProps {
  question: Question
}

export default function QuestionDetailClient({ question: initialQuestion }: QuestionDetailClientProps) {
  const { user, isAuthenticated } = useAuth()
  const { isConnected, onNewAnswer, onAnswerAccepted, joinQuestion, leaveQuestion } = useWebSocket()
  const [question, setQuestion] = useState<Question>(initialQuestion)
  const [answers, setAnswers] = useState<Answer[]>(initialQuestion.answers)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null)

  const answerCount = answers.length
  const viewCount = question.views || 0

  const isQuestionAuthor = isAuthenticated && user?.id === question.authorId

  useEffect(() => {
    if (isConnected && question.id) {
      joinQuestion(question.id)
      
      const cleanupNewAnswer = onNewAnswer((event) => {
        if (event.payload && typeof event.payload === 'object' && 'id' in event.payload) {
          const newAnswer = event.payload as Answer
          setAnswers(prev => [...prev, newAnswer])
        }
      })

      const cleanupAccepted = onAnswerAccepted((event) => {
        if (event.payload && typeof event.payload === 'object' && 'answerId' in event.payload && 'isAccepted' in event.payload) {
          const { answerId, isAccepted } = event.payload as { answerId: string; isAccepted: boolean }
          setAnswers(prev => 
            prev.map(answer => 
              answer.id === answerId ? { ...answer, isAccepted } : answer
            )
          )
        }
      })

      return () => {
        cleanupNewAnswer()
        cleanupAccepted()
        leaveQuestion(question.id)
      }
    }
  }, [isConnected, question.id, joinQuestion, leaveQuestion, onNewAnswer, onAnswerAccepted])

  const handleDeleteQuestion = async () => {
    if (!isAuthenticated || !user) return

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Redirect to home page after successful deletion
        window.location.href = '/'
      } else {
        console.error('Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!isAuthenticated || !user) return

    setDeletingAnswerId(answerId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setAnswers(prev => prev.filter(answer => answer.id !== answerId))
      } else {
        console.error('Failed to delete answer')
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
    } finally {
      setDeletingAnswerId(null)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!isAuthenticated || !user) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Update will be handled by WebSocket event
      } else {
        console.error('Failed to accept answer')
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{question.title}</h1>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
          <span>Viewed {viewCount.toLocaleString()} times</span>
          <span>{answerCount} {answerCount === 1 ? 'answer' : 'answers'}</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex gap-6 mb-8">
        {/* Vote Controls */}
        <VoteControls 
          questionId={question.id}
          initialVoteCount={question._count?.votes || question.votes?.length || 0}
        />

        {/* Question Body */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-lg p-6 mb-4">
            <RichTextDisplay 
              content={question.content} 
              className="text-gray-300 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>

          {/* Question Actions */}
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Flag className="h-4 w-4 mr-2" />
              Flag
            </Button>
            {isQuestionAuthor && (
              <>
                <Button variant="ghost" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteQuestion}
                  disabled={isDeleting}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
          </div>

          {/* Author Info */}
          <div className="flex justify-end">
            <div className="bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">
                asked {new Date(question.createdAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {question.author.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-blue-400 font-medium">{question.author.username}</p>
                  <p className="text-xs text-gray-500">
                    {question.author.firstName} {question.author.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {answerCount} {answerCount === 1 ? 'Answer' : 'Answers'}
        </h2>
        
        {answers.map((answer: Answer) => {
          const isAnswerAuthor = isAuthenticated && user?.id === answer.authorId
          
          return (
            <div key={answer.id} className="flex gap-6 mb-8 p-6 bg-gray-800 rounded-lg">
              {/* Answer Vote Controls */}
              <VoteControls 
                answerId={answer.id}
                initialVoteCount={answer._count?.votes || answer.votes?.length || 0}
              />

              {/* Answer Content */}
              <div className="flex-1">
                <div className="mb-4">
                  <RichTextDisplay 
                    content={answer.content} 
                    className="text-gray-300 leading-relaxed"
                  />
                </div>

                {/* Answer Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    Flag
                  </Button>
                  {isAnswerAuthor && (
                    <>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteAnswer(answer.id)}
                        disabled={deletingAnswerId === answer.id}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingAnswerId === answer.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </>
                  )}
                  {isQuestionAuthor && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleAcceptAnswer(answer.id)}
                      className={answer.isAccepted ? 'text-green-500' : ''}
                    >
                      {answer.isAccepted ? '✓ Accepted' : 'Accept Answer'}
                    </Button>
                  )}
                </div>

                {/* Answer Author Info */}
                <div className="flex justify-end">
                  <div className="bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">
                      answered {new Date(answer.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {answer.author.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-blue-400 font-medium">{answer.author.username}</p>
                        <p className="text-xs text-gray-500">
                          {answer.author.firstName} {answer.author.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Answer Form */}
      <AnswerForm questionId={question.id} />
    </div>
  )
} 