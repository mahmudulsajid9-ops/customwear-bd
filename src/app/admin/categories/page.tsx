'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { useStore } from '@/context/StoreContext';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setSeoTitle('');
    setSeoDescription('');
    setModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImageUrl(c.image_url);
    setSortOrder(c.sort_order);
    setIsActive(c.is_active);
    setSeoTitle(c.seo_title || '');
    setSeoDescription(c.seo_description || '');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/ +/g, '-'),
      description,
      image_url: imageUrl,
      sort_order: Number(sortOrder),
      is_active: isActive,
      seo_title: seoTitle || `${name} | CustomWear BD`,
      seo_description: seoDescription || `Shop ${name} in Bangladesh.`,
    };

    if (editingCategory) {
      updateCategory(editingCategory.id, payload);
    } else {
      addCategory(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Product Categories
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Organize catalog collections, banner visuals, and SEO metadata.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Order</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-sans">
            {categories
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-400">
                    #{c.sort_order}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="w-10 h-10 object-cover border border-neutral-200 flex-shrink-0"
                      />
                      <span className="font-bold text-neutral-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-600">/{c.slug}</td>
                  <td className="py-3 px-4 text-neutral-500 max-w-xs truncate">
                    {c.description || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => updateCategory(c.id, { is_active: !c.is_active })}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        c.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {c.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(c)}
                        className="p-1.5 border border-neutral-300 hover:border-black"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Delete category ${c.name}?`)) {
                            deleteCategory(c.id);
                          }
                        }}
                        className="p-1.5 border border-neutral-300 hover:border-red-600 text-neutral-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Category Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full border border-neutral-300 shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-sm font-black uppercase tracking-wider text-black">
                {editingCategory ? 'Edit Category' : 'Create Category'}
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
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Oversized T-Shirts"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="oversized-t-shirts"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                />
              </div>

              <ImageUploader
                label="Banner Image"
                value={imageUrl}
                onChange={setImageUrl}
                required
                helperText="Upload JPG/PNG/WEBP (max 5MB) or enter URL"
              />

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for category card..."
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-black"
                    />
                    <span>Active on Store</span>
                  </label>
                </div>
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
