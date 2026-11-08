import { NextResponse } from 'next/server';
import { dbGetCategories, dbCreateCategory } from '@/lib/db';

export async function GET() {
  try {
    const categories = dbGetCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.image_url) {
      return NextResponse.json({ error: 'Name and image URL are required.' }, { status: 400 });
    }

    const created = dbCreateCategory(body);
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
