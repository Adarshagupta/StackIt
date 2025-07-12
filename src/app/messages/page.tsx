import MainLayout from '@/components/layouts/MainLayout'
import { MessageCircle, Send, Search } from 'lucide-react'

export default function MessagesPage() {
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Messages</h1>
          <p className="text-gray-500 mb-6 max-w-2xl">
            Connect with fellow developers, share knowledge, and build your network. This feature isn&apos;t available yet, but it&apos;s coming soon!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="divide-y divide-gray-700">
                {/* Example conversations */}
                <div className="p-4 hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">JD</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">John Doe</h3>
                        <span className="text-gray-400 text-xs">2m ago</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        Thanks for the help with the React component!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">JS</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Jane Smith</h3>
                        <span className="text-gray-400 text-xs">1h ago</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        Could you review my pull request?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 hover:bg-gray-700 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">AJ</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Alice Johnson</h3>
                        <span className="text-gray-400 text-xs">3h ago</span>
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        The TypeScript issue is resolved now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">JD</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">John Doe</h3>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">JD</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">
                        Hey! I saw your answer on the React hooks question. Really helpful!
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs mt-1">10:30 AM</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 justify-end">
                  <div className="flex-1">
                    <div className="bg-blue-600 rounded-lg p-3 max-w-xs ml-auto">
                      <p className="text-white text-sm">
                        Thanks! I'm glad it helped. Let me know if you have any other questions.
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs mt-1 block text-right">10:32 AM</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">JD</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                      <p className="text-white text-sm">
                        Actually, I do have a follow-up question about useEffect dependencies...
                      </p>
                    </div>
                    <span className="text-gray-400 text-xs mt-1">10:35 AM</span>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <Send className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {false && (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
            <p className="text-gray-400">
              Start a conversation by reaching out to other community members.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
} 