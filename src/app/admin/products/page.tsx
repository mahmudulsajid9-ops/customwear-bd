'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sliders,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariation } from '@/types';

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const defaultAction = searchParams.get('action');

  const { products, categories, addProduct, updateProduct, deleteProduct, duplicateProduct, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(defaultAction === 'new');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [regularPrice, setRegularPrice] = useState(850);
  const [salePrice, setSalePrice] = useState<number | undefined>(650);
  const [stockQuantity, setStockQuantity] = useState(50);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isCustomizable, setIsCustomizable] = useState(true);

  // Variation builder state
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'all' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSlug('');
    setDescription('');
    setCategoryId(categories[0]?.id || '');
    setSku('CW-NEW-BASE');
    setRegularPrice(750);
    setSalePrice(550);
    setStockQuantity(40);
    setImageUrl('https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80');
    setIsFeatured(false);
    setIsBestSeller(false);
    setIsCustomizable(true);

    // Initial default variations
    setVariations([
      {
        id: `var-init-1`,
        product_id: '',
        sku: 'CW-NEW-BLK-M',
        regular_price: 750,
        sale_price: 550,
        stock_quantity: 20,
        stock_status: 'in_stock',
        image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        is_active: true,
        attributes: { Size: 'M', Color: 'Black' },
      },
      {
        id: `var-init-2`,
        product_id: '',
        sku: 'CW-NEW-BLK-L',
        regular_price: 750,
        sale_price: 550,
        stock_quantity: 20,
        stock_status: 'in_stock',
        image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        is_active: true,
        attributes: { Size: 'L', Color: 'Black' },
      },
    ]);

    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setCategoryId(p.category_id);
    setSku(p.sku || '');
    setRegularPrice(p.regular_price);
    setSalePrice(p.sale_price);
    setStockQuantity(p.stock_quantity);
    setImageUrl(p.images[0]?.image_url || '');
    setIsFeatured(p.is_featured);
    setIsBestSeller(p.is_best_seller);
    setIsCustomizable(Boolean(p.is_customizable));
    setVariations(p.variations || []);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingProduct) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-')
      );
    }
  };

  // Add variation row
  const addVariationRow = () => {
    const newVar: ProductVariation = {
      id: `var-${Date.now()}`,
      product_id: editingProduct?.id || '',
      sku: `${sku || 'CW-PROD'}-VAR-${variations.length + 1}`,
      regular_price: regularPrice,
      sale_price: salePrice,
      stock_quantity: 15,
      stock_status: 'in_stock',
      image_url: imageUrl,
      is_active: true,
      attributes: { Size: 'L', Color: 'Black' },
    };
    setVariations([...variations, newVar]);
  };

  const updateVariationRow = (id: string, updates: Partial<ProductVariation>) => {
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const removeVariationRow = (id: string) => {
    setVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      name,
      slug: slug || name.toLowerCase().replace(/ +/g, '-'),
      short_description: description.slice(0, 120),
      description,
      category_id: categoryId,
      sku,
      regular_price: Number(regularPrice),
      sale_price: salePrice ? Number(salePrice) : undefined,
      stock_quantity: Number(stockQuantity),
      stock_status: Number(stockQuantity) > 0 ? ('in_stock' as const) : ('out_of_stock' as const),
      status: 'published' as const,
      is_featured: isFeatured,
      is_best_seller: isBestSeller,
      is_customizable: isCustomizable,
      tags: ['apparel', 'custom', 'chattogram'],
      available_sizes: Array.from(new Set(variations.map((v) => v.attributes.Size).filter(Boolean))),
      available_colors: Array.from(
        new Set(variations.map((v) => v.attributes.Color).filter(Boolean))
      ).map((c) => ({
        name: c,
        hex: c === 'White' ? '#FFFFFF' : c === 'Red' ? '#DC2626' : c === 'Blue' ? '#2563EB' : '#000000',
      })),
      images: [
        {
          id: 'img-1',
          image_url: imageUrl,
          alt_text: name,
          sort_order: 1,
          is_primary: true,
        },
      ],
      variations,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
    } else {
      addProduct(productPayload);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Products & Variations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your apparel catalog, individual SKU pricing, and attribute variations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-neutral-300 bg-white py-1.5 px-3 text-xs outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-3">Base SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Variations</th>
                <th className="py-3 px-3">Stock</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const category = categories.find((c) => c.id === p.category_id);
                return (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]?.image_url}
                          alt={p.name}
                          className="w-10 h-12 object-cover border border-neutral-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-neutral-900">{p.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-600 font-bold">
                      {p.sku || 'N/A'}
                    </td>
                    <td className="py-3 px-3 text-neutral-600">
                      {category?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-black">
                      {settings.currency_symbol}
                      {p.sale_price ?? p.regular_price}
                      {p.sale_price && (
                        <span className="text-[10px] text-neutral-400 line-through block">
                          {settings.currency_symbol}{p.regular_price}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 text-[10px] font-bold">
                        {p.variations.length} Combos
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[11px] font-bold ${
                          p.stock_quantity <= 5 ? 'text-amber-600' : 'text-neutral-700'
                        }`}
                      >
                        {p.stock_quantity} in stock
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateProduct(p.id, {
                            status: p.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase cursor-pointer transition-colors ${
                          p.status === 'published'
                            ? 'bg-green-100 text-green-800 hover:bg-amber-100 hover:text-amber-800'
                            : 'bg-neutral-200 text-neutral-800 hover:bg-green-100 hover:text-green-800'
                        }`}
                        title="Click to toggle Published / Draft"
                      >
                        {p.status}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => duplicateProduct(p.id)}
                          className="p-1.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black"
                          title="Duplicate Product"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          className="p-1.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black"
                          title="Edit Product & Variations"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 border border-neutral-300 hover:border-red-600 text-neutral-400 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product & Variations Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-300 shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <h2 className="text-base font-black uppercase tracking-wider text-black">
                {editingProduct ? 'Edit Product & Variations' : 'Create New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Heavyweight 240 GSM Oversized T-Shirt"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="heavyweight-oversized-tee"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Base SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="CW-OVS-BASE"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Base Regular Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Base Sale Price (৳)
                  </label>
                  <input
                    type="number"
                    value={salePrice || ''}
                    onChange={(e) => setSalePrice(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Leave blank if no discount"
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <ImageUploader
                    label="Primary Product Image"
                    value={imageUrl}
                    onChange={setImageUrl}
                    required
                    helperText="Upload JPG/PNG/WEBP (max 5MB) or enter URL"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed craftsmanship and fabric specifications..."
                    className="w-full text-xs px-3 py-2 border border-neutral-300 focus:border-black outline-none resize-none"
                  />
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 border-t border-neutral-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-black"
                  />
                  <span>Featured Collection</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="accent-black"
                  />
                  <span>Best Seller Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomizable}
                    onChange={(e) => setIsCustomizable(e.target.checked)}
                    className="accent-black"
                  />
                  <span>Enable Custom Design Upload for this item</span>
                </label>
              </div>

              {/* Product Variations Section — Master Requirement #7 */}
              <div className="pt-4 border-t border-neutral-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      Individual Variations (SKU, Price, Stock per Size/Color)
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Each combination has unique SKU, regular price, sale price, stock count, and active status.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariationRow}
                    className="btn-outline text-[11px] py-1.5 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Variation</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variations.map((v, idx) => (
                    <div
                      key={v.id || idx}
                      className="p-3 bg-neutral-50 border border-neutral-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-center text-xs"
                    >
                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Size</label>
                        <select
                          value={v.attributes.Size || 'M'}
                          onChange={(e) =>
                            updateVariationRow(v.id, {
                              attributes: { ...v.attributes, Size: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-neutral-300 p-1 text-xs"
                        >
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Color</label>
                        <select
                          value={v.attributes.Color || 'Black'}
                          onChange={(e) =>
                            updateVariationRow(v.id, {
                              attributes: { ...v.attributes, Color: e.target.value },
                            })
                          }
                          className="w-full bg-white border border-neutral-300 p-1 text-xs"
                        >
                          {['Black', 'White', 'Red', 'Blue', 'Green', 'Beige', 'Charcoal'].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Variation SKU</label>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => updateVariationRow(v.id, { sku: e.target.value })}
                          className="w-full bg-white border border-neutral-300 p-1 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Reg / Sale (৳)</label>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={v.regular_price}
                            onChange={(e) =>
                              updateVariationRow(v.id, { regular_price: Number(e.target.value) })
                            }
                            className="w-1/2 bg-white border border-neutral-300 p-1 font-mono text-xs"
                            placeholder="Reg"
                          />
                          <input
                            type="number"
                            value={v.sale_price || ''}
                            onChange={(e) =>
                              updateVariationRow(v.id, {
                                sale_price: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-1/2 bg-white border border-neutral-300 p-1 font-mono text-xs"
                            placeholder="Sale"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-neutral-500 block uppercase">Stock Units</label>
                        <input
                          type="number"
                          value={v.stock_quantity}
                          onChange={(e) =>
                            updateVariationRow(v.id, { stock_quantity: Number(e.target.value) })
                          }
                          className="w-full bg-white border border-neutral-300 p-1 font-mono text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3">
                        <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={v.is_active}
                            onChange={(e) =>
                              updateVariationRow(v.id, { is_active: e.target.checked })
                            }
                            className="accent-black"
                          />
                          <span>Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariationRow(v.id)}
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Product & Variations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs">Loading products console...</div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
