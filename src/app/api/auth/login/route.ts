import { NextResponse } from 'next/server';
import { dbGetUserByEmail } from '@/lib/db';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = dbGetUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (user.is_suspended) {
      return NextResponse.json(
        { error: 'This account has been suspended by administration. Please contact support.' },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.full_name,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        is_active: Boolean(user.is_active),
        is_suspended: Boolean(user.is_suspended),
        is_restricted: Boolean(user.is_restricted),
        is_flagged_suspicious: Boolean(user.is_flagged_suspicious),
        created_at: user.created_at,
      },
      token,
    });

    response.cookies.set('cw_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600,
    });

    return response;
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
