'use client';

import React, { useState } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  helperText?: string;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  required = false,
  helperText,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      onChange(data.url);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase text-neutral-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helperText && <span className="text-[10px] text-neutral-400">{helperText}</span>}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload local file"
          className="flex-1 text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
        />

        <label className="btn-secondary text-xs px-3 py-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap bg-neutral-100 hover:bg-neutral-200 border-neutral-300">
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? 'Uploading...' : 'Browse File'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="text-[11px] text-red-600">{error}</p>}

      {value && (
        <div className="flex items-center gap-2 pt-1">
          <div className="relative w-12 h-12 bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If broken link, fall back gracefully
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="text-[11px] font-mono text-neutral-500 truncate max-w-xs">{value}</span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-neutral-400 hover:text-red-600 text-xs p-1"
            title="Clear Image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
