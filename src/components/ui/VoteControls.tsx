'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface VoteControlsProps {
  questionId?: string
  answerId?: string
  initialVoteCount: number
  className?: string
}

export default function VoteControls({ 
  questionId, 
  answerId, 
  initialVoteCount,
  className = ''
}: VoteControlsProps) {
  const { user, isAuthenticated } = useAuth()
  const { onVoteUpdate } = useWebSocket()
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [userVote, setUserVote] = useState<'UP' | 'DOWN' | null>(null)
  const [isVoting, setIsVoting] = useState(false)

  // Load user's vote status for this question/answer
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserVote()
    }
  }, [isAuthenticated, user, questionId, answerId])

  // Listen for real-time vote updates
  useEffect(() => {
    const cleanup = onVoteUpdate((event) => {
      const { targetId, targetType, voteCount: newVoteCount } = event.payload
      
      // Update vote count if this is for our question/answer
      if (questionId && targetType === 'question' && targetId === questionId) {
        setVoteCount(newVoteCount)
      } else if (answerId && targetType === 'answer' && targetId === answerId) {
        setVoteCount(newVoteCount)
      }
    })

    return cleanup
  }, [questionId, answerId, onVoteUpdate])

  const loadUserVote = async () => {
    try {
      const params = new URLSearchParams()
      if (questionId) params.append('questionId', questionId)
      if (answerId) params.append('answerId', answerId)

      const response = await fetch(`/api/votes?${params}`)
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
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...(questionId && { questionId }),
          ...(answerId && { answerId }),
          type
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state immediately for responsive UI
        setVoteCount(data.voteCount)
        setUserVote(data.userVote)
        // Real-time updates will be handled by WebSocket for other users
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

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${userVote === 'UP' ? 'text-green-500 bg-green-500/20' : 'text-gray-400 hover:text-green-500'}`}
        onClick={() => handleVote('UP')}
        disabled={isVoting}
        title={!isAuthenticated ? 'Login to vote' : 'Upvote'}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
      <span className="text-xl font-bold text-white">{voteCount}</span>
      <Button
        variant="ghost"
        size="sm"
        className={`p-2 ${userVote === 'DOWN' ? 'text-red-500 bg-red-500/20' : 'text-gray-400 hover:text-red-500'}`}
        onClick={() => handleVote('DOWN')}
        disabled={isVoting}
        title={!isAuthenticated ? 'Login to vote' : 'Downvote'}
      >
        <ChevronDown className="h-6 w-6" />
      </Button>
    </div>
  )
} 