'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Printer,
  Package,
  ArrowRight,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '@/context/StoreContext';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const { getOrderByIdOrNumber, settings } = useStore();

  const order = getOrderByIdOrNumber(orderNumber);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#000000', '#222222', '#888888', '#CCCCCC'],
      });
    } catch {
      // safe fallback if canvas not available
    }
  }, []);

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">
          Order Not Found
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          Could not find order #{orderNumber}.
        </p>
        <Link href="/" className="btn-primary text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-neutral-50">
      <div className="container-custom max-w-3xl">
        {/* Success Card */}
        <div className="bg-white border border-neutral-200 p-8 sm:p-10 text-center space-y-4 shadow-sm mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Order Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Thank You For Your Order!
          </h1>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Your custom clothing order has been placed successfully with CustomWear BD. We are
            preparing your pieces at our AK Khan, Chattogram workshop.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-200 text-xs font-mono font-bold text-black">
            <span>Order Number:</span>
            <span className="text-sm">{order.order_number}</span>
          </div>

          {/* Payment Verification Status Notice */}
          {order.payment_status === 'pending_verification' && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs text-left space-y-1">
              <div className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Payment Verification Status:</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-mono text-[11px]">
                  PENDING VERIFICATION
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Your manual {order.payment_method.toUpperCase()} Transaction ID (
                <span className="font-mono font-bold">{order.transaction_id}</span>) and Sender
                Phone (<span className="font-mono font-bold">{order.sender_phone}</span>) have been
                recorded. An administrator will verify the payment against our merchant statement
                before package dispatch. You do not need to send money again.
              </p>
            </div>
          )}

          {order.payment_status === 'paid' && (
            <div className="p-3 bg-green-50 border border-green-300 text-green-900 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>Payment Verified & Confirmed by Administration.</span>
            </div>
          )}

          {order.payment_method === 'cod' && (
            <div className="p-3 bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-semibold text-center">
              Payment Method: Cash on Delivery. Please keep ৳{order.total} ready upon delivery.
            </div>
          )}

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary text-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <Link
              href={`/track-order?order=${order.order_number}`}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Status</span>
            </Link>
          </div>
        </div>

        {/* Invoice Breakdown */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-lg font-black uppercase text-black font-sans">
                CUSTOMWEAR<span className="text-neutral-500 font-light">BD</span>
              </span>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                AK Khan, Chattogram, Bangladesh
              </p>
            </div>
            <div className="text-xs text-neutral-500 sm:text-right space-y-1">
              <div>
                <span className="font-semibold text-neutral-700">Date: </span>
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div>
                <span className="font-semibold text-neutral-700">Payment: </span>
                <span className="uppercase font-mono font-bold text-neutral-900">
                  {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
                </span>{' '}
                ({order.payment_status})
              </div>
            </div>
          </div>

          {/* Delivery To info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pb-6 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Delivering To:
              </span>
              <p className="font-bold text-neutral-900">{order.full_name}</p>
              <p className="text-neutral-600">{order.address_line}</p>
              <p className="text-neutral-600">
                {order.city}, {order.district}
              </p>
              <p className="text-neutral-600 font-mono mt-1">Phone: {order.phone}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                Dispatch Studio:
              </span>
              <p className="font-bold text-neutral-900">CustomWear BD Studio</p>
              <p className="text-neutral-600">{settings.site_address}</p>
              <p className="text-neutral-600 font-mono">Helpline: {settings.site_phone}</p>
            </div>
          </div>

          {/* Itemized table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
              Items Ordered
            </h3>
            <div className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-12 h-16 object-cover border border-neutral-200"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-neutral-900">{item.product_name}</p>
                      <div className="text-[11px] text-neutral-500 flex gap-2">
                        {item.selected_size && <span>Size: {item.selected_size}</span>}
                        {item.selected_color && <span>Color: {item.selected_color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                      {item.custom_instruction && (
                        <p className="text-[10px] text-neutral-600 italic">
                          Custom: &quot;{item.custom_instruction}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="font-bold font-mono text-neutral-900">
                    {settings.currency_symbol}
                    {item.total_price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals & Total */}
          <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">
                {settings.currency_symbol}
                {order.subtotal}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping Fee</span>
              <span className="font-mono font-semibold">
                {order.shipping_fee === 0 ? 'FREE' : `${settings.currency_symbol}${order.shipping_fee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-black text-black pt-2 border-t border-neutral-200">
              <span>Total Paid / Due</span>
              <span className="font-mono">
                {settings.currency_symbol}
                {order.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
