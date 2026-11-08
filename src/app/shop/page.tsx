'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Search, RotateCcw, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const filterParam = searchParams.get('filter');

  const { products, categories, settings } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [nameSearch, setNameSearch] = useState<string>(searchParam || '');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [maxPrice, setMaxPrice] = useState<number>(2500);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(8);

  // Sync category param if query changes
  React.useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  React.useEffect(() => {
    if (searchParam) {
      setNameSearch(searchParam);
    }
  }, [searchParam]);

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Extract unique colors across all products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    products.forEach((p) => {
      p.available_colors?.forEach((c) => colorSet.add(c.name));
      p.variations?.forEach((v) => {
        if (v.attributes.Color) colorSet.add(v.attributes.Color);
      });
    });
    return Array.from(colorSet);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.status === 'published');

    // 1. Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const targetCategory = categories.find((c) => c.slug === selectedCategory);
      if (targetCategory) {
        result = result.filter((p) => p.category_id === targetCategory.id);
      }
    }

    // 2. Name / Keyword search
    if (nameSearch.trim()) {
      const q = nameSearch.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Size filter
    if (selectedSize && selectedSize !== 'all') {
      result = result.filter(
        (p) =>
          p.available_sizes?.includes(selectedSize) ||
          p.variations?.some((v) => v.attributes.Size === selectedSize)
      );
    }

    // 4. Color filter
    if (selectedColor && selectedColor !== 'all') {
      result = result.filter(
        (p) =>
          p.available_colors?.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase()) ||
          p.variations?.some(
            (v) => v.attributes.Color?.toLowerCase() === selectedColor.toLowerCase()
          )
      );
    }

    // 5. Availability filter (In Stock only)
    if (inStockOnly) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // 6. Filter param (new arrivals, bestsellers)
    if (filterParam === 'new') {
      result = [...result].reverse();
    }

    // 7. Price filter
    result = result.filter((p) => {
      const effectivePrice = p.sale_price ?? p.regular_price;
      return effectivePrice <= maxPrice;
    });

    // 8. Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort(
          (a, b) => (a.sale_price ?? a.regular_price) - (b.sale_price ?? b.regular_price)
        );
        break;
      case 'price-high':
        result.sort(
          (a, b) => (b.sale_price ?? b.regular_price) - (a.sale_price ?? a.regular_price)
        );
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'popularity':
        result.sort((a, b) => (b.is_best_seller ? 1 : 0) - (a.is_best_seller ? 1 : 0));
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [
    products,
    categories,
    selectedCategory,
    nameSearch,
    selectedSize,
    selectedColor,
    inStockOnly,
    filterParam,
    maxPrice,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setSelectedColor('all');
    setInStockOnly(false);
    setNameSearch('');
    setMaxPrice(2500);
    setSortBy('featured');
    setVisibleCount(8);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    inStockOnly ||
    nameSearch.trim().length > 0 ||
    maxPrice < 2500;

  const paginatedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="py-8 sm:py-12 bg-white">
      <div className="container-custom">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8 pb-4 border-b border-neutral-200">
          <div className="text-xs text-neutral-400 mb-1">
            <span>Home</span> / <span className="text-black font-semibold">Shop All</span>
            {nameSearch && <span className="text-neutral-500"> / Search: &quot;{nameSearch}&quot;</span>}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-black">
                {selectedCategory === 'all'
                  ? 'All Apparel'
                  : categories.find((c) => c.slug === selectedCategory)?.name || 'Catalog'}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                Showing {paginatedProducts.length} of {filteredProducts.length} items
              </p>
            </div>

            {/* Sort & Mobile Filter Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-3.5 py-2 border border-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-neutral-500 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-neutral-300 bg-white text-xs font-medium py-2 px-3 text-neutral-900 outline-none cursor-pointer focus:border-black"
                >
                  <option value="featured">Featured First</option>
                  <option value="popularity">Popularity (Best Sellers)</option>
                  <option value="newest">Latest Drops</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:block space-y-6 bg-white lg:bg-transparent p-4 lg:p-0 border border-neutral-200 lg:border-none`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Filters & Attributes
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-neutral-500 hover:text-black underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Search by name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                Search Product
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Oversized, Hoodie..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none"
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-3">
                Categories
              </h3>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`block w-full text-left py-1.5 px-2 transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-black text-white font-bold'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  All Categories ({products.length})
                </button>
                {categories.map((c) => {
                  const count = products.filter((p) => p.category_id === c.id).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`block w-full text-left py-1.5 px-2 transition-colors flex items-center justify-between ${
                        selectedCategory === c.slug
                          ? 'bg-black text-white font-bold'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                Filter by Size
              </h3>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSize('all')}
                  className={`py-1.5 text-xs font-mono font-medium border text-center transition-colors ${
                    selectedSize === 'all'
                      ? 'bg-black text-white border-black'
                      : 'border-neutral-200 text-neutral-700 hover:border-black'
                  }`}
                >
                  All
                </button>
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-1.5 text-xs font-mono font-medium border text-center transition-colors ${
                      selectedSize === s
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                  Filter by Color
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedColor('all')}
                    className={`px-2 py-1 text-[11px] border font-medium transition-colors ${
                      selectedColor === 'all'
                        ? 'bg-black text-white border-black'
                        : 'border-neutral-200 text-neutral-700 hover:border-black'
                    }`}
                  >
                    All Colors
                  </button>
                  {availableColors.map((colorName) => (
                    <button
                      key={colorName}
                      type="button"
                      onClick={() => setSelectedColor(colorName)}
                      className={`px-2 py-1 text-[11px] border font-medium transition-colors ${
                        selectedColor === colorName
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-200 text-neutral-700 hover:border-black'
                      }`}
                    >
                      {colorName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Availability */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2">
                Availability
              </h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black mb-2">
                <span>Max Price:</span>
                <span className="font-mono">
                  {settings.currency_symbol}
                  {maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="2500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                <span>{settings.currency_symbol}300</span>
                <span>{settings.currency_symbol}2500</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area (3 Cols) */}
          <main className="lg:col-span-3 space-y-8">
            {paginatedProducts.length === 0 ? (
              <div className="py-20 text-center border border-neutral-200 p-8 bg-neutral-50">
                <h3 className="text-base font-bold uppercase tracking-wider text-black mb-1">
                  No products found
                </h3>
                <p className="text-xs text-neutral-500 mb-6 max-w-sm mx-auto">
                  Try clearing your filters or search criteria to view available customwear.
                </p>
                <button type="button" onClick={resetFilters} className="btn-primary text-xs">
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Load More / Pagination Button */}
                {visibleCount < filteredProducts.length && (
                  <div className="pt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="btn-secondary text-xs px-8 py-3 uppercase tracking-widest font-bold"
                    >
                      Load More Products ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-custom py-16 text-xs">Loading collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}
