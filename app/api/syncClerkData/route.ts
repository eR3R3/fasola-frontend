import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userData = await request.json();
    
    // Forward the data to your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        imageUrl: userData.imageUrl,
        // Add any other fields you want to sync
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user data in backend');
    }
    
    const result = await response.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'User data synchronized successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in syncClerkData:', error);
    return NextResponse.json(
      { error: 'Failed to synchronize user data' },
      { status: 500 }
    );
  }
} 