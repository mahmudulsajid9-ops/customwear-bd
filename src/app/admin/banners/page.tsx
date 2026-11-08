'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { useStore } from '@/context/StoreContext';
import { BannerSlide } from '@/types';

export default function AdminBannersPage() {
  const { banners, addBanner, updateBanner, deleteBanner, reorderBanners } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ctaText, setCtaText] = useState('Shop Now');
  const [ctaLink, setCtaLink] = useState('/shop');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('');
  const [ctaSecondaryLink, setCtaSecondaryLink] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('NEW COLLECTION 2026');
    setDescription('Upload your design, choose your style, and wear your creativity.');
    setImageUrl('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1800&q=85');
    setCtaText('Shop Now');
    setCtaLink('/shop');
    setCtaSecondaryText('Custom Orders');
    setCtaSecondaryLink('/shop/custom-signature-t-shirt');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (b: BannerSlide) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setDescription(b.description);
    setImageUrl(b.image_url);
    setCtaText(b.cta_text);
    setCtaLink(b.cta_link);
    setCtaSecondaryText(b.cta_secondary_text || '');
    setCtaSecondaryLink(b.cta_secondary_link || '');
    setIsActive(b.is_active);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      subtitle,
      description,
      image_url: imageUrl,
      cta_text: ctaText,
      cta_link: ctaLink,
      cta_secondary_text: ctaSecondaryText || undefined,
      cta_secondary_link: ctaSecondaryLink || undefined,
      is_active: isActive,
      sort_order: editingBanner ? editingBanner.sort_order : banners.length + 1,
    };

    if (editingBanner) {
      updateBanner(editingBanner.id, payload);
    } else {
      addBanner(payload);
    }
    setModalOpen(false);
  };

  const moveSlide = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= banners.length) return;
    const copy = [...banners];
    const temp = copy[idx];
    copy[idx] = copy[newIdx];
    copy[newIdx] = temp;
    reorderBanners(copy);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Hero Carousel Slides
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Customize homepage full-width hero slides, headlines, imagery, and button actions.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Carousel Slide</span>
        </button>
      </div>

      {/* Slide Cards List */}
      <div className="space-y-4">
        {banners.map((slide, idx) => (
          <div
            key={slide.id}
            className="bg-white border border-neutral-200 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
          >
            {/* Thumbnail + Details */}
            <div className="flex items-start gap-4 flex-1">
              <div className="relative w-32 h-20 bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden">
                <img
                  src={slide.image_url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {!slide.is_active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-wider">
                    Unpublished
                  </div>
                )}
              </div>

              <div className="space-y-1">
                {slide.subtitle && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    {slide.subtitle}
                  </span>
                )}
                <h3 className="text-sm font-bold uppercase text-black line-clamp-1">
                  {slide.title}
                </h3>
                <p className="text-xs text-neutral-500 line-clamp-1 max-w-xl">
                  {slide.description}
                </p>
                <div className="flex gap-3 text-[11px] text-neutral-600 font-mono pt-1">
                  <span>Primary: &quot;{slide.cta_text}&quot; → {slide.cta_link}</span>
                  {slide.cta_secondary_text && (
                    <span>| Secondary: &quot;{slide.cta_secondary_text}&quot;</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions & Reordering */}
            <div className="flex items-center gap-2 self-end md:self-center">
              {/* Up/Down buttons */}
              <button
                type="button"
                onClick={() => moveSlide(idx, 'up')}
                disabled={idx === 0}
                className="p-1.5 border border-neutral-300 hover:border-black disabled:opacity-20"
                title="Move Slide Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveSlide(idx, 'down')}
                disabled={idx === banners.length - 1}
                className="p-1.5 border border-neutral-300 hover:border-black disabled:opacity-20"
                title="Move Slide Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => updateBanner(slide.id, { is_active: !slide.is_active })}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase ${
                  slide.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {slide.is_active ? 'Live' : 'Hidden'}
              </button>

              <button
                type="button"
                onClick={() => openEditModal(slide)}
                className="p-1.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black"
                title="Edit Slide"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete slide &quot;${slide.title}&quot;?`)) {
                    deleteBanner(slide.id);
                  }
                }}
                className="p-1.5 border border-neutral-300 hover:border-red-600 text-neutral-400 hover:text-red-600"
                title="Delete Slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-neutral-300 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                {editingBanner ? 'Edit Carousel Slide' : 'New Carousel Slide'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Turn Your Ideas Into Unique T-Shirts"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Eyebrow Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. AK KHAN, CHATTOGRAM WORKSHOP"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Supporting Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Upload your design, choose your style, and wear your creativity."
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none resize-none"
                />
              </div>

              <ImageUploader
                label="High-Quality Fashion Image"
                value={imageUrl}
                onChange={setImageUrl}
                required
                helperText="Upload 1800×900 recommended banner image or paste URL"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Button 1 Text
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Button 1 Link
                  </label>
                  <input
                    type="text"
                    required
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Button 2 Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryText}
                    onChange={(e) => setCtaSecondaryText(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Button 2 Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={ctaSecondaryLink}
                    onChange={(e) => setCtaSecondaryLink(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-black"
                  />
                  <span>Publish Slide</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
