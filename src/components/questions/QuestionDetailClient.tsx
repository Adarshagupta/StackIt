'use client'

import { formatDate } from '@/lib/utils'
import { Share2, Bookmark, Flag, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import VoteControls from '@/components/ui/VoteControls'
import RichTextDisplay from '@/components/ui/RichTextDisplay'
import AnswerForm from '@/components/answers/AnswerForm'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useState, useEffect } from 'react'

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
  createdAt: Date
  firstName?: string
  lastName?: string
  avatar?: string
  role: string
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
  voteCount: number
}

interface Question {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  viewCount: number
  voteCount: number
  author: User
  tags: QuestionTag[]
  votes: Vote[]
  comments: Comment[]
  answers: Answer[]
}

interface QuestionDetailClientProps {
  question: Question
}

export default function QuestionDetailClient({ question }: QuestionDetailClientProps) {
  const { user, isAuthenticated } = useAuth()
  const { joinQuestion, leaveQuestion, onNewAnswer, onAnswerAccepted } = useWebSocket()
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null)
  const [answers, setAnswers] = useState(question.answers)
  
  const answerCount = answers.length
  const viewCount = question.viewCount || 0

  const isQuestionAuthor = isAuthenticated && user?.id === question.author.id

  // Join question room for real-time updates
  useEffect(() => {
    joinQuestion(question.id)
    
    return () => {
      leaveQuestion(question.id)
    }
  }, [question.id, joinQuestion, leaveQuestion])

  // Listen for new answers
  useEffect(() => {
    const cleanup = onNewAnswer((event) => {
      const newAnswer = event.payload
      // Only add if it's for this question
      if (newAnswer.questionId === question.id) {
        setAnswers(prev => [...prev, newAnswer])
      }
    })

    return cleanup
  }, [question.id, onNewAnswer])

  // Listen for answer acceptance changes
  useEffect(() => {
    const cleanup = onAnswerAccepted((event) => {
      const { answerId, isAccepted } = event.payload
      setAnswers(prev => prev.map(answer => 
        answer.id === answerId 
          ? { ...answer, isAccepted }
          : { ...answer, isAccepted: false } // Unaccept other answers
      ))
    })

    return cleanup
  }, [onAnswerAccepted])

  const handleDeleteQuestion = async () => {
    if (!user || !isQuestionAuthor) return
    
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        // Redirect to home page after successful deletion
        window.location.href = '/'
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete question')
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAnswer = async (answerId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to delete this answer? This action cannot be undone.')) {
      return
    }
    
    setDeletingAnswerId(answerId)
    try {
      const response = await fetch(`/api/answers/${answerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        // Remove answer from local state
        setAnswers(prev => prev.filter(answer => answer.id !== answerId))
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete answer')
      }
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('Failed to delete answer')
    } finally {
      setDeletingAnswerId(null)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !isQuestionAuthor) return
    
    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        // Update will be handled by WebSocket
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to accept answer')
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
      alert('Failed to accept answer')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Question Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">{question.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>Asked {new Date(question.createdAt).toLocaleDateString()}</span>
          <span>Modified {new Date(question.updatedAt).toLocaleDateString()}</span>
          <span>Viewed {viewCount} times</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex gap-6 mb-8">
        {/* Vote Controls */}
        <VoteControls 
          questionId={question.id}
          initialVoteCount={question.voteCount}
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
            {question.tags.map((tagRelation: QuestionTag) => (
              <span
                key={tagRelation.tag.id}
                className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-sm"
              >
                {tagRelation.tag.name}
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
                  <p className="text-xs text-gray-500">Member since {new Date(question.author.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {question.comments.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Comments</h3>
          <div className="space-y-3">
            {question.comments.map((comment: Comment) => (
              <div key={comment.id} className="bg-gray-800 p-4 rounded-lg">
                <RichTextDisplay 
                  content={comment.content} 
                  className="text-gray-300"
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <span>{comment.author.username}</span>
                  <span>•</span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">
          {answerCount} {answerCount === 1 ? 'Answer' : 'Answers'}
        </h2>
        
        {answers.map((answer: Answer) => {
          const isAnswerAuthor = isAuthenticated && user?.id === answer.author.id
          
          return (
            <div key={answer.id} className="flex gap-6 mb-8 p-6 bg-gray-800 rounded-lg">
              {/* Answer Vote Controls */}
              <VoteControls 
                answerId={answer.id}
                initialVoteCount={answer.voteCount}
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
                        <p className="text-xs text-gray-500">Member since {new Date(answer.author.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Comments */}
                {answer.comments.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="space-y-2">
                      {answer.comments.map((comment: Comment) => (
                        <div key={comment.id} className="bg-gray-700 p-3 rounded">
                          <RichTextDisplay 
                            content={comment.content} 
                            className="text-gray-300 text-sm"
                          />
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>{comment.author.username}</span>
                            <span>•</span>
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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