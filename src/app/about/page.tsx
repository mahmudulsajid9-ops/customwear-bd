'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="container-custom space-y-16">
        {/* Hero Banner */}
        <div className="max-w-3xl space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-400">
            Our Heritage & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black leading-tight">
            Crafting Personalized Apparel in Chattogram, Bangladesh
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
            Founded with a passion for creative self-expression, <strong className="text-black font-semibold">CustomWear BD</strong> bridges the gap between high-end international streetwear standards and localized Bangladeshi craftsmanship.
          </p>
        </div>

        {/* Studio Image & Story Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden border border-neutral-200">
            <img
              src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80"
              alt="Apparel Workshop in Chattogram"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <h2 className="text-xl font-black uppercase tracking-wider text-black">
              &quot;Your Design, Your Style&quot;
            </h2>
            <p>
              Operating from our dedicated workshop in <strong className="text-black">AK Khan, Chattogram</strong>, our team of textile cutters, screen printers, and quality inspectors handles each order individually. We do not mass-produce generic garments that fade after two washes.
            </p>
            <p>
              We source only compact 100% combed ring-spun cotton ranging from lightweight 190 GSM basics to structured 240 GSM heavyweights. Whether you order a single custom monogrammed t-shirt or 500 club batch tees, every stitch reflects our uncompromising standard.
            </p>

            <div className="pt-2 flex flex-col gap-3 font-semibold text-xs text-neutral-900">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>AK Khan, Chattogram Production Hub</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Zero Color Bleed & Anti-Shrink Enzyme Washed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>Fast Doorstep Shipping to all 64 Districts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-neutral-200">
          <div className="p-6 bg-neutral-50 border border-neutral-200 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              1. Premium Raw Materials
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              We exclusively use 100% combed cotton fibers. Breathable in hot tropical summers, cozy in winter, and soft on sensitive skin.
            </p>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              2. Precision Custom Printing
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              High-definition direct-to-film (DTF) transfer and high-density screen inks deliver razor-sharp details that withstand daily machine washing.
            </p>
          </div>

          <div className="p-6 bg-neutral-50 border border-neutral-200 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              3. Honest Bangladeshi Service
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed">
              From our studio in Chattogram to Sylhet or Dhaka, we provide reliable tracking, transparent pricing, and courteous customer support.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-8 sm:p-12 bg-black text-white text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Ready to Wear Your Creativity?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
            Choose from our pre-designed signature drops or submit your unique graphics today.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
            >
              <span>Explore The Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
