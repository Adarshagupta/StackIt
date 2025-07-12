import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse } from '@/lib/middleware'

export async function POST(request: NextRequest) {
  try {
    // Since we're using JWT tokens stored in localStorage on the client side,
    // we don't need to do anything server-side for logout
    // The client handles token removal
    
    return NextResponse.json({ 
      message: 'Logged out successfully' 
    }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return createErrorResponse('Failed to logout')
  }
} 