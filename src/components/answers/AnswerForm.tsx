'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import RichTextEditor from '@/components/ui/RichTextEditor'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface AnswerFormProps {
  questionId: string
  onAnswerSubmitted?: () => void
}

export default function AnswerForm({ questionId, onAnswerSubmitted }: AnswerFormProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Strip HTML tags for character count validation
    const textContent = content.replace(/<[^>]*>/g, '').trim()
    
    if (!textContent) {
      setError('Answer content is required')
      return
    }

    if (textContent.length < 20) {
      setError('Answer must be at least 20 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId,
          content // Send the rich HTML content
        })
      })

      const data = await response.json()

      if (response.ok) {
        setContent('')
        // Refresh the page to show the new answer
        window.location.reload()
        // Or call a callback if provided
        if (onAnswerSubmitted) {
          onAnswerSubmitted()
        }
      } else {
        setError(data.message || 'Failed to post answer')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate text length for validation (excluding HTML tags)
  const textLength = content.replace(/<[^>]*>/g, '').length

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400 mb-4">You must be logged in to post an answer.</p>
        <Button onClick={() => router.push('/auth/login')}>
          Sign In to Answer
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Your Answer</h3>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <RichTextEditor
            placeholder="Write your answer here... Use the toolbar for formatting options"
            initialValue={content}
            onChange={setContent}
            minHeight="200px"
            className="mb-2"
          />
          <div className="text-xs text-gray-400">
            {textLength}/20 minimum characters
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            <p>Tips for a great answer:</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Be specific and provide details</li>
              <li>• Use formatting to make your answer clear</li>
              <li>• Include code examples if relevant</li>
              <li>• Explain your reasoning</li>
              <li>• Add links to relevant resources</li>
            </ul>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || textLength < 20}
            loading={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Your Answer'}
          </Button>
        </div>
      </form>
    </div>
  )
} 