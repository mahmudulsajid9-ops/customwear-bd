'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Printer,
  FileText,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const defaultView = searchParams.get('view');

  const { orders, updateOrderStatus, updatePaymentStatus, settings } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(
    defaultView ? orders.find((o) => o.id === defaultView) || null : null
  );

  // Status and courier edit state inside drawer
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [courier, setCourier] = useState('RedX Chattogram Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Print modal state
  const [printDoc, setPrintDoc] = useState<'invoice' | 'packing_slip' | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesQuery =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.payment_method === paymentFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(o.created_at).getTime();
      const now = Date.now();
      if (dateFilter === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        matchesDate = orderDate >= startOfToday.getTime();
      } else if (dateFilter === '7days') {
        matchesDate = now - orderDate <= 7 * 24 * 3600 * 1000;
      } else if (dateFilter === '30days') {
        matchesDate = now - orderDate <= 30 * 24 * 3600 * 1000;
      }
    }

    return matchesQuery && matchesStatus && matchesPayment && matchesDate;
  });

  const openOrderDrawer = (o: Order) => {
    setSelectedOrder(o);
    setNewStatus(o.status);
    setNewPaymentStatus(o.payment_status);
    setCourier(o.courier || 'RedX Chattogram Express');
    setTrackingNumber(o.tracking_number || '');
    setAdminNotes(o.admin_notes || '');
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, newStatus, adminNotes, {
      courier,
      tracking_number: trackingNumber,
    });
    await updatePaymentStatus(selectedOrder.id, newPaymentStatus);

    setSelectedOrder({
      ...selectedOrder,
      status: newStatus,
      payment_status: newPaymentStatus,
      courier,
      tracking_number: trackingNumber,
      admin_notes: adminNotes,
    });
  };

  const exportOrdersCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'District',
      'Zone',
      'Status',
      'Payment Method',
      'Payment Status',
      'TrxID',
      'Subtotal',
      'Delivery Fee',
      'Discount',
      'Total (BDT)',
      'Courier',
      'Tracking Number',
      'Items Count',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_number}"`,
      `"${new Date(o.created_at).toLocaleDateString('en-GB')}"`,
      `"${o.full_name.replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${o.email || ''}"`,
      `"${o.address_line.replace(/"/g, '""')}"`,
      `"${o.city}"`,
      `"${o.district}"`,
      `"${o.zone}"`,
      `"${o.status}"`,
      `"${o.payment_method.toUpperCase()}"`,
      `"${o.payment_status}"`,
      `"${o.transaction_id || ''}"`,
      o.subtotal,
      o.shipping_fee,
      o.discount_amount || 0,
      o.total,
      `"${o.courier || ''}"`,
      `"${o.tracking_number || ''}"`,
      o.items.length,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `CustomWearBD_Orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickVerifyPayment = async () => {
    if (!selectedOrder) return;
    await updatePaymentStatus(selectedOrder.id, 'paid');
    setSelectedOrder({
      ...selectedOrder,
      payment_status: 'paid',
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Orders & Payment Verification
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Fulfill shipments, verify bKash/Nagad/Rocket TrxIDs, print A4 invoices, and manage packing slips.
          </p>
        </div>

        <button
          type="button"
          onClick={exportOrdersCSV}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 border-neutral-300 hover:border-black font-semibold uppercase tracking-wider"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Orders ({filteredOrders.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 border border-neutral-200 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by Order #, phone, customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none font-mono"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-neutral-300 bg-white py-1.5 px-2 text-xs outline-none"
            >
              <option value="all">All ({orders.length})</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Method:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-neutral-300 bg-white py-1.5 px-2 text-xs outline-none"
            >
              <option value="all">All Payment Methods</option>
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="border border-neutral-300 bg-white py-1.5 px-2 text-xs outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Region</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-400">
                    No orders match your search filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-black">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-3 text-neutral-500 font-mono text-[11px]">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-neutral-900">{order.full_name}</p>
                      <p className="text-[11px] text-neutral-400 font-mono">{order.phone}</p>
                    </td>
                    <td className="py-3 px-3 text-neutral-600">
                      {order.city} ({order.zone === 'inside_chattogram' ? 'CTG' : 'All BD'})
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono uppercase font-bold text-[11px]">
                        {order.payment_method}
                      </span>
                      <span
                        className={`block text-[10px] font-semibold ${
                          order.payment_status === 'paid'
                            ? 'text-green-700'
                            : order.payment_status === 'pending_verification'
                            ? 'text-amber-600 font-bold'
                            : 'text-neutral-500'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-black">
                      {settings.currency_symbol}
                      {order.total}
                    </td>
                    <td className="py-3 px-3">
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
                            : order.status === 'returned'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openOrderDrawer(order)}
                        className="px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Side Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col p-6 overflow-y-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Order Inspection
                  </span>
                  <h2 className="text-lg font-black font-mono text-black">
                    {selectedOrder.order_number}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPrintDoc('invoice')}
                    className="p-1.5 border border-neutral-300 hover:border-black text-xs font-semibold flex items-center gap-1"
                    title="Print Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintDoc('packing_slip')}
                    className="p-1.5 border border-neutral-300 hover:border-black text-xs font-semibold flex items-center gap-1"
                    title="Print Packing Slip"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Packing Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="p-1.5 text-neutral-400 hover:text-black ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-black block">
                  Update Fulfillment & Payment
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold">Order Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full p-2 border border-neutral-300 bg-white font-semibold"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing (Workshop Printing)</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled (Restores Stock)</option>
                      <option value="returned">Returned (Restores Stock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold">Payment Status</label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full p-2 border border-neutral-300 bg-white font-semibold"
                    >
                      <option value="unpaid">Unpaid (Cash on Delivery)</option>
                      <option value="pending_verification">Pending Verification</option>
                      <option value="paid">Paid & Verified</option>
                      <option value="rejected">Rejected / Invalid TrxID</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold">Courier Partner</label>
                    <input
                      type="text"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      placeholder="RedX / Steadfast / Pathao"
                      className="w-full p-2 border border-neutral-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1 font-semibold">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. REDX-CTG-7890"
                      className="w-full p-2 border border-neutral-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-600 mb-1 font-semibold">
                    Internal Admin Notes
                  </label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Staff notes for special delivery instructions or verification check..."
                    className="w-full p-2 border border-neutral-300 bg-white resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateOrder}
                  className="w-full btn-primary py-2 text-xs mt-1"
                >
                  Save Status & Notes
                </button>
              </div>

              {/* bKash / Nagad / Rocket Transaction Verification box */}
              {(selectedOrder.transaction_id || selectedOrder.sender_phone) && (
                <div className="p-4 bg-pink-50 border border-pink-300 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-900 uppercase tracking-wider block">
                      Manual {selectedOrder.payment_method.toUpperCase()} Verification
                    </span>
                    {selectedOrder.payment_status === 'pending_verification' && (
                      <button
                        type="button"
                        onClick={handleQuickVerifyPayment}
                        className="px-2.5 py-1 bg-green-700 text-white font-bold text-[10px] uppercase tracking-wider hover:bg-green-800"
                      >
                        Approve & Mark Paid
                      </button>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Transaction ID (TrxID):</span>
                    <span className="font-mono font-bold text-black text-sm">
                      {selectedOrder.transaction_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Sender Mobile:</span>
                    <span className="font-mono font-bold text-black">
                      {selectedOrder.sender_phone}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className="font-bold uppercase text-[11px] text-pink-800">
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              )}

              {/* Destination Address */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-black block">
                  Delivery Destination
                </span>
                <div className="p-3 bg-neutral-50 border border-neutral-200 space-y-1">
                  <p className="font-bold text-neutral-900">{selectedOrder.full_name}</p>
                  <p className="text-neutral-600">{selectedOrder.address_line}</p>
                  <p className="text-neutral-600">
                    {selectedOrder.city}, {selectedOrder.district} ({selectedOrder.zone})
                  </p>
                  <p className="font-mono text-neutral-700 mt-1">Phone: {selectedOrder.phone}</p>
                  {selectedOrder.email && (
                    <p className="text-neutral-500 font-mono text-[11px]">Email: {selectedOrder.email}</p>
                  )}
                  {selectedOrder.delivery_instructions && (
                    <p className="text-neutral-500 italic mt-1">
                      Note: &quot;{selectedOrder.delivery_instructions}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider text-black block">
                  Ordered Items ({selectedOrder.items.length})
                </span>
                <div className="divide-y divide-neutral-200 border border-neutral-200 p-3 bg-white">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-10 h-12 object-cover border border-neutral-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-neutral-900">{item.product_name}</p>
                          <span className="text-[11px] text-neutral-500 font-mono">
                            Size: {item.selected_size} | Color: {item.selected_color} | Qty:{' '}
                            {item.quantity} | SKU: {item.sku || 'N/A'}
                          </span>
                          {item.custom_instruction && (
                            <p className="text-[10px] text-neutral-600 italic">
                              Custom: &quot;{item.custom_instruction}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-black">
                        {settings.currency_symbol}
                        {item.total_price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status History Timeline */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div className="space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    Status Change History Log
                  </span>
                  <div className="divide-y divide-neutral-200 border border-neutral-200 p-3 bg-neutral-50 space-y-2">
                    {selectedOrder.history.map((h, i) => (
                      <div key={h.id || i} className="pt-2 text-[11px] flex justify-between">
                        <div>
                          <span className="font-bold uppercase text-black">{h.new_status}</span>
                          {h.note && <span className="text-neutral-600 block">{h.note}</span>}
                        </div>
                        <div className="text-right text-neutral-400 font-mono">
                          <span>{new Date(h.created_at).toLocaleString()}</span>
                          {h.changed_by && <span className="block">{h.changed_by}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printable Invoice & Packing Slip Modal */}
      {printDoc && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider">
                {printDoc === 'invoice' ? 'Tax Invoice' : 'Warehouse Packing Slip'} Preview
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPrintDoc(null)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="space-y-6 text-xs text-black">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-black">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight">CustomWear BD</h1>
                  <p className="text-[10px] text-neutral-600 tracking-wider uppercase">
                    AK Khan, Chattogram, Bangladesh • Helpline: {settings.site_phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold uppercase font-mono">
                    {printDoc === 'invoice' ? 'OFFICIAL INVOICE' : 'PACKING SLIP'}
                  </span>
                  <p className="font-mono font-bold">{selectedOrder.order_number}</p>
                  <p className="text-[10px] text-neutral-500 font-mono">
                    Date: {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-200">
                <div>
                  <span className="font-bold uppercase text-[10px] text-neutral-500 block mb-1">
                    Ship To:
                  </span>
                  <p className="font-bold text-sm">{selectedOrder.full_name}</p>
                  <p>{selectedOrder.address_line}</p>
                  <p>
                    {selectedOrder.city}, {selectedOrder.district}
                  </p>
                  <p className="font-mono mt-1">Phone: {selectedOrder.phone}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold uppercase text-[10px] text-neutral-500 block mb-1">
                    Fulfillment Info:
                  </span>
                  <p>
                    Method: <strong className="uppercase">{selectedOrder.payment_method}</strong>
                  </p>
                  <p>Status: {selectedOrder.payment_status}</p>
                  {selectedOrder.courier && <p>Courier: {selectedOrder.courier}</p>}
                  {selectedOrder.tracking_number && (
                    <p className="font-mono">Tracking: {selectedOrder.tracking_number}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-neutral-200">
                <thead className="bg-neutral-100 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border border-neutral-200">Item Description</th>
                    <th className="p-2 border border-neutral-200">SKU</th>
                    <th className="p-2 border border-neutral-200 text-center">Qty</th>
                    {printDoc === 'invoice' && (
                      <>
                        <th className="p-2 border border-neutral-200 text-right">Unit Price</th>
                        <th className="p-2 border border-neutral-200 text-right">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2 border border-neutral-200">
                        <span className="font-semibold">{item.product_name}</span>
                        <span className="block text-[10px] text-neutral-500">
                          Size: {item.selected_size} | Color: {item.selected_color}
                        </span>
                        {item.custom_instruction && (
                          <span className="block text-[10px] text-neutral-700 italic">
                            Print: {item.custom_instruction}
                          </span>
                        )}
                      </td>
                      <td className="p-2 border border-neutral-200 font-mono text-[10px]">
                        {item.sku || 'N/A'}
                      </td>
                      <td className="p-2 border border-neutral-200 text-center font-bold font-mono">
                        {item.quantity}
                      </td>
                      {printDoc === 'invoice' && (
                        <>
                          <td className="p-2 border border-neutral-200 text-right font-mono">
                            ৳{item.unit_price}
                          </td>
                          <td className="p-2 border border-neutral-200 text-right font-mono font-bold">
                            ৳{item.total_price}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals for Invoice */}
              {printDoc === 'invoice' && (
                <div className="flex justify-end pt-2">
                  <div className="w-48 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal:</span>
                      <span>৳{selectedOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Delivery:</span>
                      <span>৳{selectedOrder.shipping_fee}</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm border-t border-black pt-1">
                      <span>Total:</span>
                      <span>৳{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-6 border-t border-neutral-200 text-center text-[10px] text-neutral-500">
                <p>CustomWear BD • Pahartali, Chattogram • Thank you for choosing local Bangladeshi apparel.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs">Loading orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
