'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Ruler,
  Upload,
  AlertCircle,
  FileImage,
  X,
} from 'lucide-react';
import { Product, ProductVariation } from '@/types';
import { useStore } from '@/context/StoreContext';

interface VariantSelectorProps {
  product: Product;
  onVariantChange?: (variation: ProductVariation | undefined) => void;
}

export default function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const router = useRouter();
  const { settings, addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(product.id);

  // Default selections
  const defaultSize = product.available_sizes[0] || 'M';
  const defaultColor = product.available_colors[0]?.name || 'Black';

  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Custom design inputs
  const [customInstructions, setCustomInstructions] = useState('');
  const [customFile, setCustomFile] = useState<{ name: string; url: string; size: string } | null>(
    null
  );
  const [fileError, setFileError] = useState('');

  // Find matching variation based on selected size & color
  const currentVariation = useMemo(() => {
    if (!product.variations || product.variations.length === 0) return undefined;
    return product.variations.find((v) => {
      const matchSize = !v.attributes.Size || v.attributes.Size === selectedSize;
      const matchColor = !v.attributes.Color || v.attributes.Color === selectedColor;
      return matchSize && matchColor && v.is_active;
    }) || product.variations[0];
  }, [product.variations, selectedSize, selectedColor]);

  // Notify parent of variant changes (e.g. to update active image)
  React.useEffect(() => {
    if (onVariantChange) {
      onVariantChange(currentVariation);
    }
  }, [currentVariation, onVariantChange]);

  // Derived price & stock
  const currentRegularPrice = currentVariation
    ? currentVariation.regular_price
    : product.regular_price;
  const currentSalePrice = currentVariation
    ? currentVariation.sale_price
    : product.sale_price;
  const hasDiscount = currentSalePrice && currentSalePrice < currentRegularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentRegularPrice - currentSalePrice!) / currentRegularPrice) * 100)
    : 0;

  const currentStock = currentVariation
    ? currentVariation.stock_quantity
    : product.stock_quantity;
  const isOutOfStock = currentStock <= 0;
  const currentSku = currentVariation?.sku || product.sku || 'CW-GEN-001';

  // Handle custom design image upload with validation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    // Validate size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError('File size exceeds the 5MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCustomFile({
        name: file.name,
        url: reader.result as string,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    };
    reader.readAsDataURL(file);
  };

  const buildCartItem = () => {
    return {
      id: `${product.id}-${currentVariation?.id || 'base'}-${selectedSize}-${selectedColor}`,
      product_id: product.id,
      variation_id: currentVariation?.id,
      product_name: product.name,
      slug: product.slug,
      image_url:
        currentVariation?.image_url ||
        product.images[0]?.image_url ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      regular_price: currentRegularPrice,
      sale_price: currentSalePrice,
      unit_price: currentSalePrice ?? currentRegularPrice,
      quantity,
      selected_size: selectedSize,
      selected_color: selectedColor,
      custom_instruction: customInstructions.trim() || undefined,
      custom_image_url: customFile?.url,
      sku: currentSku,
      max_stock: currentStock,
    };
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(buildCartItem());
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(buildCartItem());
    router.push('/checkout');
  };

  return (
    <div className="space-y-6">
      {/* Price & SKU Header */}
      <div>
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
          <span className="font-mono">SKU: {currentSku}</span>
          <span className="text-[11px] font-semibold text-neutral-600 uppercase">
            {isOutOfStock ? (
              <span className="text-red-600">Out of Stock</span>
            ) : currentStock <= 5 ? (
              <span className="text-amber-600">Only {currentStock} remaining</span>
            ) : (
              <span className="text-green-700">In Stock ({currentStock} units)</span>
            )}
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-black font-sans">
            {settings.currency_symbol}
            {currentSalePrice ?? currentRegularPrice}
          </span>
          {hasDiscount && (
            <>
              <span className="text-base text-neutral-400 line-through font-sans">
                {settings.currency_symbol}
                {currentRegularPrice}
              </span>
              <span className="px-2 py-0.5 bg-black text-white text-xs font-bold uppercase tracking-wider">
                Save {discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* 1. Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Select Size:{' '}
            <span className="font-normal text-neutral-600 ml-1">{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 underline transition-colors"
          >
            <Ruler className="w-3.5 h-3.5" />
            Size Guide
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {product.available_sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`min-w-[46px] h-10 px-3 border text-xs font-bold uppercase tracking-wider transition-all ${
                selectedSize === size
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-black">
            Select Color:{' '}
            <span className="font-normal text-neutral-600 ml-1">{selectedColor}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {product.available_colors.map((color) => {
            const isSelected = selectedColor === color.name;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => setSelectedColor(color.name)}
                title={color.name}
                className={`relative w-8 h-8 rounded-full border-2 transition-all p-0.5 ${
                  isSelected ? 'border-black scale-110' : 'border-transparent hover:scale-105'
                }`}
              >
                <span
                  className="block w-full h-full rounded-full border border-neutral-300 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Optional Custom Design Request Box */}
      {product.is_customizable && (
        <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>Custom Design Instructions</span>
              <span className="text-[10px] font-normal text-neutral-500 lowercase">(optional)</span>
            </span>
          </div>

          <textarea
            rows={2}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Print 'CHATTOGRAM VIBES' centered in white font on front chest."
            className="w-full text-xs p-3 border border-neutral-300 focus:border-black bg-white outline-none resize-none"
          />

          {/* Upload Custom Graphic */}
          <div>
            <label className="text-[11px] font-medium text-neutral-700 block mb-1">
              Upload Your Logo or Artwork (PNG, JPG, SVG, max 5MB):
            </label>

            {customFile ? (
              <div className="flex items-center justify-between p-2.5 bg-white border border-neutral-300">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileImage className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-neutral-900 truncate">
                    {customFile.name}
                  </span>
                  <span className="text-[10px] text-neutral-400">({customFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomFile(null)}
                  className="text-neutral-400 hover:text-black p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-neutral-300 hover:border-black cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-neutral-500" />
                <span className="text-xs text-neutral-600 font-medium">Click to upload design file</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {fileError && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fileError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4. Quantity Selector + Add to Cart + Buy Now */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="inline-flex items-center border border-neutral-300 h-12">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center text-xs font-bold font-mono text-neutral-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
              disabled={quantity >= currentStock}
              className="w-10 h-full flex items-center justify-center text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to Bag Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 h-12 btn-primary text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            className={`w-12 h-12 border flex items-center justify-center transition-colors ${
              wishlisted
                ? 'border-black bg-black text-white'
                : 'border-neutral-300 hover:border-black text-neutral-700'
            }`}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Buy Now Direct Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className="w-full h-12 btn-secondary text-xs"
        >
          Buy It Now (Direct Checkout)
        </button>
      </div>

      {/* Value Badges */}
      <div className="p-4 bg-neutral-50 border border-neutral-200 divide-y divide-neutral-200 text-xs text-neutral-600 space-y-2">
        <div className="flex items-center gap-3 pb-2">
          <Truck className="w-4 h-4 text-black flex-shrink-0" />
          <span>Inside Chattogram ৳60 (24h) | All Bangladesh ৳120 (48-72h)</span>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
          <span>Cash on Delivery + bKash / Nagad verified payments</span>
        </div>
      </div>

      {/* Sizing Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 border border-neutral-300 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-black uppercase tracking-wider text-black mb-1">
              Bangladeshi Standard Size Guide
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              All measurements are given in inches for regular & oversized apparel.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-neutral-200">
                <thead className="bg-neutral-100 text-neutral-700 uppercase font-bold">
                  <tr>
                    <th className="p-2 border">Size</th>
                    <th className="p-2 border">Chest (Inches)</th>
                    <th className="p-2 border">Length (Inches)</th>
                    <th className="p-2 border">Sleeve</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono text-neutral-800">
                  <tr>
                    <td className="p-2 border font-bold">S</td>
                    <td className="p-2 border">38&quot;</td>
                    <td className="p-2 border">27&quot;</td>
                    <td className="p-2 border">8.0&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold">M</td>
                    <td className="p-2 border">40&quot;</td>
                    <td className="p-2 border">28&quot;</td>
                    <td className="p-2 border">8.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold">L</td>
                    <td className="p-2 border">42&quot;</td>
                    <td className="p-2 border">29&quot;</td>
                    <td className="p-2 border">9.0&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold">XL</td>
                    <td className="p-2 border">44&quot;</td>
                    <td className="p-2 border">30&quot;</td>
                    <td className="p-2 border">9.5&quot;</td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-bold">XXL</td>
                    <td className="p-2 border">46&quot;</td>
                    <td className="p-2 border">31&quot;</td>
                    <td className="p-2 border">10.0&quot;</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-neutral-500 mt-4 italic">
              Note: For an oversized drop-shoulder fit, consider ordering your standard true size.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
