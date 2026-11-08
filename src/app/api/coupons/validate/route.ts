import { NextResponse } from 'next/server';
import { dbGetCouponByCode } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Please enter a coupon code.' }, { status: 400 });
    }

    const coupon = dbGetCouponByCode(code);
    if (!coupon) {
      return NextResponse.json({ valid: false, message: 'Invalid promo code. Please check and try again.' }, { status: 404 });
    }

    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, message: 'This coupon is currently inactive.' }, { status: 400 });
    }

    // Check expiry date if configured
    if (coupon.expiry_date) {
      const expiry = new Date(coupon.expiry_date).getTime();
      if (Date.now() > expiry) {
        return NextResponse.json({ valid: false, message: 'This coupon code has expired.' }, { status: 400 });
      }
    }

    // Check min spend
    const orderSubtotal = Number(subtotal || 0);
    if (coupon.min_spend && orderSubtotal < coupon.min_spend) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount of ৳${coupon.min_spend} required to use coupon "${coupon.code}". (Current subtotal: ৳${orderSubtotal})`,
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discount_value) / 100);
      if (coupon.max_discount && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = Math.min(coupon.discount_value, orderSubtotal);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount_amount: discountAmount,
      coupon,
      message: `Promo code "${coupon.code}" applied! You saved ৳${discountAmount}.`,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate coupon' }, { status: 500 });
  }
}
