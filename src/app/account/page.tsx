'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Printer,
  Shield,
  LogOut,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import AuthModal from '@/components/auth/AuthModal';

export default function AccountPage() {
  const { user, orders, settings, logout } = useStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="py-20 bg-white min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8 border border-neutral-200 text-center space-y-5 bg-neutral-50">
          <div className="w-14 h-14 bg-black text-white flex items-center justify-center mx-auto">
            <User className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black">
              Customer Account
            </h1>
            <p className="text-xs text-neutral-500">
              Please sign in to view your order history, delivery tracking, and saved account details.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="btn-primary text-xs py-3 px-6"
            >
              Sign In / Register
            </button>
            <Link
              href="/track-order"
              className="btn-secondary text-xs py-3 px-4"
            >
              Track Guest Order
            </Link>
          </div>
        </div>
        {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
      </div>
    );
  }

  // Filter orders belonging to this user
  const userOrders = orders.filter((o) => {
    if (o.user_id && o.user_id === user.id) return true;
    if (user.email && o.email && o.email.toLowerCase() === user.email.toLowerCase()) return true;
    if (user.phone && o.phone && o.phone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) return true;
    return false;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'processing':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'confirmed':
        return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'cancelled':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'returned':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending_verification':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-neutral-50/50 min-h-screen">
      <div className="container-custom space-y-8">
        {/* Top Profile Header */}
        <div className="bg-white border border-neutral-200 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center text-xl font-black">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  {user.full_name}
                </h1>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-neutral-100 text-neutral-800 font-bold border border-neutral-300">
                  {user.role}
                </span>
                {user.is_suspended && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-red-100 text-red-800 font-bold">
                    Suspended
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3.5 h-3.5" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-neutral-100">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-300"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Warning Alert if account restricted */}
        {user.is_restricted && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Account Under Review</p>
              <p className="mt-0.5">
                Certain actions on your account are currently restricted. Please contact our support team in Chattogram at{' '}
                <strong className="font-mono">{settings.site_phone}</strong> or{' '}
                <strong>{settings.site_email}</strong> if you have questions.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({userOrders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-black text-black'
                : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="bg-white border border-neutral-200 p-12 text-center space-y-4">
                <Package className="w-12 h-12 text-neutral-300 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold uppercase tracking-wider text-black">
                    No Orders Placed Yet
                  </h3>
                  <p className="text-xs text-neutral-500">
                    You haven&apos;t placed any orders with this account yet.
                  </p>
                </div>
                <Link href="/shop" className="btn-primary text-xs py-2.5 px-6 inline-block">
                  Browse Apparel Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-neutral-200 overflow-hidden shadow-sm hover:border-neutral-400 transition-colors"
                  >
                    {/* Order Summary Bar */}
                    <div className="p-4 sm:p-5 bg-neutral-50 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                            Order Number
                          </span>
                          <span className="font-mono font-bold text-black text-sm">
                            {order.order_number}
                          </span>
                        </div>
                        <div className="border-l border-neutral-200 pl-4">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                            Order Date
                          </span>
                          <span className="text-neutral-700">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="border-l border-neutral-200 pl-4">
                          <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">
                            Total Amount
                          </span>
                          <span className="font-bold text-black">
                            {settings.currency_symbol}
                            {order.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border font-semibold ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${getPaymentBadge(
                            order.payment_status
                          )}`}
                        >
                          {order.payment_status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-4 sm:p-5 divide-y divide-neutral-100">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="w-12 h-12 object-cover border border-neutral-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 text-[10px] font-mono">
                                CW
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-black uppercase tracking-tight">
                                {item.product_name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-0.5">
                                <span>Size: {item.selected_size || 'M'}</span>
                                <span>•</span>
                                <span>Color: {item.selected_color || 'Standard'}</span>
                                <span>•</span>
                                <span>Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-black font-mono">
                              {settings.currency_symbol}
                              {item.total_price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Action Footer */}
                    <div className="p-4 bg-white border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="text-[11px] text-neutral-500">
                        <span>Payment Method: </span>
                        <strong className="text-neutral-900 uppercase font-mono">
                          {order.payment_method}
                        </strong>
                        {order.transaction_id && (
                          <span className="ml-2 font-mono text-neutral-400">
                            (TrxID: {order.transaction_id})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/track-order?order=${order.order_number}`}
                          className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          Track Package
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-2">
                Personal Information
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold">
                    Full Name
                  </span>
                  <p className="font-semibold text-neutral-900">{user.full_name}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold">
                    Email Address
                  </span>
                  <p className="font-mono text-neutral-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold">
                    Phone Number
                  </span>
                  <p className="font-mono text-neutral-900">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[10px] block font-semibold">
                    Member Since
                  </span>
                  <p className="text-neutral-700">
                    {new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-neutral-100 pb-2">
                Ordering & Security Status
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-neutral-50">
                  <span className="text-neutral-500">Total Orders Placed:</span>
                  <span className="font-bold font-mono text-black">{userOrders.length}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-50">
                  <span className="text-neutral-500">Cancellations Recorded:</span>
                  <span className="font-bold font-mono text-neutral-700">
                    {user.cancelled_orders || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-neutral-50">
                  <span className="text-neutral-500">Delivery Success Rate:</span>
                  <span className="font-bold font-mono text-emerald-700">
                    {user.failed_deliveries
                      ? `${Math.max(0, 100 - user.failed_deliveries * 20)}%`
                      : '100%'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-500">Account Standing:</span>
                  <span className="font-bold text-emerald-700 uppercase tracking-wide">
                    {user.is_suspended
                      ? 'Suspended'
                      : user.is_flagged_suspicious
                      ? 'Under Review'
                      : 'Good Standing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER RECEIPT MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-xl w-full p-6 sm:p-8 border border-neutral-300 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-black">
                    Receipt #{selectedOrder.order_number}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    CustomWear BD — AK Khan, Chattogram, Bangladesh
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-neutral-400 hover:text-black text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Customer
                  </span>
                  <p className="font-bold text-neutral-900">{selectedOrder.full_name}</p>
                  <p className="font-mono text-neutral-600">{selectedOrder.phone}</p>
                  <p className="text-neutral-600 mt-1">{selectedOrder.address_line}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                    Payment Status
                  </span>
                  <p className="font-mono font-bold uppercase text-neutral-900">
                    {selectedOrder.payment_method}
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Status: {selectedOrder.payment_status.replace('_', ' ')}
                  </p>
                  {selectedOrder.transaction_id && (
                    <p className="font-mono text-[11px] text-neutral-700 mt-1">
                      TrxID: {selectedOrder.transaction_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="border border-neutral-200 divide-y divide-neutral-100 text-xs">
                <div className="bg-neutral-100 p-2.5 font-bold uppercase tracking-wider text-[10px] grid grid-cols-12 text-neutral-600">
                  <div className="col-span-7">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>
                {selectedOrder.items.map((i, index) => (
                  <div key={index} className="p-2.5 grid grid-cols-12 items-center">
                    <div className="col-span-7">
                      <p className="font-bold text-black uppercase">{i.product_name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {i.selected_size} / {i.selected_color}
                      </p>
                    </div>
                    <div className="col-span-2 text-center font-mono">{i.quantity}</div>
                    <div className="col-span-3 text-right font-mono font-bold">
                      {settings.currency_symbol}
                      {i.total_price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total breakdown */}
              <div className="space-y-1.5 text-xs border-t border-neutral-200 pt-3">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    {settings.currency_symbol}
                    {selectedOrder.subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">
                    {settings.currency_symbol}
                    {selectedOrder.shipping_fee}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-black pt-2 border-t border-neutral-200">
                  <span>Total Amount:</span>
                  <span className="font-mono">
                    {settings.currency_symbol}
                    {selectedOrder.total}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary text-xs py-2 px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
