import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { dbGetUserById } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const cookieHeader = req.headers.get('cookie') || '';
    const cookieToken = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('cw_session='))
      ?.split('=')[1];

    const token = tokenFromHeader || cookieToken;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = dbGetUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function POST() {
  // Logout
  const response = NextResponse.json({ success: true });
  response.cookies.delete('cw_session');
  return response;
}
