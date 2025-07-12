'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layouts/MainLayout'
import { Button } from '@/components/ui/Button'
import RichTextEditor from '@/components/ui/RichTextEditor'
import { Plus, X, HelpCircle } from 'lucide-react'

interface Tag {
  id: string
  name: string
  color: string | null
  description: string | null
}

export default function AskQuestionPage() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as Tag[]
  })
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags')
      if (response.ok) {
        const tags = await response.json()
        setAvailableTags(tags)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: '' }))
    }
  }

  const handleAddTag = (tag: Tag) => {
    if (!formData.tags.some(t => t.id === tag.id)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== tagId)
    }))
  }

  const handleCreateTag = async (tagName: string) => {
    if (formData.tags.length >= 5) {
      setErrors(prev => ({ ...prev, tags: 'Maximum 5 tags allowed' }))
      return
    }
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: tagName
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const newTag = data.data || data
        setAvailableTags(prev => [...prev, newTag])
        handleAddTag(newTag)
      } else {
        setErrors(prev => ({ ...prev, tags: data.message || 'Failed to create tag' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, tags: 'Failed to create tag' }))
    }
  }

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cleanInput = tagInput.replace(/^#+/, '').toLowerCase().trim()
      
      if (cleanInput.length >= 2) {
        // Check if tag already exists
        const existingTag = availableTags.find(tag => 
          tag.name.toLowerCase() === cleanInput
        )
        
        if (existingTag && !formData.tags.some(t => t.id === existingTag.id)) {
          handleAddTag(existingTag)
        } else if (!existingTag) {
          handleCreateTag(cleanInput)
        }
      }
    }
  }

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagInput.replace(/^#+/, '').toLowerCase()) &&
    !formData.tags.some(t => t.id === tag.id)
  )

  const cleanTagInput = tagInput.replace(/^#+/, '').toLowerCase().trim()
  const shouldShowCreateOption = cleanTagInput.length >= 2 && 
    !filteredTags.some(tag => tag.name.toLowerCase() === cleanTagInput) &&
    !formData.tags.some(tag => tag.name.toLowerCase() === cleanTagInput)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }
    
    // Strip HTML tags for content validation
    const textContent = formData.content.replace(/<[^>]*>/g, '').trim()
    
    if (!textContent) {
      newErrors.content = 'Content is required'
    } else if (textContent.length < 30) {
      newErrors.content = 'Content must be at least 30 characters'
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content, // Send rich HTML content
          tags: formData.tags.map(tag => tag.name)
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // API response format: { data: question, message: 'Success' }
        const questionId = data.data?.id || data.id
        router.push(`/questions/${questionId}`)
      } else {
        setErrors({ general: data.message || 'Failed to create question' })
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate text length for validation (excluding HTML tags)
  const textLength = formData.content.replace(/<[^>]*>/g, '').length

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Ask a Question</h1>
          <p className="text-gray-400">
            Get help from our community of developers. Be specific and provide details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Be specific and imagine you're asking a question to another person.
            </p>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., How do I implement authentication in Next.js?"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
              Content
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Include all the information someone would need to answer your question. Use the rich text editor to format your content.
            </p>
            <RichTextEditor
              placeholder="Describe your problem in detail. Include what you've tried, what you expected to happen, and what actually happened. Use formatting, code blocks, and links to make your question clear."
              initialValue={formData.content}
              onChange={handleContentChange}
              minHeight="300px"
              className="mb-2"
            />
            <div className="text-xs text-gray-400">
              {textLength}/30 minimum characters
            </div>
            {errors.content && (
              <p className="mt-1 text-sm text-red-400">{errors.content}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Add up to 5 tags to describe what your question is about.
            </p>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-blue-100"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="ml-2 text-blue-200 hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Input */}
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Start typing to search tags or press Enter to create..."
              />
              
              {/* Tag Suggestions */}
              {tagInput && (filteredTags.length > 0 || shouldShowCreateOption) && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between"
                    >
                      <span>{tag.name}</span>
                      <Plus className="h-4 w-4" />
                    </button>
                  ))}
                  {shouldShowCreateOption && (
                    <button
                      type="button"
                      onClick={() => handleCreateTag(cleanTagInput)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 flex items-center justify-between border-t border-gray-600"
                    >
                      <span>Create "{cleanTagInput}"</span>
                      <Plus className="h-4 w-4 text-green-400" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {errors.tags && (
              <p className="mt-1 text-sm text-red-400">{errors.tags}</p>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <HelpCircle className="h-5 w-5 text-blue-400 mr-2" />
              <h3 className="text-sm font-medium text-blue-300">Writing a good question</h3>
            </div>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• Summarize the problem in the title</li>
              <li>• Use the rich text editor to format your content clearly</li>
              <li>• Include code examples, links, and images as needed</li>
              <li>• Describe what you've tried and what you expected</li>
              <li>• Add relevant tags to help others find your question</li>
              <li>• Review your question before posting</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isLoading || textLength < 30}
              className="px-6"
            >
              {isLoading ? 'Posting...' : 'Post Question'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
} 