'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminAttributesPage() {
  const [sizes, setSizes] = useState<string[]>(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  const [newSize, setNewSize] = useState('');

  const [colors, setColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Beige', hex: '#D4B996' },
    { name: 'Charcoal', hex: '#333333' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');

  const addSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSize.trim() && !sizes.includes(newSize.trim().toUpperCase())) {
      setSizes([...sizes, newSize.trim().toUpperCase()]);
      setNewSize('');
    }
  };

  const removeSize = (sizeToRemove: string) => {
    setSizes(sizes.filter((s) => s !== sizeToRemove));
  };

  const addColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColorName.trim()) {
      setColors([...colors, { name: newColorName.trim(), hex: newColorHex }]);
      setNewColorName('');
    }
  };

  const removeColor = (colorName: string) => {
    setColors(colors.filter((c) => c.name !== colorName));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-black uppercase tracking-tight text-black">
          Attributes & Variation Options
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure universal sizing and apparel color palettes used to generate product variations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. Size Attribute Card */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              1. Size Attribute Values
            </h2>
            <span className="text-[11px] text-neutral-400 font-mono">
              {sizes.length} Options
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <div
                key={s}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 border border-neutral-300 text-xs font-bold font-mono"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSize(s)}
                  className="text-neutral-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addSize} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newSize}
              onChange={(e) => setNewSize(e.target.value)}
              placeholder="e.g. 3XL, 4XL, Kids-10"
              className="flex-1 text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
            />
            <button type="submit" className="btn-primary text-xs py-2 px-3">
              Add Size
            </button>
          </form>
        </div>

        {/* 2. Color Attribute Card */}
        <div className="bg-white p-6 border border-neutral-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              2. Color Palette & Swatches
            </h2>
            <span className="text-[11px] text-neutral-400 font-mono">
              {colors.length} Swatches
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {colors.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-2 bg-neutral-50 border border-neutral-200 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-4 h-4 rounded-full border border-neutral-300"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="font-semibold text-neutral-900">{c.name}</span>
                  <span className="font-mono text-[10px] text-neutral-400">{c.hex}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeColor(c.name)}
                  className="text-neutral-400 hover:text-red-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addColor} className="space-y-2 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="Color Name (e.g. Sage)"
                className="flex-1 text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none"
              />
              <div className="flex items-center border border-neutral-300 px-2 gap-1.5">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-6 h-6 border-none cursor-pointer p-0 bg-transparent"
                />
                <span className="text-[11px] font-mono text-neutral-500 uppercase">
                  {newColorHex}
                </span>
              </div>
            </div>
            <button type="submit" className="w-full btn-primary text-xs py-2">
              Add Color Swatch
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
