import { Roles } from '@/types/global'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    const { sessionClaims } = await auth()
    const hasRole = sessionClaims?.metadata.role === role
    
    return NextResponse.json({ hasRole })
  } catch (error) {
    console.error('Error checking role:', error)
    return NextResponse.json({ hasRole: false, error: 'Failed to check role' }, { status: 500 })
  }
} 