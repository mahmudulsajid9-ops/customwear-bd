'use client';

import React, { useState } from 'react';
import { Save, CheckCircle2, Globe, Truck, CreditCard, Share2, Image as ImageIcon, FileText } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { useStore } from '@/context/StoreContext';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useStore();

  const [siteName, setSiteName] = useState(settings.site_name);
  const [siteTagline, setSiteTagline] = useState(settings.site_tagline);
  const [siteEmail, setSiteEmail] = useState(settings.site_email);
  const [sitePhone, setSitePhone] = useState(settings.site_phone);
  const [siteAddress, setSiteAddress] = useState(settings.site_address);
  const [announcementText, setAnnouncementText] = useState(settings.announcement_text);
  const [footerDescription, setFooterDescription] = useState(settings.footer_description || '');

  // Brand Logo and Favicon
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(settings.favicon_url || '');

  // Social media URLs
  const [siteFacebook, setSiteFacebook] = useState(settings.site_facebook);
  const [siteInstagram, setSiteInstagram] = useState(settings.site_instagram);
  const [siteYoutube, setSiteYoutube] = useState(settings.site_youtube);
  const [siteTiktok, setSiteTiktok] = useState(settings.site_tiktok);

  // Shipping
  const [shippingInsideCtg, setShippingInsideCtg] = useState(settings.shipping_inside_ctg);
  const [shippingOutsideCtg, setShippingOutsideCtg] = useState(settings.shipping_outside_ctg);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    settings.free_shipping_threshold
  );
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '৳');

  // Payment Accounts & Instructions & Toggles
  const [bkashNumber, setBkashNumber] = useState(settings.bkash_number);
  const [nagadNumber, setNagadNumber] = useState(settings.nagad_number);
  const [rocketNumber, setRocketNumber] = useState(settings.rocket_number);

  const [enableCod, setEnableCod] = useState(settings.enable_cod !== false);
  const [enableBkash, setEnableBkash] = useState(settings.enable_bkash !== false);
  const [enableNagad, setEnableNagad] = useState(settings.enable_nagad !== false);
  const [enableRocket, setEnableRocket] = useState(settings.enable_rocket !== false);

  const [codInstructions, setCodInstructions] = useState(settings.cod_instructions || '');
  const [bkashInstructions, setBkashInstructions] = useState(settings.bkash_instructions || '');
  const [nagadInstructions, setNagadInstructions] = useState(settings.nagad_instructions || '');
  const [rocketInstructions, setRocketInstructions] = useState(settings.rocket_instructions || '');

  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      site_name: siteName,
      site_tagline: siteTagline,
      site_email: siteEmail,
      site_phone: sitePhone,
      site_address: siteAddress,
      announcement_text: announcementText,
      footer_description: footerDescription,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      site_facebook: siteFacebook,
      site_instagram: siteInstagram,
      site_youtube: siteYoutube,
      site_tiktok: siteTiktok,
      shipping_inside_ctg: Number(shippingInsideCtg),
      shipping_outside_ctg: Number(shippingOutsideCtg),
      free_shipping_threshold: Number(freeShippingThreshold),
      currency_symbol: currencySymbol,
      bkash_number: bkashNumber,
      nagad_number: nagadNumber,
      rocket_number: rocketNumber,
      enable_cod: enableCod,
      enable_bkash: enableBkash,
      enable_nagad: enableNagad,
      enable_rocket: enableRocket,
      cod_instructions: codInstructions,
      bkash_instructions: bkashInstructions,
      nagad_instructions: nagadInstructions,
      rocket_instructions: rocketInstructions,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Website & Business Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure logo, MFS payment accounts & instructions, shipping rates, and social links.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved & Applied!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 1. Brand Logo & Identity */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            1. Brand Logo & Visual Assets
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <ImageUploader
              label="Store Logo Image"
              value={logoUrl}
              onChange={setLogoUrl}
              helperText="Upload PNG/SVG/WEBP (leave blank for typographical logo)"
            />

            <ImageUploader
              label="Browser Favicon (.ico / .png)"
              value={faviconUrl}
              onChange={setFaviconUrl}
              helperText="Upload 32×32 or 64×64 icon file"
            />
          </div>
        </div>

        {/* 2. General Business Details */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            2. Brand Identity & Chattogram Studio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Tagline *
              </label>
              <input
                type="text"
                required
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Contact Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={sitePhone}
                onChange={(e) => setSitePhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Support Email *
              </label>
              <input
                type="email"
                required
                value={siteEmail}
                onChange={(e) => setSiteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Workshop & Physical Address (Chattogram, Bangladesh) *
              </label>
              <input
                type="text"
                required
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Top Announcement Bar Notice
              </label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Footer Business Description
              </label>
              <textarea
                rows={2}
                value={footerDescription}
                onChange={(e) => setFooterDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Social Media URLs */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            3. Social Media Channels (Facebook, Instagram, YouTube, TikTok)
          </h2>
          <p className="text-xs text-neutral-500">
            These links dynamically update the header topbar, mobile drawer, and footer icons.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={siteFacebook}
                onChange={(e) => setSiteFacebook(e.target.value)}
                placeholder="https://facebook.com/customwearbd"
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Instagram Profile URL
              </label>
              <input
                type="url"
                value={siteInstagram}
                onChange={(e) => setSiteInstagram(e.target.value)}
                placeholder="https://instagram.com/customwearbd"
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="url"
                value={siteYoutube}
                onChange={(e) => setSiteYoutube(e.target.value)}
                placeholder="https://youtube.com/@customwearbd"
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                TikTok Handle URL
              </label>
              <input
                type="url"
                value={siteTiktok}
                onChange={(e) => setSiteTiktok(e.target.value)}
                placeholder="https://tiktok.com/@customwearbd"
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Shipping Rates Configuration */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            4. Shipping Fees, Currency & Free Delivery Threshold
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Inside Chattogram (৳)
              </label>
              <input
                type="number"
                value={shippingInsideCtg}
                onChange={(e) => setShippingInsideCtg(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Outside Chattogram / All BD (৳)
              </label>
              <input
                type="number"
                value={shippingOutsideCtg}
                onChange={(e) => setShippingOutsideCtg(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase text-neutral-700 mb-1">
                Free Delivery Threshold (৳)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* 5. Bangladesh Payment Methods Configuration — Master Requirement #8 */}
        <div className="bg-white p-6 border border-neutral-200 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            5. Bangladesh Payment Methods (COD, bKash, Nagad, Rocket)
          </h2>

          {/* Cash on Delivery */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-black">Cash on Delivery (COD)</span>
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={enableCod}
                  onChange={(e) => setEnableCod(e.target.checked)}
                  className="accent-black"
                />
                <span>Enable Cash on Delivery</span>
              </label>
            </div>
            <div>
              <label className="block text-neutral-600 mb-1">Instructions for Customers</label>
              <input
                type="text"
                value={codInstructions}
                onChange={(e) => setCodInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 bg-white outline-none"
              />
            </div>
          </div>

          {/* bKash */}
          <div className="p-4 bg-pink-50 border border-pink-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-pink-900">Manual bKash Payment</span>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-pink-900">
                <input
                  type="checkbox"
                  checked={enableBkash}
                  onChange={(e) => setEnableBkash(e.target.checked)}
                  className="accent-pink-600"
                />
                <span>Enable bKash</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  bKash Account Number & Type *
                </label>
                <input
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  placeholder="018XXXXXXXX (Personal / Send Money)"
                  className="w-full px-3 py-2 border border-pink-300 bg-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  Send Money Instructions
                </label>
                <input
                  type="text"
                  value={bkashInstructions}
                  onChange={(e) => setBkashInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-pink-300 bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Nagad */}
          <div className="p-4 bg-orange-50 border border-orange-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-orange-900">Manual Nagad Payment</span>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-orange-900">
                <input
                  type="checkbox"
                  checked={enableNagad}
                  onChange={(e) => setEnableNagad(e.target.checked)}
                  className="accent-orange-600"
                />
                <span>Enable Nagad</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  Nagad Account Number & Type *
                </label>
                <input
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  placeholder="017XXXXXXXX (Personal / Send Money)"
                  className="w-full px-3 py-2 border border-orange-300 bg-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  Send Money Instructions
                </label>
                <input
                  type="text"
                  value={nagadInstructions}
                  onChange={(e) => setNagadInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 bg-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rocket */}
          <div className="p-4 bg-purple-50 border border-purple-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-purple-900">Manual Rocket Payment</span>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-purple-900">
                <input
                  type="checkbox"
                  checked={enableRocket}
                  onChange={(e) => setEnableRocket(e.target.checked)}
                  className="accent-purple-600"
                />
                <span>Enable Rocket</span>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  Rocket Account Number & Type *
                </label>
                <input
                  type="text"
                  value={rocketNumber}
                  onChange={(e) => setRocketNumber(e.target.value)}
                  placeholder="018XXXXXXXXX (Personal)"
                  className="w-full px-3 py-2 border border-purple-300 bg-white font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-neutral-700 mb-1 font-semibold">
                  Send Money Instructions
                </label>
                <input
                  type="text"
                  value={rocketInstructions}
                  onChange={(e) => setRocketInstructions(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-300 bg-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary text-xs py-3 px-8 flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save All Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
