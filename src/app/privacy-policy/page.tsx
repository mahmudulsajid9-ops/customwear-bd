'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ChevronRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="container-custom max-w-4xl space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold">Privacy Policy</span>
        </nav>

        <div className="border-b border-neutral-200 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Legal & Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            Last updated: October 2026 • CustomWear BD (AK Khan, Chattogram, Bangladesh)
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              1. Information We Collect
            </h2>
            <p>
              CustomWear BD collects personal details strictly necessary to process, produce, and deliver custom apparel orders across Bangladesh. This includes your name, shipping address, contact phone number, optional email address, and custom artwork or design instructions submitted during checkout or customization.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              2. Mobile Financial Services & Payment Security
            </h2>
            <p>
              When paying manually via bKash, Nagad, or Rocket, we only collect the Transaction ID (TrxID) and sender mobile number required to manually verify your transaction against our merchant statement.
            </p>
            <div className="p-4 bg-neutral-50 border border-neutral-200 font-semibold text-black">
              ⚠️ Strict Security Policy: CustomWear BD NEVER requests, collects, or stores your mobile financial PIN, OTP, password, or bank card credentials. Never disclose your PIN to anyone claiming to represent CustomWear BD.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              3. Courier Data Sharing
            </h2>
            <p>
              To fulfill doorstep delivery, we share your delivery recipient name, phone number, and street address with our trusted logistics courier partners (e.g. RedX, Steadfast, eCourier, Pathao, Sundarban Courier). Couriers are prohibited from using your data for promotional purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              4. Contact & Inquiries
            </h2>
            <p>
              For privacy inquiries or account data removal requests, contact our Pahartali, Chattogram studio helpline at +880 1812-345678 or email customwearbd.official@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
