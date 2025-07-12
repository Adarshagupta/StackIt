import MainLayout from '@/components/layouts/MainLayout'
import { db } from '@/lib/db'
import Link from 'next/link'

interface TagWithQuestions {
  id: string
  name: string
  description?: string
  questions: { questionId: string }[]
}

interface TagWithCount {
  id: string
  name: string
  description?: string
  questionCount: number
}

async function getTags(): Promise<TagWithCount[]> {
  try {
    const tags = await db.tag.findMany({
      include: {
        questions: {
          select: {
            questionId: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return tags.map((tag: TagWithQuestions) => ({
      ...tag,
      questionCount: tag.questions.length
    }))
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

export default async function TagsPage() {
  const tags = await getTags()

  const getTagColor = (tagName: string) => {
    const colors = {
      'javascript': 'bg-yellow-600 text-yellow-100',
      'typescript': 'bg-blue-600 text-blue-100',
      'react': 'bg-cyan-600 text-cyan-100',
      'nextjs': 'bg-gray-600 text-gray-100',
      'nodejs': 'bg-green-600 text-green-100',
      'python': 'bg-purple-600 text-purple-100',
      'default': 'bg-gray-600 text-gray-100'
    }
    return colors[tagName.toLowerCase() as keyof typeof colors] || colors.default
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tags</h1>
          <p className="text-gray-400">
            Browse questions by topic. Click on a tag to see all questions with that tag.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search tags..."
            className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tags.map((tag: TagWithCount) => (
            <Link
              key={tag.id}
              href={`/questions?tag=${tag.name}`}
              className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors border border-gray-700 hover:border-gray-600"
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${getTagColor(tag.name)}`}
                >
                  {tag.name}
                </span>
                <span className="text-gray-400 text-sm">
                  {tag.questionCount} questions
                </span>
              </div>
              <p className="text-gray-300 text-sm line-clamp-2">
                {tag.description || `Questions about ${tag.name}`}
              </p>
            </Link>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No tags found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 