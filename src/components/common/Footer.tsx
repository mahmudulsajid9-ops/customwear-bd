'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon } from '@/components/common/SocialIcons';
import { useStore } from '@/context/StoreContext';

export default function Footer() {
  const { settings, categories } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-black text-white border-t border-neutral-800">
      {/* Value Proposition Bar */}
      <div className="border-b border-neutral-800 py-10">
        <div className="container-custom grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-white flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                All-Bangladesh Delivery
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Fast doorstep shipping to all 64 districts from Chattogram.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-white flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                100% Combed Cotton
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Pre-shrunk, breathable heavyweight 190 to 240 GSM fabrics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-white flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Easy 7-Day Exchange
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Hassle-free size exchanges and replacement support.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-neutral-900 border border-neutral-800 text-white flex-shrink-0">
              <span className="font-bold text-sm">৳</span>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Cash on Delivery
              </h4>
              <p className="text-xs text-neutral-400 mt-1">
                Pay conveniently at your door or through bKash & Nagad.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="py-16">
        <div className="container-custom grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              {settings.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings.site_name}
                  className="h-10 w-auto object-contain max-w-[170px] brightness-0 invert"
                />
              ) : (
                <span className="text-2xl font-black tracking-tighter uppercase text-white font-sans">
                  CUSTOMWEAR<span className="text-neutral-500 font-light ml-1">BD</span>
                </span>
              )}
              <p className="text-xs tracking-[0.2em] uppercase text-neutral-400 mt-1">
                {settings.site_tagline || 'YOUR DESIGN, YOUR STYLE'}
              </p>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              {settings.footer_description || 'CustomWear BD is Bangladesh\'s premier custom apparel studio. Based in AK Khan, Chattogram, delivering custom & minimalist clothing nationwide.'}
            </p>

            <div className="pt-2 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{settings.site_address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{settings.site_phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{settings.site_email}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              {settings.site_facebook && (
                <a
                  href={settings.site_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {settings.site_instagram && (
                <a
                  href={settings.site_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {settings.site_youtube && (
                <a
                  href={settings.site_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
              {settings.site_tiktok && (
                <a
                  href={settings.site_tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <Link
                  href="/categories"
                  className="text-white font-semibold underline underline-offset-4 hover:text-neutral-300"
                >
                  View All Categories &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Support & Policies
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/track-order" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/return-refund-policy" className="hover:text-white transition-colors">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              VIP Drops Newsletter
            </h4>
            <p className="text-xs text-neutral-400 mb-3">
              Get notified of secret sales, limited batch hoodies, and graphic drops.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-green-400 bg-neutral-900 p-3 border border-neutral-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>Thank you for joining CustomWear VIP.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs px-3.5 py-2.5 text-white placeholder-neutral-500 focus:border-white outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright & Payment Badges */}
      <div className="border-t border-neutral-800 py-6">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} CustomWear BD. All rights reserved. Made in Bangladesh.</p>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="px-2 py-0.5 border border-neutral-700 text-neutral-400">bKash</span>
            <span className="px-2 py-0.5 border border-neutral-700 text-neutral-400">Nagad</span>
            <span className="px-2 py-0.5 border border-neutral-700 text-neutral-400">Rocket</span>
            <span className="px-2 py-0.5 border border-neutral-700 text-neutral-400">Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
