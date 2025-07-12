'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Plus, Heart, HelpCircle, Star, Users, SlidersHorizontal, Search, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import QuestionCard from '@/components/questions/QuestionCard'

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

type FilterType = 'newest' | 'unanswered' | 'popular' | 'following'
type SortType = 'newest' | 'oldest' | 'votes' | 'views'

interface HomeContentProps {
  initialQuestions: QuestionWithDetails[]
  initialPopularQuestions: QuestionWithDetails[]
}

async function fetchQuestions(
  filter: FilterType = 'newest',
  sort: SortType = 'newest',
  search?: string,
  page: number = 1,
  limit: number = 10
): Promise<QuestionWithDetails[]> {
  try {
    const params = new URLSearchParams({
      filter,
      sort,
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })
    
    const response = await fetch(`/api/questions?${params}`)
    if (!response.ok) {
      throw new Error('Failed to fetch questions')
    }
    
    const data = await response.json()
    return data.questions || []
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

export default function HomeContent({ 
  initialQuestions, 
  initialPopularQuestions 
}: HomeContentProps) {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>(initialQuestions)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<FilterType>('newest')
  const [sort, setSort] = useState<SortType>('newest')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const loadQuestions = async (reset: boolean = false) => {
    setLoading(true)
    const currentPage = reset ? 1 : page
    
    try {
      const newQuestions = await fetchQuestions(filter, sort, search, currentPage)
      
      if (reset) {
        setQuestions(newQuestions)
        setPage(1)
      } else {
        setQuestions(prev => [...prev, ...newQuestions])
      }
      
      setHasMore(newQuestions.length === 10)
      if (!reset) setPage(prev => prev + 1)
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setPage(1)
    
    // Auto-adjust sort based on filter
    if (newFilter === 'popular') {
      setSort('votes')
    } else if (newFilter === 'newest') {
      setSort('newest')
    }
    
    loadQuestions(true)
  }

  const handleSortChange = (newSort: SortType) => {
    setSort(newSort)
    setPage(1)
    loadQuestions(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadQuestions(true)
  }

  const handleLoadMore = () => {
    loadQuestions(false)
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">All questions</h1>
          <Link href="/ask">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Ask a question</span>
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleFilterChange('newest')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'newest' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => handleFilterChange('unanswered')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unanswered' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Unanswered</span>
            </button>
            <button
              onClick={() => handleFilterChange('popular')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'popular' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Popular</span>
            </button>
            <button
              onClick={() => handleFilterChange('following')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'following' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Following</span>
            </button>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <button
                    onClick={() => {
                      handleSortChange('newest')
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      sort === 'newest' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange('oldest')
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      sort === 'oldest' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Oldest
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange('votes')
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      sort === 'votes' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Most Votes
                  </button>
                  <button
                    onClick={() => {
                      handleSortChange('views')
                      setShowFilters(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      sort === 'views' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    Most Views
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {loading && questions.length === 0 ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-32 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-24"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded animate-pulse w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-5/6"></div>
                </div>
              ))}
            </div>
          ) : questions.length > 0 ? (
            questions.map((question: QuestionWithDetails) => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
              <p className="text-gray-400 mb-6">
                {search ? 'Try adjusting your search terms' : 'Be the first to ask a question!'}
              </p>
              <Link href="/ask">
                <Button>Ask a question</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && questions.length > 0 && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Loading...' : 'Load more questions'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 