'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';

export default function WishlistPage() {
  const { wishlist, products } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="py-12 sm:py-16 bg-white">
      <div className="container-custom">
        <div className="mb-8 pb-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-black">
              Your Wishlist ({wishlistedProducts.length})
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Save your favorite custom pieces and order anytime.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-black hover:text-neutral-600"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="py-20 text-center border border-neutral-200 bg-neutral-50 p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-500">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-black mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Browse our collections and click the heart icon on any product to save it here.
            </p>
            <Link href="/shop" className="btn-primary text-xs">
              Explore All Apparel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
