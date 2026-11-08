import { NextResponse } from 'next/server';
import { dbGetOrderByIdOrNumber, dbUpdateOrder } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const order = dbGetOrderByIdOrNumber(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = dbUpdateOrder(params.id, body, body.admin_name || 'Admin');
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ order: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
