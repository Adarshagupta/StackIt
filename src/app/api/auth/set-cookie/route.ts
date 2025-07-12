import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    const response = NextResponse.json({ success: true })
    setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Error setting auth cookie:', error)
    return NextResponse.json(
      { error: 'Failed to set auth cookie' },
      { status: 500 }
    )
  }
} 