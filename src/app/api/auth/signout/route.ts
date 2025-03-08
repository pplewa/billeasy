import { removeAuthCookie } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a response object
    const response = NextResponse.json({ success: true });

    // Remove the authentication cookie
    return removeAuthCookie(response);
  } catch (error) {
    console.error('Error in signout API:', error);
    return NextResponse.json({ message: 'Failed to sign out' }, { status: 500 });
  }
}
