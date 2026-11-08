'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function ReturnRefundPolicyPage() {
  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="container-custom max-w-4xl space-y-8">
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold">Return & Refund Policy</span>
        </nav>

        <div className="border-b border-neutral-200 pb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Customer Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black mt-1">
            Return & Refund Policy
          </h1>
          <p className="text-xs text-neutral-500 mt-2">
            7-Day Hassle-Free Exchange Policy • CustomWear BD (AK Khan, Chattogram, Bangladesh)
          </p>
        </div>

        <div className="space-y-6 text-xs text-neutral-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              1. 7-Day Exchange Window
            </h2>
            <p>
              We want you to love your CustomWear BD apparel. If you received the wrong size, color, or a manufacturing defect, you may request an exchange within 7 days of receiving your package. Items must remain unwashed, unworn, and with original brand tags attached.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              2. Custom Printed Items
            </h2>
            <p>
              Because custom-printed and personalized tees or hoodies are crafted exclusively to your design specifications, they cannot be returned for a cash refund unless there is a physical printing flaw, garment stain, fabric tear, or stitching defect attributable to our workshop. In the event of a production defect, we will reprint and ship a replacement free of charge.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              3. Refund Processing
            </h2>
            <p>
              Approved refunds are disbursed via original payment channel (bKash, Nagad, Rocket, or direct bank transfer) within 3 to 5 business days after inspection at our Chattogram studio. Return courier fees for defective merchandise are reimbursed by CustomWear BD.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              4. How to Initiate an Exchange
            </h2>
            <p>
              Send your Order ID (e.g. CW-94821) along with photos of the garment to our official WhatsApp / helpline: +880 1812-345678 or email customwearbd.official@gmail.com. Our customer support team will arrange the courier pickup or replacement shipment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
