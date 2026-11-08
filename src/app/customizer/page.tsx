'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Upload,
  Type,
  Palette,
  RotateCcw,
  ShoppingBag,
  Check,
  ChevronRight,
  ZoomIn,
  Move,
  Info,
  ShieldCheck,
  Layers,
  ArrowRight,
  Printer,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface GarmentOption {
  id: string;
  name: string;
  basePrice: number;
  gsm: string;
  description: string;
}

const garments: GarmentOption[] = [
  {
    id: 'oversized-tee',
    name: '240 GSM Oversized Heavyweight Tee',
    basePrice: 650,
    gsm: '240 GSM',
    description: '100% combed cotton, drop-shoulder streetwear cut, reinforced 1x1 rib collar.',
  },
  {
    id: 'regular-tee',
    name: '190 GSM Classic Crewneck Tee',
    basePrice: 550,
    gsm: '190 GSM',
    description: 'Everyday comfortable fit, breathable compact cotton, pre-shrunk fabric.',
  },
  {
    id: 'fleece-hoodie',
    name: '320 GSM French Terry Cotton Hoodie',
    basePrice: 1250,
    gsm: '320 GSM',
    description: 'Double-layered hood, brushed inner fleece, kangaroo pocket, ribbed cuffs.',
  },
  {
    id: 'polo-shirt',
    name: '220 GSM Pique Polo Shirt',
    basePrice: 750,
    gsm: '220 GSM',
    description: 'Classic honeycomb knit, double-button placket, formal-casual versatility.',
  },
];

const apparelColors = [
  { name: 'Black', hex: '#111111', textColor: '#FFFFFF' },
  { name: 'White', hex: '#F9FAFB', textColor: '#111111' },
  { name: 'Charcoal', hex: '#333333', textColor: '#FFFFFF' },
  { name: 'Navy Blue', hex: '#1E293B', textColor: '#FFFFFF' },
  { name: 'Crimson Red', hex: '#881337', textColor: '#FFFFFF' },
  { name: 'Forest Green', hex: '#064E3B', textColor: '#FFFFFF' },
  { name: 'Vintage Sand', hex: '#D4B996', textColor: '#111111' },
];

const sizes = ['S', 'M', 'L', 'XL', '2XL'];

const fonts = [
  { name: 'Modern Gothic (Impact)', family: 'Impact, sans-serif' },
  { name: 'Clean Minimalist', family: 'system-ui, sans-serif' },
  { name: 'Editorial Serif', family: 'Georgia, serif' },
  { name: 'Monospace Code', family: 'monospace' },
  { name: 'Brush Script', family: 'cursive' },
];

const sampleGraphics = [
  {
    name: 'Vintage Crest',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Abstract Wave',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Retro Tiger',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  },
];

export default function CustomizerPage() {
  const { addToCart, settings } = useStore();

  // Customizer state
  const [activeTab, setActiveTab] = useState<'garment' | 'text' | 'graphic' | 'notes'>('garment');
  const [selectedGarment, setSelectedGarment] = useState<GarmentOption>(garments[0]);
  const [selectedColor, setSelectedColor] = useState(apparelColors[0]);
  const [selectedSize, setSelectedSize] = useState('L');
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');

  // Text configuration
  const [customText, setCustomText] = useState('CUSTOMWEAR BD');
  const [fontFamily, setFontFamily] = useState(fonts[0].family);
  const [fontSize, setFontSize] = useState(28);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textPosition, setTextPosition] = useState<'center' | 'chest' | 'lower'>('center');

  // Graphic / Artwork configuration
  const [graphicUrl, setGraphicUrl] = useState<string>('');
  const [graphicScale, setGraphicScale] = useState(70);
  const [uploadingGraphic, setUploadingGraphic] = useState(false);

  // Special instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [printTechnique, setPrintTechnique] = useState<'dtf' | 'screen' | 'embroidery'>('dtf');

  // Calculate pricing
  const hasFrontPrint = Boolean(customText.trim() || graphicUrl);
  const printFee = hasFrontPrint ? 150 : 0;
  const totalPrice = selectedGarment.basePrice + printFee;

  // Handle image file upload
  const handleGraphicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingGraphic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setGraphicUrl(data.url);
      }
    } catch {
      alert('Failed to upload artwork. Please try again.');
    } finally {
      setUploadingGraphic(false);
    }
  };

  const handleAddToCart = () => {
    const cartItemId = `custom-${selectedGarment.id}-${selectedColor.name}-${selectedSize}-${Date.now()}`;
    const customInstructionSummary = [
      customText ? `Text: "${customText}" (${fontFamily})` : '',
      graphicUrl ? `Custom Graphic Attached` : '',
      specialInstructions ? `Notes: ${specialInstructions}` : '',
      `Print: ${printTechnique.toUpperCase()}`,
    ]
      .filter(Boolean)
      .join(' | ');

    addToCart({
      id: cartItemId,
      product_id: 'prod-custom-studio',
      product_name: `Custom ${selectedGarment.name}`,
      slug: 'custom-signature-t-shirt',
      selected_size: selectedSize,
      selected_color: selectedColor.name,
      sku: `CW-CUST-${selectedColor.name.substring(0, 3).toUpperCase()}-${selectedSize}`,
      regular_price: totalPrice,
      unit_price: totalPrice,
      quantity: 1,
      image_url:
        graphicUrl ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      custom_instruction: customInstructionSummary,
      custom_image_url: graphicUrl || undefined,
      max_stock: 99,
    });
  };

  return (
    <div className="py-8 sm:py-12 bg-neutral-50/70 min-h-[90vh]">
      <div className="container-custom space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200 bg-white p-6 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Studio 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
              Interactive Customizer Studio
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Design your personalized apparel live. Crafted and printed in AK Khan, Chattogram.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                Estimated Price
              </span>
              <span className="text-2xl font-black font-mono text-black">
                {settings.currency_symbol}
                {totalPrice}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="btn-primary py-3 px-6 text-xs uppercase tracking-widest font-bold flex items-center gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Custom Tee</span>
            </button>
          </div>
        </div>

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 2D Canvas Mockup Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-neutral-200 p-6 sm:p-10 flex flex-col items-center justify-center relative shadow-sm min-h-[580px]">
            {/* View Switcher Controls (Front / Back) */}
            <div className="absolute top-4 left-4 z-20 flex bg-neutral-100 p-1 border border-neutral-200 rounded">
              <button
                type="button"
                onClick={() => setCurrentView('front')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  currentView === 'front'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Front View
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('back')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  currentView === 'back'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                Back View
              </button>
            </div>

            {/* Quick Specs Pill */}
            <div className="absolute top-4 right-4 z-20 text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-800 font-bold border border-neutral-300">
                {selectedGarment.gsm} • {selectedColor.name} • {selectedSize}
              </span>
            </div>

            {/* THE T-SHIRT CANVAS CONTAINER */}
            <div className="relative w-full max-w-md aspect-[4/5] flex items-center justify-center select-none">
              {/* Silhouette SVG Mask with reactive background color */}
              <div
                className="w-full h-full relative transition-colors duration-300 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-200"
                style={{ backgroundColor: selectedColor.hex }}
              >
                {/* Visual Apparel Collar & Sleeves Overlay */}
                <svg
                  className="w-full h-full absolute inset-0 opacity-20 pointer-events-none"
                  viewBox="0 0 400 500"
                  fill="none"
                  stroke={selectedColor.hex === '#F9FAFB' ? '#000000' : '#FFFFFF'}
                  strokeWidth="2"
                >
                  {/* Crewneck Collar */}
                  <path d="M 140 30 Q 200 90 260 30" strokeWidth="6" strokeLinecap="round" />
                  {/* Shoulders */}
                  <path d="M 140 30 L 40 100 L 10 180 L 80 210 L 100 160 L 100 480 L 300 480 L 300 160 L 320 210 L 390 180 L 360 100 L 260 30" />
                  {/* Seams */}
                  <line x1="100" y1="160" x2="300" y2="160" strokeDasharray="4 4" />
                </svg>

                {/* Safe Print Zone Box */}
                <div
                  className={`w-3/5 h-3/5 border border-dashed rounded relative flex flex-col items-center justify-center p-4 transition-all ${
                    selectedColor.hex === '#F9FAFB' ? 'border-neutral-300' : 'border-white/20'
                  }`}
                >
                  <span className="absolute top-1 left-2 text-[8px] font-mono uppercase tracking-widest opacity-40">
                    Print Area (Front)
                  </span>

                  {/* 1. Graphic Layer */}
                  {graphicUrl && (
                    <div
                      className="mb-2 max-w-full overflow-hidden flex items-center justify-center transition-transform"
                      style={{ width: `${graphicScale}%` }}
                    >
                      <img
                        src={graphicUrl}
                        alt="Custom Graphic"
                        className="max-h-44 object-contain drop-shadow-md pointer-events-none"
                      />
                    </div>
                  )}

                  {/* 2. Custom Typography Layer */}
                  {customText.trim() && (
                    <div
                      className="text-center font-bold tracking-wider leading-tight max-w-full break-words select-none"
                      style={{
                        fontFamily,
                        fontSize: `${fontSize}px`,
                        color: textColor,
                        textShadow:
                          selectedColor.hex === '#F9FAFB'
                            ? '0 1px 2px rgba(0,0,0,0.2)'
                            : '0 2px 4px rgba(0,0,0,0.7)',
                      }}
                    >
                      {customText}
                    </div>
                  )}

                  {/* Empty Placeholder Prompt */}
                  {!customText.trim() && !graphicUrl && (
                    <div className="text-center space-y-1 p-4 opacity-50">
                      <Type className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-[11px] font-mono uppercase">Your Artwork or Text Here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Info Footer */}
            <div className="w-full pt-4 mt-6 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Wash-Proof DTF / Reactive Dye Printing</span>
              </span>
              <span className="font-mono text-[11px]">Chattogram Workshop Queue: 24h</span>
            </div>
          </div>

          {/* RIGHT: CUSTOMIZATION CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Control Tabs */}
            <div className="flex bg-neutral-200/80 p-1 rounded border border-neutral-300 gap-1 text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setActiveTab('garment')}
                className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'garment' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Garment</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'text' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('graphic')}
                className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'graphic' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Artwork</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2 rounded transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'notes' ? 'bg-white text-black shadow-sm' : 'text-neutral-600 hover:text-black'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Finish</span>
              </button>
            </div>

            {/* TAB 1: GARMENT SELECTION */}
            {activeTab === 'garment' && (
              <div className="bg-white p-6 border border-neutral-200 space-y-6 shadow-sm">
                {/* 1. Apparel Silhouette */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                    1. Select Garment Base
                  </label>
                  <div className="space-y-2">
                    {garments.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setSelectedGarment(g)}
                        className={`p-3.5 border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          selectedGarment.id === g.id
                            ? 'border-black bg-neutral-50 ring-1 ring-black'
                            : 'border-neutral-200 hover:border-neutral-400'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-black uppercase">{g.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-neutral-200 font-bold">
                              {g.gsm}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{g.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-black whitespace-nowrap">
                          {settings.currency_symbol}
                          {g.basePrice}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Fabric Color */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-2">
                    2. Fabric Dye Color: <span className="font-mono text-neutral-600 font-normal">{selectedColor.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {apparelColors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c);
                          // Auto adjust text color for contrast if user hasn't explicitly set it
                          if (c.hex === '#F9FAFB') {
                            setTextColor('#111111');
                          } else if (c.hex === '#111111' || c.hex === '#333333' || c.hex === '#1E293B') {
                            setTextColor('#FFFFFF');
                          }
                        }}
                        className={`w-9 h-9 rounded-full border flex items-center justify-center transition-transform hover:scale-110 relative ${
                          selectedColor.name === c.name ? 'ring-2 ring-black ring-offset-2' : 'border-neutral-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor.name === c.name && (
                          <Check
                            className={`w-4 h-4 ${c.hex === '#F9FAFB' || c.hex === '#D4B996' ? 'text-black' : 'text-white'}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Apparel Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-black">
                      3. Garment Size
                    </label>
                    <span className="text-[11px] text-neutral-400">Regular Unisex BD Fit</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`py-2 text-xs font-mono font-bold uppercase border transition-all ${
                          selectedSize === s
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEXT DESIGN */}
            {activeTab === 'text' && (
              <div className="bg-white p-6 border border-neutral-200 space-y-5 shadow-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                    Custom Print Headline / Slogan
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. CHATTOGRAM STREETWEAR"
                    className="w-full text-xs px-3 py-2.5 border border-neutral-300 focus:border-black outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                    Typography Font Style
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none bg-white"
                  >
                    {fonts.map((f) => (
                      <option key={f.name} value={f.family} style={{ fontFamily: f.family }}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 cursor-pointer border border-neutral-300 p-0.5 rounded"
                      />
                      <span className="font-mono text-xs font-bold">{textColor}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-black">
                        Font Size
                      </label>
                      <span className="text-[10px] font-mono text-neutral-400">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={16}
                      max={48}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCustomText('')}
                    className="text-xs text-neutral-400 hover:text-red-600 underline"
                  >
                    Clear Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('graphic')}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>Next: Add Artwork</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: ARTWORK UPLOAD */}
            {activeTab === 'graphic' && (
              <div className="bg-white p-6 border border-neutral-200 space-y-5 shadow-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                    Upload Your Logo or Graphic
                  </label>
                  <p className="text-[11px] text-neutral-500 mb-3">
                    Upload transparent PNG, JPG, or SVG (max 5MB). High resolution recommended.
                  </p>

                  <label className="border-2 border-dashed border-neutral-300 hover:border-black p-6 rounded text-center block cursor-pointer transition-colors bg-neutral-50 hover:bg-neutral-100">
                    <Upload className="w-8 h-8 mx-auto text-neutral-400 mb-2" />
                    <span className="text-xs font-bold uppercase tracking-wider text-black block">
                      {uploadingGraphic ? 'Uploading...' : 'Browse Design File'}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-1 block">
                      PNG / JPG / WEBP up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGraphicUpload}
                      disabled={uploadingGraphic}
                      className="hidden"
                    />
                  </label>
                </div>

                {graphicUrl && (
                  <div className="space-y-3 pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-black">Graphic Scale</span>
                      <span className="text-xs font-mono text-neutral-500">{graphicScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={30}
                      max={100}
                      value={graphicScale}
                      onChange={(e) => setGraphicScale(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setGraphicUrl('')}
                      className="text-xs text-red-600 hover:underline block"
                    >
                      Remove Uploaded Artwork
                    </button>
                  </div>
                )}

                {/* Preset Graphics */}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-black block mb-2">
                    Or Choose Sample Inspiration Graphic:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleGraphics.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => setGraphicUrl(item.url)}
                        className={`p-2 border cursor-pointer hover:border-black transition-all text-center rounded ${
                          graphicUrl === item.url ? 'border-black bg-neutral-100 ring-1 ring-black' : 'border-neutral-200'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-14 object-cover mb-1 border border-neutral-200"
                        />
                        <span className="text-[10px] font-semibold text-neutral-800 line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FINISH & INSTRUCTIONS */}
            {activeTab === 'notes' && (
              <div className="bg-white p-6 border border-neutral-200 space-y-5 shadow-sm text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-black mb-1">
                    Preferred Print Technology
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      onClick={() => setPrintTechnique('dtf')}
                      className={`p-3 border cursor-pointer transition-all text-center ${
                        printTechnique === 'dtf'
                          ? 'border-black bg-neutral-50 ring-1 ring-black font-bold'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <Printer className="w-4 h-4 mx-auto mb-1 text-black" />
                      <span className="block text-[11px] uppercase">DTF Vibrant</span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">Full Color</span>
                    </div>

                    <div
                      onClick={() => setPrintTechnique('screen')}
                      className={`p-3 border cursor-pointer transition-all text-center ${
                        printTechnique === 'screen'
                          ? 'border-black bg-neutral-50 ring-1 ring-black font-bold'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <Layers className="w-4 h-4 mx-auto mb-1 text-black" />
                      <span className="block text-[11px] uppercase">Screen Print</span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">Classic Feel</span>
                    </div>

                    <div
                      onClick={() => setPrintTechnique('embroidery')}
                      className={`p-3 border cursor-pointer transition-all text-center ${
                        printTechnique === 'embroidery'
                          ? 'border-black bg-neutral-50 ring-1 ring-black font-bold'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 mx-auto mb-1 text-black" />
                      <span className="block text-[11px] uppercase">Embroidery</span>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">Stitched</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-black mb-1">
                    Special Tailoring or Placement Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Please place the logo 2 inches below the neck collar on the left chest..."
                    className="w-full p-2.5 border border-neutral-300 focus:border-black outline-none resize-none"
                  />
                </div>

                <div className="bg-neutral-50 p-3.5 border border-neutral-200 space-y-1.5 text-[11px] text-neutral-600">
                  <div className="flex justify-between">
                    <span>Base Garment ({selectedGarment.gsm}):</span>
                    <span className="font-mono font-bold text-black">
                      {settings.currency_symbol}
                      {selectedGarment.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Front Custom Print Fee:</span>
                    <span className="font-mono font-bold text-black">
                      +{settings.currency_symbol}
                      {printFee}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-black pt-1.5 border-t border-neutral-200">
                    <span>Total per Item:</span>
                    <span className="font-mono">
                      {settings.currency_symbol}
                      {totalPrice}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full btn-primary py-3.5 uppercase tracking-widest font-bold flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add Customized Garment to Cart</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
