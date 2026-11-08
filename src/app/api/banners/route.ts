import { NextResponse } from 'next/server';
import { dbGetBanners, dbCreateBanner, dbUpdateBanner, dbDeleteBanner } from '@/lib/db';

export async function GET() {
  try {
    const banners = dbGetBanners();
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.image_url) {
      return NextResponse.json({ error: 'Title and image URL are required.' }, { status: 400 });
    }
    const created = dbCreateBanner(body);
    return NextResponse.json({ banner: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Banner ID required.' }, { status: 400 });
    }
    const updated = dbUpdateBanner(body.id, body);
    return NextResponse.json({ banner: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Banner ID required.' }, { status: 400 });
    }
    dbDeleteBanner(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}
