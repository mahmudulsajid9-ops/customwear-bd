'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="container-custom max-w-4xl space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold">Terms & Conditions</span>
        </nav>

        <div className="border-b border-neutral-200 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Store Agreements
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
            Terms & Conditions
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Effective Date: October 2026 • CustomWear BD (AK Khan, Chattogram, Bangladesh)
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              1. Ordering & Customization
            </h2>
            <p>
              By placing an order with CustomWear BD, you agree that you possess the necessary rights and permissions for any graphics, logos, brand trademarks, or text uploaded for custom printing. CustomWear BD reserves the right to decline print jobs containing illegal, abusive, or explicitly copyrighted content.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              2. Pricing & Delivery Charges
            </h2>
            <p>
              All prices are listed in Bangladeshi Taka (BDT ৳). Standard delivery inside Chattogram is ৳60 and outside Chattogram (all 64 districts) is ৳120, unless eligible for promotional Free Shipping (orders over ৳1,000). Prices are subject to change without prior notice.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              3. Payment & Verification
            </h2>
            <p>
              Orders selected with manual mobile payments (bKash, Nagad, Rocket) are held in Pending Verification until confirmed by our billing staff against official SMS statements. CustomWear BD reserves the right to cancel orders with unverified or fraudulent Transaction IDs.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              4. Fair Ordering & Anti-Abuse
            </h2>
            <p>
              Repeated refusals of Cash on Delivery shipments without valid justification disrupt logistics operations. Accounts demonstrating abusive ordering patterns may be flagged or restricted from placing future Cash on Delivery orders.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
