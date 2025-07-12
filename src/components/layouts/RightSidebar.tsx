'use client'

import { Eye, ChevronUp, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatNumber } from '@/lib/utils'
import Link from 'next/link'

interface PopularQuestion {
  id: string
  title: string
  author: {
    username: string
    firstName: string | null
    lastName: string | null
    avatar: string | null
  }
  voteCount: number
  answerCount: number
  viewCount: number
  createdAt: Date | string
  tags?: Array<{ tag: { name: string; color: string | null } }>
}

interface Collective {
  id: string
  name: string
  description: string
  memberCount: number
  icon: string
  color: string
}

interface RightSidebarProps {
  popularQuestions?: PopularQuestion[]
  collectives?: Collective[]
}

export default function RightSidebar({ popularQuestions = [], collectives = [] }: RightSidebarProps) {
  const getInitials = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const defaultCollectives = [
    {
      id: '1',
      name: 'Python',
      description: '21k members',
      memberCount: 21000,
      icon: '🐍',
      color: 'bg-green-600'
    },
    {
      id: '2',
      name: 'ChatGPT',
      description: '38k members',
      memberCount: 38000,
      icon: '🤖',
      color: 'bg-emerald-600'
    },
    {
      id: '3',
      name: 'Visual Basic',
      description: '7.5k members',
      memberCount: 7500,
      icon: '📊',
      color: 'bg-purple-600'
    },
    {
      id: '4',
      name: 'Swift',
      description: '2.4k members',
      memberCount: 2400,
      icon: '🦉',
      color: 'bg-orange-600'
    }
  ]

  const displayCollectives = collectives.length > 0 ? collectives : defaultCollectives

  return (
    <aside className="w-80 space-y-6">
      {/* Popular Questions */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Popular questions</h3>
          <Link href="/questions" className="text-blue-400 text-sm hover:underline">
            See all
          </Link>
        </div>
        
        <div className="space-y-4">
          {popularQuestions.slice(0, 3).map((question, index) => (
            <div key={question.id} className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {question.author.avatar ? (
                    <img 
                      src={question.author.avatar} 
                      alt={question.author.username} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    getInitials(question.author.firstName, question.author.lastName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium mb-1">
                    {question.author.firstName} {question.author.lastName}
                  </div>
                  <div className="text-gray-400 text-xs mb-2">
                    {formatDate(question.createdAt)}
                  </div>
                </div>
              </div>
              
              <Link href={`/questions/${question.id}`}>
                <p className="text-gray-300 text-sm hover:text-white transition-colors cursor-pointer line-clamp-2">
                  {question.title}
                </p>
              </Link>
              
              {/* Tags */}
              {question.tags && (
                <div className="flex flex-wrap gap-1">
                  {question.tags.slice(0, 3).map((questionTag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                    >
                      {questionTag.tag.name}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <ChevronUp className="w-3 h-3" />
                  <span>{formatNumber(question.voteCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{formatNumber(question.answerCount)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(question.viewCount)}</span>
                </div>
              </div>
              
              {index < popularQuestions.length - 1 && (
                <div className="border-b border-gray-700 mt-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collectives */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Collectives</h3>
          <Link href="/collectives" className="text-blue-400 text-sm hover:underline">
            See all
          </Link>
        </div>
        
        <div className="space-y-3">
          {displayCollectives.map((collective) => (
            <div key={collective.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${collective.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                  {collective.icon}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{collective.name}</div>
                  <div className="text-gray-400 text-xs">{collective.description}</div>
                </div>
              </div>
              <Button variant="default" size="sm">
                Join
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
} 