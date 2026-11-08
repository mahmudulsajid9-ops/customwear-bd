import { NextResponse } from 'next/server';
import { dbGetOrders, dbCreateOrder, dbGetProductById } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    let orders = dbGetOrders();

    if (userId) {
      orders = orders.filter((o) => o.user_id === userId);
    } else if (email) {
      orders = orders.filter((o) => o.email?.toLowerCase() === email.toLowerCase());
    } else if (phone) {
      orders = orders.filter((o) => o.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    }

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. Validation
    if (!body.full_name || !body.phone || !body.address_line) {
      return NextResponse.json(
        { error: 'Customer full name, phone number, and delivery address are required.' },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // 2. Validate Payment Details for Manual Mobile Payments
    if (['bkash', 'nagad', 'rocket'].includes(body.payment_method)) {
      if (!body.transaction_id || !body.sender_phone) {
        return NextResponse.json(
          {
            error: `Transaction ID and sender phone number are required for ${body.payment_method.toUpperCase()} verification.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Server-side validation of items, prices & stock availability
    let calculatedSubtotal = 0;
    for (const item of body.items) {
      const product = dbGetProductById(item.product_id);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product_name}` }, { status: 400 });
      }

      // Check stock
      let availableStock = product.stock_quantity;
      if (item.variation_id) {
        const variant = product.variations.find((v) => v.id === item.variation_id);
        if (variant) {
          availableStock = variant.stock_quantity;
        }
      }

      if (availableStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${item.product_name}. Only ${availableStock} unit(s) available.`,
          },
          { status: 400 }
        );
      }

      calculatedSubtotal += item.unit_price * item.quantity;
    }

    const shippingFee = body.shipping_fee || 0;
    const discount = body.discount_amount || 0;
    const finalTotal = calculatedSubtotal + shippingFee - discount;

    const createdOrder = dbCreateOrder({
      ...body,
      subtotal: calculatedSubtotal,
      total: finalTotal,
      status: 'pending',
      payment_status: body.payment_method === 'cod' ? 'unpaid' : 'pending_verification',
    });

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (error) {
    console.error('Create order error', error);
    return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
  }
}
