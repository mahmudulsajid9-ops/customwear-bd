'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Search,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Sliders,
  History,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariation } from '@/types';

interface FlatVariationRow {
  productId: string;
  productName: string;
  productImage: string;
  variationId?: string;
  sku: string;
  attributes: Record<string, string>;
  regularPrice: number;
  salePrice?: number;
  stockQuantity: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export default function AdminStockPage() {
  const { products, adjustStock, stockLogs, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');

  // Adjustment modal state
  const [adjustingItem, setAdjustingItem] = useState<FlatVariationRow | null>(null);
  const [newStockInput, setNewStockInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('New batch production - Chattogram workshop');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flatten products and variations into single actionable inventory table
  const allInventoryRows: FlatVariationRow[] = [];

  products.forEach((p) => {
    if (p.variations && p.variations.length > 0) {
      p.variations.forEach((v) => {
        const qty = v.stock_quantity;
        const status =
          qty <= 0 ? 'out_of_stock' : qty <= 5 ? 'low_stock' : 'in_stock';

        allInventoryRows.push({
          productId: p.id,
          productName: p.name,
          productImage: v.image_url || p.images[0]?.image_url || '',
          variationId: v.id,
          sku: v.sku,
          attributes: v.attributes,
          regularPrice: v.regular_price,
          salePrice: v.sale_price,
          stockQuantity: qty,
          stockStatus: status,
        });
      });
    } else {
      const qty = p.stock_quantity;
      const status =
        qty <= 0 ? 'out_of_stock' : qty <= 5 ? 'low_stock' : 'in_stock';

      allInventoryRows.push({
        productId: p.id,
        productName: p.name,
        productImage: p.images[0]?.image_url || '',
        sku: p.sku || 'BASE-PROD',
        attributes: { Spec: 'Base Product' },
        regularPrice: p.regular_price,
        salePrice: p.sale_price,
        stockQuantity: qty,
        stockStatus: status,
      });
    }
  });

  const filteredRows = allInventoryRows.filter((row) => {
    const matchesSearch =
      row.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Object.values(row.attributes).some((v) =>
        v.toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (statusFilter === 'out_of_stock') return matchesSearch && row.stockQuantity <= 0;
    if (statusFilter === 'low_stock')
      return matchesSearch && row.stockQuantity > 0 && row.stockQuantity <= 5;
    if (statusFilter === 'in_stock') return matchesSearch && row.stockQuantity > 5;
    return matchesSearch;
  });

  const totalUnits = allInventoryRows.reduce((sum, r) => sum + r.stockQuantity, 0);
  const lowStockCount = allInventoryRows.filter((r) => r.stockStatus === 'low_stock').length;
  const outOfStockCount = allInventoryRows.filter((r) => r.stockStatus === 'out_of_stock').length;

  const openAdjustModal = (row: FlatVariationRow) => {
    setAdjustingItem(row);
    setNewStockInput(row.stockQuantity);
    setAdjustReason('Physical inventory audit count');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    setIsSubmitting(true);
    await adjustStock(
      adjustingItem.productId,
      adjustingItem.variationId,
      Math.max(0, Number(newStockInput)),
      adjustReason
    );
    setIsSubmitting(false);
    setAdjustingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Stock & Inventory Control
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track real-time inventory for every size & color variation. Automatic order deductions and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'inventory'
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
            }`}
          >
            Variation Inventory ({allInventoryRows.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'logs'
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
            }`}
          >
            Adjustment History Logs
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 border border-neutral-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Total Inventory On Hand
          </span>
          <div className="text-2xl font-black text-black font-sans">
            {totalUnits.toLocaleString()} units
          </div>
          <p className="text-[10px] text-neutral-400">Across {allInventoryRows.length} active variations</p>
        </div>

        <div className="bg-white p-5 border border-neutral-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Low-Stock Variations (≤ 5 units)
          </span>
          <div className="text-2xl font-black text-amber-600 font-sans">{lowStockCount}</div>
          <p className="text-[10px] text-neutral-400">Requires production or reordering</p>
        </div>

        <div className="bg-white p-5 border border-neutral-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
            <Archive className="w-3.5 h-3.5" />
            Out-of-Stock Variations (0 units)
          </span>
          <div className="text-2xl font-black text-red-600 font-sans">{outOfStockCount}</div>
          <p className="text-[10px] text-neutral-400">Disabled from customer purchase</p>
        </div>
      </div>

      {activeTab === 'inventory' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 border border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search variation by SKU, color, size, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none font-mono"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Stock Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-neutral-300 bg-white py-1.5 px-3 text-xs outline-none"
              >
                <option value="all">All Variations ({allInventoryRows.length})</option>
                <option value="low_stock">Low Stock (≤ 5)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
                <option value="in_stock">Healthy Stock (&gt; 5)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Item & Variation</th>
                    <th className="py-3 px-3">SKU</th>
                    <th className="py-3 px-3">Attributes</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Current Stock</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {filteredRows.map((row, idx) => (
                    <tr key={`${row.productId}-${row.variationId || idx}`} className="hover:bg-neutral-50">
                      <td className="py-3 px-4 flex items-center gap-3">
                        {row.productImage && (
                          <img
                            src={row.productImage}
                            alt={row.productName}
                            className="w-10 h-12 object-cover border border-neutral-200 flex-shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-neutral-900">{row.productName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-neutral-700">
                        {row.sku}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(row.attributes).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 text-[10px]"
                            >
                              {k}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className="font-bold text-black">
                          {settings.currency_symbol}
                          {row.salePrice ?? row.regularPrice}
                        </span>
                        {row.salePrice && (
                          <span className="text-neutral-400 line-through ml-1 text-[11px]">
                            {settings.currency_symbol}
                            {row.regularPrice}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-sm text-black">
                        {row.stockQuantity}
                      </td>
                      <td className="py-3 px-3">
                        {row.stockStatus === 'out_of_stock' ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                            Out of Stock
                          </span>
                        ) : row.stockStatus === 'low_stock' ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                            Low Stock ({row.stockQuantity})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openAdjustModal(row)}
                          className="px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Logs Tab */
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
                <History className="w-4 h-4" />
                Inventory Adjustment & Restock Logs
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Full audit trail of manual adjustments, order sales deductions, and cancellation restocks
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Product / SKU</th>
                  <th className="py-2.5 px-3">Quantity Delta</th>
                  <th className="py-2.5 px-3">Before → After</th>
                  <th className="py-2.5 px-3">Reason / Reference</th>
                  <th className="py-2.5 px-3">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {stockLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-400">
                      No stock adjustment logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono text-neutral-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-black">{log.product_name}</p>
                        <span className="font-mono text-[10px] text-neutral-400">
                          {log.variation_sku || 'Base SKU'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={log.quantity_change > 0 ? 'text-green-700' : 'text-red-600'}
                        >
                          {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-neutral-600">
                        {log.quantity_before} → <strong>{log.quantity_after}</strong>
                      </td>
                      <td className="py-2.5 px-3 text-neutral-700">{log.reason}</td>
                      <td className="py-2.5 px-3 font-medium text-neutral-800">{log.created_by}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAdjustingItem(null)} />

          <div className="relative bg-white w-full max-w-md border border-neutral-200 shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                Adjust Variation Inventory
              </h2>
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="p-1 text-neutral-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 text-xs space-y-1">
              <p className="font-bold text-black">{adjustingItem.productName}</p>
              <p className="font-mono text-neutral-600">SKU: {adjustingItem.sku}</p>
              <div className="text-neutral-500">
                Attributes:{' '}
                {Object.entries(adjustingItem.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' | ')}
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  New Available Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockInput}
                  onChange={(e) => setNewStockInput(Number(e.target.value))}
                  className="w-full p-2.5 border border-neutral-300 font-mono font-bold text-sm focus:border-black outline-none"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Current stock is {adjustingItem.stockQuantity} units. Delta will be{' '}
                  <strong className={newStockInput - adjustingItem.stockQuantity >= 0 ? 'text-green-700' : 'text-red-600'}>
                    {newStockInput - adjustingItem.stockQuantity >= 0 ? '+' : ''}
                    {newStockInput - adjustingItem.stockQuantity}
                  </strong>
                </span>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Adjustment Reason *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2 border border-neutral-300 bg-white mb-2"
                >
                  <option value="New batch production - Chattogram workshop">
                    New batch production - Chattogram workshop
                  </option>
                  <option value="Physical inventory audit count reconciliation">
                    Physical inventory audit count reconciliation
                  </option>
                  <option value="Damaged fabric / defect discarded">
                    Damaged fabric / defect discarded
                  </option>
                  <option value="Local studio walk-in retail purchase">
                    Local studio walk-in retail purchase
                  </option>
                  <option value="Supplier return / restocking">
                    Supplier return / restocking
                  </option>
                </select>
                <input
                  type="text"
                  placeholder="Or custom detailed explanation..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2 border border-neutral-300 bg-neutral-50 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary py-2 text-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save & Record Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
