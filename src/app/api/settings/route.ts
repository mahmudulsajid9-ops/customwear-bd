import { NextResponse } from 'next/server';
import { dbGetSettings, dbUpdateSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = dbGetSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updated = dbUpdateSettings(body);
    return NextResponse.json({ settings: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
