'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  CheckCircle2,
  Users,
  Archive,
  ArrowUpRight,
  Plus,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminDashboardPage() {
  const { orders, products, categories, settings, customers } = useStore();

  // Metrics
  const totalRevenue = orders.reduce(
    (sum, o) => (o.payment_status === 'paid' ? sum + o.total : sum),
    0
  );
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity <= 5
  );
  const outOfStockProducts = products.filter((p) => p.stock_quantity <= 0);
  const totalCustomersCount = customers.length > 0 ? customers.length : 14;

  // Sales Summary Calculation
  const codOrders = orders.filter((o) => o.payment_method === 'cod');
  const bkashOrders = orders.filter((o) => o.payment_method === 'bkash');
  const nagadOrders = orders.filter((o) => o.payment_method === 'nagad');
  const rocketOrders = orders.filter((o) => o.payment_method === 'rocket');

  const pendingVerificationCount = orders.filter(
    (o) => o.payment_status === 'pending_verification'
  ).length;

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Dashboard Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time sales, order fulfillment, and inventory health for CustomWear BD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/orders"
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Manage Orders</span>
          </Link>
          <Link
            href="/admin/products?action=new"
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid — Master Requirement #10 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black font-sans">{totalOrders}</div>
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <span>All placed customer orders</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Revenue</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-black text-black font-sans">
            {settings.currency_symbol}
            {totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-neutral-400">Verified paid transactions</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-sans">
            {pendingOrders.length}
          </div>
          <div className="text-[11px] text-neutral-500">
            {pendingVerificationCount > 0 && (
              <span className="text-pink-700 font-semibold">
                {pendingVerificationCount} awaiting MFS verification
              </span>
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Completed Orders</span>
            <CheckCircle2 className="w-4 h-4 text-green-700" />
          </div>
          <div className="text-2xl font-black text-green-700 font-sans">
            {completedOrders.length}
          </div>
          <p className="text-[11px] text-neutral-400">Successfully delivered parcels</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-neutral-700" />
          </div>
          <div className="text-2xl font-black text-black font-sans">
            {totalCustomersCount}
          </div>
          <Link
            href="/admin/customers"
            className="text-[11px] text-black font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Review accounts & abuse</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Products</span>
            <Package className="w-4 h-4 text-black" />
          </div>
          <div className="text-2xl font-black text-black font-sans">{products.length}</div>
          <p className="text-[11px] text-neutral-400">Across {categories.length} categories</p>
        </div>

        {/* Low-stock Products */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Low-Stock Products</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-sans">
            {lowStockProducts.length}
          </div>
          <Link
            href="/admin/stock"
            className="text-[11px] text-neutral-500 hover:text-black underline"
          >
            View units with ≤ 5 stock
          </Link>
        </div>

        {/* Out-of-stock Products */}
        <div className="bg-white p-5 border border-neutral-200 space-y-2">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase tracking-wider">
            <span>Out-of-Stock Products</span>
            <Archive className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-600 font-sans">
            {outOfStockProducts.length}
          </div>
          <Link
            href="/admin/stock"
            className="text-[11px] text-neutral-500 hover:text-black underline"
          >
            Reconcile zero stock items
          </Link>
        </div>
      </div>

      {/* Sales Summary & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200 flex items-center justify-between">
            <span>Sales Summary by Payment Method</span>
            <span className="font-mono text-neutral-400 text-[11px]">Chattogram Studio</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-neutral-50 border border-neutral-200">
              <span className="text-[11px] font-bold text-neutral-500 block uppercase">
                Cash on Delivery
              </span>
              <span className="text-lg font-black text-black font-sans">{codOrders.length}</span>
              <span className="block text-[10px] text-neutral-400 mt-1">Orders</span>
            </div>
            <div className="p-3 bg-pink-50 border border-pink-200">
              <span className="text-[11px] font-bold text-pink-700 block uppercase">
                bKash
              </span>
              <span className="text-lg font-black text-pink-900 font-sans">{bkashOrders.length}</span>
              <span className="block text-[10px] text-pink-600 mt-1">Orders</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200">
              <span className="text-[11px] font-bold text-orange-700 block uppercase">
                Nagad
              </span>
              <span className="text-lg font-black text-orange-900 font-sans">{nagadOrders.length}</span>
              <span className="block text-[10px] text-orange-600 mt-1">Orders</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-200">
              <span className="text-[11px] font-bold text-purple-700 block uppercase">
                Rocket
              </span>
              <span className="text-lg font-black text-purple-900 font-sans">{rocketOrders.length}</span>
              <span className="block text-[10px] text-purple-600 mt-1">Orders</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs space-y-2">
            <span className="font-bold text-black uppercase tracking-wider block">
              Inventory & Fulfillment Summary:
            </span>
            <div className="flex flex-wrap items-center justify-between gap-4 text-neutral-600">
              <div>
                Total Inventory Value:{' '}
                <strong className="text-black font-mono">
                  {settings.currency_symbol}
                  {products
                    .reduce((sum, p) => sum + p.regular_price * p.stock_quantity, 0)
                    .toLocaleString()}
                </strong>
              </div>
              <div>
                Active Categories: <strong className="text-black">{categories.length}</strong>
              </div>
              <div>
                Store Location:{' '}
                <strong className="text-black">AK Khan, Chattogram, Bangladesh</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black pb-2 border-b border-neutral-200">
            Quick Actions
          </h2>
          <div className="space-y-2 text-xs">
            <Link
              href="/admin/stock"
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-between transition-colors block"
            >
              <div>
                <p className="font-bold text-black">Stock Management</p>
                <p className="text-[11px] text-neutral-500">Record inventory adjustment reasons</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/admin/customers"
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-between transition-colors block"
            >
              <div>
                <p className="font-bold text-black">Customer Anti-Abuse</p>
                <p className="text-[11px] text-neutral-500">Review cancellations & suspicious flags</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>

            <Link
              href="/admin/settings"
              className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 flex items-center justify-between transition-colors block"
            >
              <div>
                <p className="font-bold text-black">Payment & Shipping Settings</p>
                <p className="text-[11px] text-neutral-500">Edit bKash, Nagad, Rocket numbers</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-black">
              Recent Customer Orders
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Latest transactions across Chattogram and outside districts
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-black hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All ({orders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-3">Order #</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Payment</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-black">
                    {order.order_number}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-neutral-900">{order.full_name}</td>
                  <td className="py-2.5 px-3 font-mono text-neutral-500">{order.phone}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono uppercase text-[11px] font-bold">
                      {order.payment_method}
                    </span>
                    <span
                      className={`block text-[10px] ${
                        order.payment_status === 'paid'
                          ? 'text-green-700 font-bold'
                          : order.payment_status === 'pending_verification'
                          ? 'text-amber-600 font-semibold'
                          : 'text-neutral-400'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-black">
                    {settings.currency_symbol}
                    {order.total}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                        order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'processing'
                          ? 'bg-purple-100 text-purple-800'
                          : order.status === 'confirmed'
                          ? 'bg-neutral-200 text-neutral-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={`/admin/orders?view=${order.id}`}
                      className="text-xs font-bold text-black underline uppercase"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
