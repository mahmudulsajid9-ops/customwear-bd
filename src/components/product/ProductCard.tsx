'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { settings, categories, toggleWishlist, isWishlisted, addToCart } = useStore();
  const wishlisted = isWishlisted(product.id);

  // Category name lookup
  const category = categories.find((c) => c.id === product.category_id);

  // Price calculation
  const hasDiscount = product.sale_price && product.sale_price < product.regular_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.regular_price - product.sale_price!) / product.regular_price) * 100)
    : 0;

  // Primary image
  const primaryImage =
    product.images.find((img) => img.is_primary)?.image_url ||
    product.images[0]?.image_url ||
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80';

  const secondaryImage = product.images[1]?.image_url || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock_quantity <= 0) return;

    // Pick first available variation or base product
    const firstVar = product.variations[0];
    addToCart({
      id: `${product.id}-${firstVar?.id || 'base'}`,
      product_id: product.id,
      variation_id: firstVar?.id,
      product_name: product.name,
      slug: product.slug,
      image_url: firstVar?.image_url || primaryImage,
      regular_price: firstVar ? firstVar.regular_price : product.regular_price,
      sale_price: firstVar ? firstVar.sale_price : product.sale_price,
      unit_price: firstVar
        ? firstVar.sale_price ?? firstVar.regular_price
        : product.sale_price ?? product.regular_price,
      quantity: 1,
      selected_size: firstVar?.attributes?.Size || product.available_sizes[0] || 'M',
      selected_color: firstVar?.attributes?.Color || product.available_colors[0]?.name || 'Black',
      sku: firstVar?.sku || product.sku,
      max_stock: firstVar ? firstVar.stock_quantity : product.stock_quantity,
    });
  };

  return (
    <div className="group relative bg-white border border-neutral-200 flex flex-col transition-all duration-300 hover:shadow-premium hover:border-black">
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
        <Link href={`/shop/${product.slug}`} className="block w-full h-full">
          {/* Main Image */}
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {/* Secondary Hover Image if available */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              loading="lazy"
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider">
              -{discountPercent}%
            </span>
          )}
          {product.is_best_seller && (
            <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-wider">
              Best Seller
            </span>
          )}
          {product.is_customizable && (
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 border border-neutral-300 text-[10px] font-semibold uppercase tracking-wider">
              Customizable
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 ${
            wishlisted
              ? 'bg-black text-white'
              : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-black border border-neutral-200'
          }`}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Action Overlay on Hover */}
        <div className="absolute inset-x-2 bottom-2 hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            type="button"
            disabled={product.stock_quantity <= 0}
            onClick={handleQuickAdd}
            className="flex-1 py-2 px-3 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:bg-neutral-400 flex items-center justify-center gap-1.5 transition-colors shadow-lg"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {product.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className="p-2 bg-white text-black border border-neutral-300 hover:border-black flex items-center justify-center transition-colors shadow-lg"
            aria-label="View product details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Label */}
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            {category?.name || 'Custom Apparel'}
          </div>

          {/* Product Title */}
          <Link href={`/shop/${product.slug}`} className="block">
            <h3 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Available Sizes Pills */}
          {product.available_sizes && product.available_sizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold mr-0.5">Sizes:</span>
              {product.available_sizes.slice(0, 5).map((sz, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-[9px] font-mono font-medium border border-neutral-200 text-neutral-600 bg-neutral-50"
                >
                  {sz}
                </span>
              ))}
            </div>
          )}

          {/* Available Colors Swatches */}
          {product.available_colors && product.available_colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold mr-0.5">Colors:</span>
              {product.available_colors.slice(0, 5).map((color, idx) => (
                <span
                  key={idx}
                  title={color.name}
                  className="w-3 h-3 rounded-full border border-neutral-300 shadow-sm inline-block"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.available_colors.length > 5 && (
                <span className="text-[10px] text-neutral-400">
                  +{product.available_colors.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Stock Availability Badge */}
          <div className="mt-2 text-[11px]">
            {product.stock_quantity <= 0 ? (
              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-semibold uppercase tracking-wider">
                Out of Stock
              </span>
            ) : product.stock_quantity <= 5 ? (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider">
                Low Stock ({product.stock_quantity} left)
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold uppercase tracking-wider">
                In Stock ({product.stock_quantity} units)
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Mobile Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-black font-sans">
              {settings.currency_symbol}
              {product.sale_price ?? product.regular_price}
            </span>
            {hasDiscount && (
              <span className="text-xs text-neutral-400 line-through font-sans">
                {settings.currency_symbol}
                {product.regular_price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/shop/${product.slug}`}
              className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-black border border-neutral-300 hover:border-black transition-colors"
            >
              Details
            </Link>
            <button
              type="button"
              disabled={product.stock_quantity <= 0}
              onClick={handleQuickAdd}
              className="sm:hidden p-1.5 bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300"
              aria-label="Add to cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
