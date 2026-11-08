'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Palette, Scissors } from 'lucide-react';
import HeroCarousel from '@/components/home/HeroCarousel';
import CategoryCards from '@/components/home/CategoryCards';
import ProductCard from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';

export default function HomePage() {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'latest' | 'bestseller' | 'sale'>('all');

  const publishedProducts = products.filter((p) => p.status === 'published');

  // Filtered lists
  const featuredProducts = publishedProducts.filter((p) => p.is_featured);
  const bestSellers = publishedProducts.filter((p) => p.is_best_seller);
  const saleProducts = publishedProducts.filter(
    (p) => p.sale_price && p.sale_price < p.regular_price
  );

  const displayProducts = (() => {
    switch (activeTab) {
      case 'latest':
        return [...publishedProducts].reverse().slice(0, 8);
      case 'bestseller':
        return bestSellers.length > 0 ? bestSellers : publishedProducts.slice(0, 8);
      case 'sale':
        return saleProducts.length > 0 ? saleProducts : publishedProducts.slice(0, 8);
      case 'all':
      default:
        return publishedProducts.slice(0, 8);
    }
  })();

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Brand Value Bar */}
      <div className="border-y border-neutral-200 bg-neutral-50 py-4">
        <div className="container-custom flex flex-wrap items-center justify-around gap-4 text-xs font-semibold uppercase tracking-wider text-neutral-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-black" />
            <span>Custom Prints & Embroidery</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Scissors className="w-4 h-4 text-black" />
            <span>240 GSM Heavyweight Streetwear</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>AK Khan, Chattogram Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black" />
            <span>Cash on Delivery All Over BD</span>
          </div>
        </div>
      </div>

      {/* 3. Product Categories */}
      <CategoryCards />

      {/* 4. Featured Drops Section */}
      <section className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-neutral-200 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Editor&apos;s Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Featured Collection
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-600 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {(featuredProducts.length > 0 ? featuredProducts : publishedProducts.slice(0, 4)).map(
            (product) => (
              <ProductCard key={product.id} product={product} />
            )
          )}
        </div>
      </section>

      {/* 5. Custom Apparel Interactive Banner */}
      <section className="container-custom">
        <div className="relative bg-black text-white p-8 sm:p-14 lg:p-16 border border-neutral-800 overflow-hidden">
          {/* Background Decorative Accent */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80"
              alt="Custom T-Shirt Making"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
              Personalized Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white leading-tight">
              Design Your Own Custom T-Shirt
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Have a favorite quote, brand logo, anime artwork, or university club batch design?
              Upload your high-res design or enter custom instructions. Our Chattogram printing
              workshop prepares precision DTF & screen prints with zero color fading.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/customizer"
                className="px-6 py-3 bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center gap-2"
              >
                <span>Launch Design Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop/custom-signature-t-shirt"
                className="px-6 py-3 bg-transparent border border-white/40 text-white text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors"
              >
                Quick Customize T-Shirt
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-transparent border border-white/20 text-neutral-300 text-xs font-bold uppercase tracking-wider hover:bg-neutral-900 transition-colors"
              >
                Bulk & Corporate Orders
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Curated Product Tabs (Latest, Best Sellers, Sale) */}
      <section className="container-custom">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-3 border-b border-neutral-200">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
            Explore All Apparel
          </h2>

          {/* Minimalist Tabs */}
          <div className="flex items-center gap-1 border border-neutral-200 p-1 bg-neutral-50 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'all' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('latest')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'latest' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bestseller')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'bestseller'
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              Best Sellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sale')}
              className={`px-3 py-1.5 font-bold uppercase tracking-wider transition-colors ${
                activeTab === 'sale' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Sale
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
