import { NextResponse } from 'next/server';
import { dbGetCoupons, dbCreateCoupon } from '@/lib/db';

export async function GET() {
  try {
    const coupons = dbGetCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.code || !body.discount_type || body.discount_value === undefined) {
      return NextResponse.json(
        { error: 'Coupon code, discount type, and discount value are required.' },
        { status: 400 }
      );
    }

    const created = dbCreateCoupon({
      code: body.code,
      discount_type: body.discount_type,
      discount_value: Number(body.discount_value),
      min_spend: body.min_spend ? Number(body.min_spend) : undefined,
      max_discount: body.max_discount ? Number(body.max_discount) : undefined,
      expiry_date: body.expiry_date || undefined,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : true,
    });

    return NextResponse.json({ coupon: created }, { status: 201 });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A coupon with this code already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon.' }, { status: 500 });
  }
}
