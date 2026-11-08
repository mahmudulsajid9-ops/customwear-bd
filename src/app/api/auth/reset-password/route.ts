import { NextResponse } from 'next/server';
import { dbGetUserByEmail, dbResetUserPassword } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, new_password, reset_code } = await req.json();

    if (!email || !new_password) {
      return NextResponse.json(
        { error: 'Email and new password are required.' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = dbGetUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email address.' },
        { status: 404 }
      );
    }

    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact customer support.' },
        { status: 403 }
      );
    }

    // Optional verification code check (allows simulation or demo verification)
    if (reset_code && reset_code.trim() !== '1234' && reset_code.trim().length !== 6) {
      return NextResponse.json(
        { error: 'Invalid or expired verification reset code.' },
        { status: 400 }
      );
    }

    const success = dbResetUserPassword(cleanEmail, new_password);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
