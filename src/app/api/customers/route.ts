import { NextResponse } from 'next/server';
import { dbGetUsers } from '@/lib/db';

export async function GET() {
  try {
    const users = dbGetUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
