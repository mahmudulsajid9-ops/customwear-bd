'use client';

import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X, CheckCircle2, Clock, Percent, DollarSign } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Coupon } from '@/types';

export default function AdminCouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, settings } = useStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState<number | undefined>(500);
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinSpend(500);
    setMaxDiscount(undefined);
    setExpiryDate('');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discount_type);
    setDiscountValue(c.discount_value);
    setMinSpend(c.min_spend);
    setMaxDiscount(c.max_discount);
    setExpiryDate(c.expiry_date ? c.expiry_date.split('T')[0] : '');
    setIsActive(c.is_active);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_spend: minSpend ? Number(minSpend) : undefined,
      max_discount: maxDiscount ? Number(maxDiscount) : undefined,
      expiry_date: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      is_active: isActive,
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.id, payload);
    } else {
      await addCoupon(payload);
    }
    setModalOpen(false);
  };

  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usage_count || 0), 0);
  const activeCount = coupons.filter((c) => c.is_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure checkout promo codes, percentage discounts, fixed savings, and usage limits.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-neutral-200">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
            Total Coupons
          </span>
          <span className="text-2xl font-black font-mono text-black">{coupons.length}</span>
        </div>
        <div className="bg-white p-4 border border-neutral-200">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
            Active Campaigns
          </span>
          <span className="text-2xl font-black font-mono text-emerald-700">{activeCount}</span>
        </div>
        <div className="bg-white p-4 border border-neutral-200">
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
            Total Times Redeemed
          </span>
          <span className="text-2xl font-black font-mono text-black">{totalRedemptions}</span>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Spend</th>
                <th className="py-3 px-4">Max. Cap</th>
                <th className="py-3 px-4">Usage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No promo coupons created yet. Click &quot;Create Coupon&quot; to add your first campaign.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-mono font-bold text-black uppercase tracking-wider text-xs">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900">
                      {coupon.discount_type === 'percentage' ? (
                        <span className="inline-flex items-center gap-1">
                          <Percent className="w-3 h-3 text-neutral-400" />
                          {coupon.discount_value}% Off
                        </span>
                      ) : (
                        <span className="font-mono">
                          {settings.currency_symbol}
                          {coupon.discount_value} Flat Off
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {coupon.min_spend ? `${settings.currency_symbol}${coupon.min_spend}` : 'No minimum'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {coupon.max_discount ? `${settings.currency_symbol}${coupon.max_discount}` : 'Unlimited'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-neutral-800">
                        {coupon.usage_count || 0} times
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => updateCoupon(coupon.id, { is_active: !coupon.is_active })}
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 border ${
                          coupon.is_active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-300'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 border border-neutral-300 hover:border-black text-neutral-700 hover:text-black"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete coupon ${coupon.code}?`)) {
                              deleteCoupon(coupon.id);
                            }
                          }}
                          className="p-1.5 border border-neutral-300 hover:border-red-600 text-neutral-400 hover:text-red-600"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full border border-neutral-300 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h2 className="text-base font-black uppercase tracking-wider text-black">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Code'}
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
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER26"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Minimum Spend (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minSpend ?? ''}
                    onChange={(e) => setMinSpend(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-neutral-700 mb-1">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount ?? ''}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Optional cap"
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-neutral-700 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black outline-none bg-white font-mono"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="accent-black"
                  />
                  <span className="font-semibold text-neutral-800">Coupon is Active</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
