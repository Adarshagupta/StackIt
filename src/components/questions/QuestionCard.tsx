'use client'

import { useState, useEffect } from 'react'
import { formatDate, formatNumber, removeHTMLTags } from '@/lib/utils'
import { ChevronUp, ChevronDown, MessageSquare, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

interface Tag {
  id: string
  name: string
  color: string | null
}

interface QuestionTag {
  tag: Tag
}

interface Author {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
}

interface QuestionCardProps {
  question: {
    id: string
    title: string
    content: string
    voteCount: number
    answerCount: number
    viewCount: number
    createdAt: Date | string
    author: Author
    tags: QuestionTag[]
    _count?: {
      answers: number
      votes: number
      views: number
    }
  }
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const { user, isAuthenticated } = useAuth()
  const [voteCount, setVoteCount] = useState(question.voteCount)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  // Load user's vote status for this question
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserVote()
    }
  }, [isAuthenticated, user, question.id])

  const loadUserVote = async () => {
    try {
      const response = await fetch(`/api/votes?questionId=${question.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.votes && data.votes.length > 0) {
          setUserVote(data.votes[0].type)
        }
      }
    } catch (error) {
      console.error('Error loading user vote:', error)
    }
  }

  const handleVote = async (type: 'UP' | 'DOWN') => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      window.location.href = '/auth/login'
      return
    }

    if (isVoting) return
    
    setIsVoting(true)
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questionId: question.id,
          type
        })
      })

      if (response.ok) {
        const data = await response.json()
        setVoteCount(data.voteCount)
        setUserVote(data.userVote)
      } else if (response.status === 401) {
        // User is not authenticated, redirect to login
        window.location.href = '/auth/login'
      } else {
        console.error('Failed to vote')
      }
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const getTagColor = (tagName: string) => {
    const colorMap: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      react: 'bg-cyan-100 text-cyan-800',
      nextjs: 'bg-gray-100 text-gray-800',
      nodejs: 'bg-green-100 text-green-800',
      prisma: 'bg-purple-100 text-purple-800',
      ajax: 'bg-orange-100 text-orange-800',
      asynchronous: 'bg-indigo-100 text-indigo-800',
      performance: 'bg-red-100 text-red-800',
    }
    return colorMap[tagName.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  // Extract a snippet from the content
  const getContentSnippet = (htmlContent: string) => {
    const textContent = removeHTMLTags(htmlContent)
    return textContent.length > 200 ? textContent.substring(0, 200) + '...' : textContent
  }

  // Check if content contains code
  const hasCodeBlock = question.content.includes('<pre>') || question.content.includes('<code>')

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      <div className="flex gap-4">
        {/* Vote Controls */}
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${userVote === 'UP' ? 'text-green-500 bg-green-100' : 'text-gray-400 hover:text-green-500'}`}
            onClick={() => handleVote('UP')}
            disabled={isVoting}
            title={!isAuthenticated ? 'Login to vote' : 'Upvote'}
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <span className="text-xl font-bold text-white">{formatNumber(voteCount)}</span>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 ${userVote === 'DOWN' ? 'text-red-500 bg-red-100' : 'text-gray-400 hover:text-red-500'}`}
            onClick={() => handleVote('DOWN')}
            disabled={isVoting}
            title={!isAuthenticated ? 'Login to vote' : 'Downvote'}
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>

        {/* Question Content */}
        <div className="flex-1">
          {/* Header with author info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {question.author.avatar ? (
                  <img 
                    src={question.author.avatar} 
                    alt={question.author.username} 
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  getInitials(question.author.firstName, question.author.lastName)
                )}
              </div>
              <div>
                <span className="text-white font-medium">{question.author.firstName} {question.author.lastName}</span>
                <div className="text-gray-400 text-sm">
                  {formatDate(question.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Question Title */}
          <Link href={`/questions/${question.id}`}>
            <h3 className="text-xl font-semibold text-white mb-3 hover:text-blue-400 transition-colors cursor-pointer">
              {question.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <div className="mb-4">
            {hasCodeBlock ? (
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mb-3">
                <div 
                  className="text-gray-300 text-sm font-mono"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />
              </div>
            ) : (
              <p className="text-gray-300 leading-relaxed">
                {getContentSnippet(question.content)}
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((questionTag) => (
              <span
                key={questionTag.tag.id}
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTagColor(questionTag.tag.name)}`}
              >
                {questionTag.tag.name}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Answers */}
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-white">{formatNumber(question.answerCount || question._count?.answers || 0)}</span>
              </div>

              {/* Views */}
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-white">{formatNumber(question.viewCount || question._count?.views || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 