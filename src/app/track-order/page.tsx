'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const { getOrderByIdOrNumber, settings } = useStore();
  const [searchQuery, setSearchQuery] = useState(initialOrder);
  const [searchedOrder, setSearchedOrder] = useState<Order | undefined>(
    initialOrder ? getOrderByIdOrNumber(initialOrder) : undefined
  );
  const [searched, setSearched] = useState(Boolean(initialOrder));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = getOrderByIdOrNumber(searchQuery.trim());
    setSearchedOrder(match);
    setSearched(true);
  };

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Order Received', desc: 'Awaiting confirmation' },
    { key: 'confirmed', label: 'Confirmed', desc: 'Order approved' },
    { key: 'processing', label: 'Cutting & Printing', desc: 'In Chattogram workshop' },
    { key: 'shipped', label: 'Dispatched with Courier', desc: 'On the way to your door' },
    { key: 'delivered', label: 'Delivered', desc: 'Parcel handed over' },
  ];

  const getStepStatus = (stepKey: OrderStatus, currentStatus: OrderStatus) => {
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (currentStatus === 'cancelled') return 'cancelled';
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="container-custom max-w-3xl">
        <div className="text-center max-w-lg mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            Real-Time Logistics
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">
            Track Your Order
          </h1>
          <p className="text-xs text-neutral-500">
            Enter your 8-digit order number (e.g. <span className="font-mono font-bold">CW-94821</span>) or mobile number used at checkout.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="pt-4 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="CW-XXXXX or 01XXXXXXXXX"
                className="w-full text-xs px-4 py-3 border border-neutral-300 focus:border-black outline-none font-mono"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button type="submit" className="btn-primary text-xs px-6 py-3">
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && (
          <div>
            {!searchedOrder ? (
              <div className="p-8 text-center bg-neutral-50 border border-neutral-200">
                <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  No Order Found
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  We could not find any active order matching &quot;{searchQuery}&quot;. Please verify the order number on your confirmation email/SMS.
                </p>
              </div>
            ) : (
              <div className="border border-neutral-200 p-6 sm:p-8 space-y-8 bg-neutral-50">
                {/* Order Top Banner */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-6 border-b border-neutral-200 gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-neutral-900 text-sm block">
                      Order #{searchedOrder.order_number}
                    </span>
                    <span className="text-xs text-neutral-500">
                      Placed on{' '}
                      {new Date(searchedOrder.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 bg-black text-white font-bold uppercase tracking-wider">
                      Status: {searchedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Live Progress
                  </h3>

                  <div className="relative flex flex-col md:flex-row justify-between gap-4 md:gap-0">
                    {steps.map((s, idx) => {
                      const stepState = getStepStatus(s.key, searchedOrder.status);
                      return (
                        <div key={s.key} className="flex md:flex-col items-center gap-3 text-left md:text-center flex-1 relative">
                          {/* Dot / Icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                              stepState === 'completed'
                                ? 'bg-black text-white'
                                : stepState === 'current'
                                ? 'border-2 border-black bg-white text-black ring-4 ring-neutral-200'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {stepState === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div>
                            <p
                              className={`text-xs uppercase font-bold tracking-wider ${
                                stepState === 'current'
                                  ? 'text-black font-black'
                                  : 'text-neutral-700'
                              }`}
                            >
                              {s.label}
                            </p>
                            <p className="text-[10px] text-neutral-400">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Courier / Shipping details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t border-neutral-200">
                  <div className="bg-white p-4 border border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                      Shipping Details
                    </span>
                    <p className="font-bold text-neutral-900">{searchedOrder.full_name}</p>
                    <p className="text-neutral-600">{searchedOrder.address_line}</p>
                    <p className="text-neutral-600">
                      {searchedOrder.city}, {searchedOrder.district}
                    </p>
                    <p className="font-mono text-neutral-500 mt-1">Phone: {searchedOrder.phone}</p>
                  </div>

                  <div className="bg-white p-4 border border-neutral-200">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                      Courier Assignment
                    </span>
                    <p className="font-bold text-neutral-900">
                      {searchedOrder.courier || 'RedX / Steadfast Express'}
                    </p>
                    <p className="text-neutral-600 font-mono mt-1">
                      Tracking Code: {searchedOrder.tracking_number || 'Will update on dispatch'}
                    </p>
                    <p className="text-neutral-500 text-[11px] mt-2">
                      Studio dispatch: AK Khan, Chattogram
                    </p>
                  </div>
                </div>

                {/* Ordered Items summary */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                    Items in Parcel ({searchedOrder.items.length})
                  </h4>
                  <div className="divide-y divide-neutral-200 bg-white border border-neutral-200 px-4">
                    {searchedOrder.items.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-neutral-900">{item.product_name}</p>
                          <span className="text-[11px] text-neutral-500">
                            Size: {item.selected_size} | Color: {item.selected_color} | Qty: {item.quantity}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-neutral-900">
                          {settings.currency_symbol}
                          {item.total_price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="container-custom py-12 text-center text-xs">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
