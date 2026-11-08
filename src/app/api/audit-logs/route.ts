import { NextResponse } from 'next/server';
import { dbGetAuditLogs } from '@/lib/db';

export async function GET() {
  try {
    const logs = dbGetAuditLogs();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
