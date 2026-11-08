import { NextResponse } from 'next/server';
import { dbGetUserByEmail, dbCreateUser } from '@/lib/db';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { full_name, email, password, phone } = await req.json();

    if (!full_name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = dbGetUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const newUser = dbCreateUser({
      full_name: full_name.trim(),
      email: cleanEmail,
      password,
      phone: phone?.trim(),
      role: 'customer',
    });

    const token = createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.full_name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      user: newUser,
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
    console.error('Registration error', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
