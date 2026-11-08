import { NextResponse } from 'next/server';
import { dbGetStockAdjustments, dbAdjustStockManually } from '@/lib/db';

export async function GET() {
  try {
    const logs = dbGetStockAdjustments();
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stock logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { product_id, variation_id, new_stock, reason, admin_name } = await req.json();

    if (!product_id || new_stock === undefined) {
      return NextResponse.json(
        { error: 'Product ID and new stock value are required.' },
        { status: 400 }
      );
    }

    const success = dbAdjustStockManually(
      product_id,
      variation_id,
      Number(new_stock),
      reason || 'Manual inventory reconciliation',
      admin_name || 'Admin'
    );

    if (!success) {
      return NextResponse.json({ error: 'Product not found or failed to adjust stock' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to adjust stock' }, { status: 500 });
  }
}
