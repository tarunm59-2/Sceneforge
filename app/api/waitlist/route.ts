import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Invalid email address' 
        },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse>(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }
    
    // Log for now (later: save to database)
    console.log('New waitlist signup:', email, new Date().toISOString());
    
    // TODO: Add to database
    // const entry: WaitlistEntry = {
    //   id: crypto.randomUUID(),
    //   email,
    //   createdAt: new Date()
    // };
    // await db.waitlist.create({ data: entry });
    
    return NextResponse.json<ApiResponse>({ 
      success: true, 
      message: 'Successfully added to waitlist' 
    });

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json<ApiResponse>(
      { 
        success: false, 
        error: 'Failed to join waitlist' 
      },
      { status: 500 }
    );
  }
}