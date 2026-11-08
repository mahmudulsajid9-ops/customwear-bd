'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    settings,
  } = useStore();

  if (!isCartOpen) return null;

  const freeThreshold = settings.free_shipping_threshold || 1000;
  const progressPercent = Math.min(100, Math.round((cartSubtotal / freeThreshold) * 100));
  const remainingForFree = Math.max(0, freeThreshold - cartSubtotal);

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-black" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-black">
                Your Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-200 rounded-none transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-neutral-100 border-b border-neutral-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-neutral-800">
                {remainingForFree === 0 ? (
                  <span className="text-green-700 font-semibold flex items-center gap-1">
                    ✓ You have qualified for FREE Shipping in Bangladesh!
                  </span>
                ) : (
                  <>
                    Add <span className="font-bold">{settings.currency_symbol}{remainingForFree}</span> more for Free Shipping
                  </>
                )}
              </span>
              <span className="font-bold text-neutral-900">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold uppercase tracking-wider text-black mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs mb-6">
                  Explore our premium custom apparel, hoodies, and oversized tees.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-primary text-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.image_url}
                    alt={item.product_name}
                    className="w-20 h-24 object-cover border border-neutral-200 flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/shop/${item.slug}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-semibold text-neutral-900 hover:underline line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-neutral-400 hover:text-black transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selected Variation Attributes */}
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-neutral-500">
                        {item.selected_size && (
                          <span className="bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 font-medium">
                            Size: {item.selected_size}
                          </span>
                        )}
                        {item.selected_color && (
                          <span className="bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 font-medium">
                            Color: {item.selected_color}
                          </span>
                        )}
                        {item.sku && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {item.sku}
                          </span>
                        )}
                      </div>

                      {/* Custom instruction note preview */}
                      {item.custom_instruction && (
                        <p className="mt-1.5 text-[11px] text-neutral-700 bg-neutral-50 p-1.5 border border-neutral-200 italic line-clamp-1">
                          Custom: &quot;{item.custom_instruction}&quot;
                        </p>
                      )}
                    </div>

                    {/* Quantity + Unit Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-neutral-300">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold text-neutral-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, 1)}
                          disabled={item.quantity >= item.max_stock}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-black font-sans">
                          {settings.currency_symbol}
                          {item.unit_price * item.quantity}
                        </span>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-neutral-400 font-sans">
                            {settings.currency_symbol}{item.unit_price} each
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal and Checkout Button */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>Subtotal</span>
                <span className="text-sm font-bold text-black">
                  {settings.currency_symbol}
                  {cartSubtotal}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500">
                <span>Shipping Calculation</span>
                <span>Calculated at checkout</span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                className="w-full btn-primary flex items-center justify-between py-3.5 text-xs"
              >
                <span>Proceed to Checkout</span>
                <span className="flex items-center gap-1.5 font-bold">
                  {settings.currency_symbol}{cartSubtotal}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
                <span>100% Secure Checkout | Cash on Delivery & bKash</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
