'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Tag, Layers, Sparkles } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CategoriesPage() {
  const { categories, products } = useStore();

  const activeCategories = categories
    .filter((c) => c.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const getProductCount = (category: typeof activeCategories[0]) => {
    return products.filter((p) => p.category_id === category.id || p.category?.slug === category.slug).length;
  };

  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="container-custom space-y-12">
        {/* Header Banner */}
        <div className="max-w-3xl space-y-3 border-b border-neutral-200 pb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Collections</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black">
            Apparel Categories
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
            Discover Bangladesh&apos;s finest custom apparel collections. From heavyweight oversized tees to premium combed cotton hoodies, every piece is built for long-lasting wear.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {activeCategories.map((category) => {
            const count = getProductCount(category);
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className="group relative bg-white border border-neutral-200 hover:border-black overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
              >
                {/* Image Container with Zoom effect */}
                <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider bg-white/90 backdrop-blur-sm text-black px-2 py-0.5 font-bold">
                      {category.slug}
                    </span>
                    <span className="text-[10px] font-mono bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 border border-white/20">
                      {count} {count === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>

                  {/* Title overlay at bottom */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h2 className="text-xl font-black uppercase tracking-tight group-hover:text-neutral-200 transition-colors">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-xs text-neutral-300 line-clamp-1 mt-0.5 font-light">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 bg-white flex items-center justify-between border-t border-neutral-100 group-hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black">
                    <span>Explore Collection</span>
                  </div>
                  <div className="w-7 h-7 bg-black text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Custom Order Callout */}
        <div className="bg-neutral-900 text-white p-8 sm:p-12 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Bulk & Corporate Orders</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Need custom printing for your brand or event?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl">
              We provide wholesale screen printing, direct-to-garment (DTG), and embroidery for university clubs, tech companies, and fashion labels.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-secondary whitespace-nowrap text-xs py-3 px-6 bg-white text-black hover:bg-neutral-100 font-bold uppercase tracking-wider"
          >
            Request Custom Quote
          </Link>
        </div>
      </div>
    </div>
  );
}
