'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function HeroCarousel() {
  const { banners } = useStore();
  const activeSlides = banners.filter((b) => b.is_active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  // Autoplay timer
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, activeSlides.length]);

  if (activeSlides.length === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[650px] bg-black overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image with Smooth Minimal Vignette Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentSlide.image_url}
          alt={currentSlide.title}
          className="w-full h-full object-cover object-center opacity-70 transition-transform duration-1000 ease-out transform scale-105"
        />
        {/* Monochromatic Dark Film Overlay for high text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content Container */}
      <div className="relative h-full container-custom flex items-center">
        <div className="max-w-2xl text-white space-y-5 animate-fadeIn">
          {currentSlide.subtitle && (
            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold uppercase tracking-[0.25em]">
              {currentSlide.subtitle}
            </div>
          )}

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight font-sans">
            {currentSlide.title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 font-light max-w-xl leading-relaxed">
            {currentSlide.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={currentSlide.cta_link || '/shop'}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all duration-200"
            >
              <span>{currentSlide.cta_text || 'Shop Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {currentSlide.cta_secondary_text && (
              <Link
                href={currentSlide.cta_secondary_link || '/about'}
                className="inline-flex items-center px-7 py-3.5 bg-black/40 backdrop-blur-sm border border-white/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-200"
              >
                {currentSlide.cta_secondary_text}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-black/40 hover:bg-white hover:text-black text-white border border-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10">
          {activeSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
