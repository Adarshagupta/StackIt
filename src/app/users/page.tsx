import MainLayout from '@/components/layouts/MainLayout'
import { db } from '@/lib/db'
import Link from 'next/link'

interface UserWithStats {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  avatar: string | null
  createdAt: Date
  questionCount: number
  answerCount: number
}

async function getUsers(): Promise<UserWithStats[]> {
  try {
    const users = await db.user.findMany({
      include: {
        questions: {
          select: {
            id: true
          }
        },
        answers: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return users.map((user: any) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      createdAt: user.createdAt,
      questionCount: user.questions.length,
      answerCount: user.answers.length
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-gray-400">
            Browse our community of developers and their contributions.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user: UserWithStats) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-6 transition-colors border border-gray-700 hover:border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.username} 
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <span className="text-white text-lg font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className="text-white font-semibold">
                    {user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : user.username
                    }
                  </h3>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Questions:</span>
                  <span className="text-white">{user.questionCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Answers:</span>
                  <span className="text-white">{user.answerCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 