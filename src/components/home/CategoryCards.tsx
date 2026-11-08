'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CategoryCards() {
  const { categories } = useStore();
  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <section id="categories" className="py-16 sm:py-20 bg-white">
      <div className="container-custom">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Curated Wardrobe
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mt-1">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs text-neutral-500 max-w-md">
            From relaxed heavyweight streetwear to tailored piques and matching couple sets.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeCategories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className="group relative h-72 sm:h-80 overflow-hidden bg-neutral-100 border border-neutral-200 block"
            >
              {/* Image */}
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white flex items-end justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[11px] text-neutral-300 line-clamp-1 mt-0.5 font-light">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors flex-shrink-0 ml-2">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
