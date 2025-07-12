'use client'

import Header from './Header'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'

interface MainLayoutProps {
  children: React.ReactNode
  showRightSidebar?: boolean
  rightSidebarContent?: React.ReactNode
}

export default function MainLayout({ 
  children, 
  showRightSidebar = true,
  rightSidebarContent 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 min-w-0">
          {children}
        </main>
        
        {showRightSidebar && (
          <div className="p-6">
            {rightSidebarContent || <RightSidebar />}
          </div>
        )}
      </div>
    </div>
  )
} 