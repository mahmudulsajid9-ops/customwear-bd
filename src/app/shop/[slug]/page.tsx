'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import {
  Star,
  Share2,
  ChevronRight,
} from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector';
import ProductCard from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import { ProductVariation } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, categories, settings } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews' | 'shipping'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  // Dynamic reviews state
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'rev-1',
      name: 'Shahriar Alam',
      location: 'Chattogram',
      time: '3 days ago',
      rating: 5,
      comment:
        'The fabric quality is unreal! Heavyweight 240 GSM feels like international streetwear brands. Fast delivery to GEC circle within 24 hours. Highly recommended!',
    },
    {
      id: 'rev-2',
      name: 'Fariha Z.',
      location: 'Dhaka',
      time: '1 week ago',
      rating: 5,
      comment:
        'Got a custom graphic tee printed with my illustration. The print resolution and softness is top-tier. Will order more for our university club.',
    },
    {
      id: 'rev-3',
      name: 'Tanvir Hossain',
      location: 'Chattogram',
      time: '2 weeks ago',
      rating: 5,
      comment:
        'Loved the minimal oversized cut and reactive black dye. Washed it 4 times and zero color fading. Truly premium BD brand.',
    },
  ]);

  const [reviewName, setReviewName] = useState('');
  const [reviewLocation, setReviewLocation] = useState('Chattogram');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewName.trim(),
      location: reviewLocation.trim() || 'Bangladesh',
      time: 'Just now',
      rating: reviewRating,
      comment: reviewComment.trim(),
    };

    setReviewsList([newRev, ...reviewsList]);
    setReviewName('');
    setReviewComment('');
    setReviewSubmitted(true);
    setShowReviewForm(false);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">
          Product Not Found
        </h1>
        <p className="text-xs text-neutral-500 mb-6">
          The requested clothing item might have been moved or removed.
        </p>
        <Link href="/shop" className="btn-primary text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.category_id);

  // Related products from same category or published
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.status === 'published')
    .slice(0, 4);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleVariantChange = (variation?: ProductVariation) => {
    if (variation?.image_url) {
      setSelectedVariantImage(variation.image_url);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-white">
      <div className="container-custom space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-black transition-colors">
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link
                href={`/shop?category=${category.slug}`}
                className="hover:text-black transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-black font-semibold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Top Product Hero: Left Gallery, Right Details & Variations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Gallery (7 Cols on LG) */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={product.images}
              selectedVariantImage={selectedVariantImage}
            />
          </div>

          {/* Right Column: Information, Dynamic Variation Selector (5 Cols on LG) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Category & Badge Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                {category?.name || 'Custom Apparel'}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-black uppercase tracking-wider transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black leading-snug">
              {product.name}
            </h1>

            {/* Reviews Summary */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-semibold text-neutral-800">4.9</span>
              <span className="text-neutral-400">|</span>
              <span
                onClick={() => setActiveTab('reviews')}
                className="text-neutral-500 underline cursor-pointer hover:text-black"
              >
                {reviewsList.length} Verified Customer Reviews
              </span>
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Interactive Dynamic Variation Selector Component */}
            <VariantSelector product={product} onVariantChange={handleVariantChange} />
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="pt-8 border-t border-neutral-200">
          <div className="flex border-b border-neutral-200 gap-8 overflow-x-auto text-xs font-bold uppercase tracking-wider scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('desc')}
              className={`pb-3 transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'desc'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              Description & Craftsmanship
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`pb-3 transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              Fabric & Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shipping')}
              className={`pb-3 transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'shipping'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              Chattogram & All-BD Delivery
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              Customer Reviews ({reviewsList.length})
            </button>
          </div>

          <div className="py-6 text-xs text-neutral-700 leading-relaxed max-w-3xl">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p>{product.description}</p>
                <p>
                  Every garment is cut, stitched, and quality-inspected at our AK Khan, Chattogram facility.
                  Our reactive dyes ensure intense, fade-resistant color even after 50+ wash cycles.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 border border-neutral-200 p-4 bg-neutral-50 text-xs">
                  <div className="font-semibold text-neutral-900">Fabric Composition</div>
                  <div>100% Combed Compact Ring-Spun Cotton</div>
                  <div className="font-semibold text-neutral-900">GSM Weight</div>
                  <div>190 - 240 GSM (Heavyweight Structured Drape)</div>
                  <div className="font-semibold text-neutral-900">Collar</div>
                  <div>1x1 Rib with Lycra for shape retention</div>
                  <div className="font-semibold text-neutral-900">Origin</div>
                  <div>AK Khan, Chattogram, Bangladesh</div>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-3">
                <p>
                  <strong>Inside Chattogram:</strong> Delivery within 24 to 36 hours. Delivery fee: ৳60.
                </p>
                <p>
                  <strong>Outside Chattogram (Dhaka, Sylhet, Khulna, Rajshahi, Barishal, Rangpur, Mymensingh):</strong>{' '}
                  Delivery within 48 to 72 hours via Steadfast / Pathao Express. Delivery fee: ৳120.
                </p>
                <p>
                  <strong>Free Delivery:</strong> Orders exceeding {settings.currency_symbol}{settings.free_shipping_threshold} qualify for 100% free delivery anywhere in Bangladesh.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                  <div>
                    <span className="text-sm font-bold text-black uppercase tracking-wider block">
                      Customer Feedback & Ratings
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Based on verified delivery orders in Bangladesh
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-primary text-[11px] py-1.5 px-3"
                  >
                    {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                  </button>
                </div>

                {reviewSubmitted && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    Thank you! Your verified review has been published.
                  </div>
                )}

                {showReviewForm && (
                  <form onSubmit={handleAddReview} className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                      Share Your Experience with {product.name}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewName}
                          onChange={(e) => setReviewName(e.target.value)}
                          placeholder="e.g. Tanvir Ahmed"
                          className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 focus:border-black outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                          City / District *
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewLocation}
                          onChange={(e) => setReviewLocation(e.target.value)}
                          placeholder="e.g. Chattogram, Dhaka"
                          className="w-full text-xs px-3 py-2 bg-white border border-neutral-300 focus:border-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                        Rating
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= reviewRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-neutral-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold font-mono ml-2">
                          {reviewRating} of 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                        Your Feedback / Fit Review *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell other shoppers about the cotton GSM weight, fit, stitching, and color..."
                        className="w-full text-xs p-3 bg-white border border-neutral-300 focus:border-black outline-none resize-none"
                      />
                    </div>

                    <button type="submit" className="btn-primary text-xs py-2 px-4">
                      Submit Review
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">
                          {rev.name} ({rev.location})
                        </span>
                        <span className="text-[11px] text-neutral-400">
                          Verified Buyer — {rev.time}
                        </span>
                      </div>
                      <div className="flex text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-neutral-600">&quot;{rev.comment}&quot;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-8 border-t border-neutral-200">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
