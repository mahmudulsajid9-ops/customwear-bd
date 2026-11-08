import { NextResponse } from 'next/server';
import { dbGetProducts, dbCreateProduct } from '@/lib/db';

export async function GET() {
  try {
    const products = dbGetProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Fetch products error', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.regular_price) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    const created = dbCreateProduct(body);
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (error) {
    console.error('Create product error', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
