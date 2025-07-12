'use client'

import { Home, MessageSquare, HelpCircle, Tags, Users, Building, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Questions', href: '/questions', icon: HelpCircle },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Tags', href: '/tags', icon: Tags },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Companies', href: '/companies', icon: Building },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 h-screen sticky top-0 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Premium Plan Section */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <CreditCard className="w-5 h-5" />
            <span className="font-semibold">Premium plan</span>
          </div>
          
          <p className="text-sm text-blue-100 mb-4">
            Upgrade to Premium and get lifetime unlimited access to all questions answers
          </p>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Upgrade now
          </Button>
        </div>
      </div>
    </aside>
  )
} 