'use client';

import React, { useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  selectedVariantImage?: string;
}

export default function ProductGallery({ images, selectedVariantImage }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState<string>(
    selectedVariantImage || images[0]?.image_url || ''
  );
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // If a variant image is passed and changes, update active image
  React.useEffect(() => {
    if (selectedVariantImage) {
      setActiveImage(selectedVariantImage);
    }
  }, [selectedVariantImage]);

  const allImages = images.length > 0 ? images : [{ id: '1', image_url: activeImage, sort_order: 1, is_primary: true }];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails Row / Column */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] pb-2 md:pb-0 scrollbar-thin">
        {allImages.map((img, idx) => (
          <button
            key={img.id || idx}
            type="button"
            onClick={() => setActiveImage(img.image_url)}
            className={`w-16 h-20 sm:w-20 sm:h-24 flex-shrink-0 border transition-all overflow-hidden bg-neutral-100 ${
              activeImage === img.image_url
                ? 'border-black ring-1 ring-black'
                : 'border-neutral-200 hover:border-neutral-400 opacity-75 hover:opacity-100'
            }`}
          >
            <img
              src={img.image_url}
              alt={img.alt_text || `Product thumbnail ${idx + 1}`}
              className="w-full h-full object-cover object-center"
            />
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="relative flex-1 bg-neutral-100 border border-neutral-200 aspect-[3/4] max-h-[620px] overflow-hidden group">
        <img
          src={activeImage}
          alt="Product main view"
          className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        />

        {/* Zoom Hint Button */}
        <button
          type="button"
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-black border border-neutral-200 shadow-md transition-colors"
          aria-label="Enlarge image"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Enlarged Fullscreen Lightbox Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-3 text-white hover:text-neutral-300 z-50"
            aria-label="Close enlarged preview"
          >
            <X className="w-7 h-7" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={activeImage}
              alt="Enlarged product image"
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
