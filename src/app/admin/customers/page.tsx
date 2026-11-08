'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  AlertTriangle,
  X,
  History,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { UserProfile, Order } from '@/types';

export default function AdminCustomersPage() {
  const { customers, updateCustomerStatus, orders, auditLogs, user } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [activeTab, setActiveTab] = useState<'customers' | 'audit'>('customers');

  // Fallback demo customers if list is loading
  const displayCustomers =
    customers.length > 0
      ? customers
      : [
          {
            id: 'usr-cust-1',
            email: 'tanvir@gmail.com',
            full_name: 'Tanvir Hossain',
            phone: '01819876543',
            role: 'customer' as const,
            is_active: true,
            is_suspended: false,
            is_restricted: false,
            is_flagged_suspicious: false,
            total_orders: 4,
            cancelled_orders: 0,
            failed_deliveries: 0,
            created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
          {
            id: 'usr-cust-2',
            email: 'suspicious.buyer@mail.com',
            full_name: 'Rafiqul Islam',
            phone: '01799887766',
            role: 'customer' as const,
            is_active: true,
            is_suspended: false,
            is_restricted: false,
            is_flagged_suspicious: true,
            suspicious_reason: 'Repeated cancellation at doorstep (3 cancelled orders in 14 days)',
            total_orders: 5,
            cancelled_orders: 3,
            failed_deliveries: 2,
            created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
          },
          {
            id: 'usr-cust-3',
            email: 'sadia.r@yahoo.com',
            full_name: 'Sadia Rahman',
            phone: '01711223344',
            role: 'customer' as const,
            is_active: true,
            is_suspended: false,
            is_restricted: false,
            is_flagged_suspicious: false,
            total_orders: 2,
            cancelled_orders: 0,
            failed_deliveries: 0,
            created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
          },
        ];

  const filteredCustomers = displayCustomers.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (filterStatus === 'flagged') return matchesSearch && c.is_flagged_suspicious;
    if (filterStatus === 'suspended') return matchesSearch && c.is_suspended;
    if (filterStatus === 'restricted') return matchesSearch && c.is_restricted;
    if (filterStatus === 'active') return matchesSearch && !c.is_suspended && !c.is_restricted;
    return matchesSearch;
  });

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.user_id === selectedCustomer.id ||
          o.phone === selectedCustomer.phone ||
          o.email?.toLowerCase() === selectedCustomer.email.toLowerCase()
      )
    : [];

  const handleAction = async (
    type: 'suspend' | 'unsuspend' | 'restrict' | 'unrestrict' | 'flag' | 'unflag'
  ) => {
    if (!selectedCustomer) return;

    let updates = {};
    if (type === 'suspend') updates = { is_suspended: true, is_active: false };
    if (type === 'unsuspend') updates = { is_suspended: false, is_active: true };
    if (type === 'restrict') updates = { is_restricted: true };
    if (type === 'unrestrict') updates = { is_restricted: false };
    if (type === 'flag')
      updates = {
        is_flagged_suspicious: true,
        suspicious_reason: flagReason || 'Flagged for high cancellation rate or suspicious address',
      };
    if (type === 'unflag')
      updates = { is_flagged_suspicious: false, suspicious_reason: undefined };

    await updateCustomerStatus(selectedCustomer.id, updates);

    setSelectedCustomer({
      ...selectedCustomer,
      ...updates,
    });
    setFlagReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Customer Accounts & Abuse Review
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Audit customer order reliability, repeated cancellations, and prevent delivery abuse.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'customers'
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
            }`}
          >
            Registered Customers ({displayCustomers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'audit'
                ? 'bg-black text-white'
                : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
            }`}
          >
            Admin Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'customers' ? (
        <>
          {/* Policy Compliance Banner */}
          <div className="p-4 bg-neutral-50 border border-neutral-300 text-xs text-neutral-700 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-black uppercase tracking-wide block">
                Administrative Abuse Protection Guideline:
              </span>
              <p className="text-[11px] text-neutral-600 mt-0.5">
                Do not automatically ban customers based only on a shared address or phone number.
                Always inspect customer cancellation frequency, order history, and reason notes
                before suspending or restricting an account.
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 border border-neutral-200 flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, email, or Bangladeshi phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 focus:border-black outline-none font-mono"
              />
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-neutral-300 bg-white py-1.5 px-3 text-xs outline-none"
              >
                <option value="all">All Accounts ({displayCustomers.length})</option>
                <option value="active">Active & Reliable</option>
                <option value="flagged">Flagged for Review</option>
                <option value="restricted">Restricted (COD Blocked)</option>
                <option value="suspended">Suspended / Banned</option>
              </select>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Total Orders</th>
                    <th className="py-3 px-3">Cancellations</th>
                    <th className="py-3 px-3">Failed Deliveries</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-black">{c.full_name}</p>
                        <p className="text-[11px] text-neutral-400">{c.email}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-neutral-600">
                        {c.phone || 'No phone'}
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-black">
                        {c.total_orders || 0}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold ${
                            (c.cancelled_orders || 0) > 1 ? 'text-red-600' : 'text-neutral-700'
                          }`}
                        >
                          {c.cancelled_orders || 0}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono font-bold ${
                            (c.failed_deliveries || 0) > 0 ? 'text-amber-600' : 'text-neutral-700'
                          }`}
                        >
                          {c.failed_deliveries || 0}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {c.is_suspended ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-bold uppercase tracking-wider">
                            Suspended / Banned
                          </span>
                        ) : c.is_restricted ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                            Restricted
                          </span>
                        ) : c.is_flagged_suspicious ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Flagged for Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-3 py-1 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800"
                        >
                          Review Profile
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
        /* Audit Logs Tab */
        <div className="bg-white border border-neutral-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-2">
              <History className="w-4 h-4" />
              Administrative Audit Log
            </h2>
            <span className="text-[11px] text-neutral-400">
              Tamper-evident record of admin interventions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-neutral-500 uppercase font-semibold border-b border-neutral-200">
                <tr>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Administrator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      No administrative audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 px-3 font-mono text-neutral-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-black">{log.admin_name}</td>
                      <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-neutral-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-neutral-500">
                        {log.resource_type}: {log.resource_id}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-600">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Review Side Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedCustomer(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col p-6 overflow-y-auto space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Customer Profile & History
                  </span>
                  <h2 className="text-lg font-black uppercase text-black">
                    {selectedCustomer.full_name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Suspicious Warning if flagged */}
              {selectedCustomer.is_flagged_suspicious && (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Suspicious Ordering Pattern Detected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedCustomer.suspicious_reason ||
                      'Customer has repeated doorstep delivery refusals or repeated cancellations.'}
                  </p>
                </div>
              )}

              {/* Reliability Stats */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 text-[10px] uppercase block font-semibold">
                    Total Placed
                  </span>
                  <span className="text-lg font-black text-black font-mono">
                    {selectedCustomer.total_orders || 0}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 text-[10px] uppercase block font-semibold">
                    Cancellations
                  </span>
                  <span className="text-lg font-black text-red-600 font-mono">
                    {selectedCustomer.cancelled_orders || 0}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 text-[10px] uppercase block font-semibold">
                    Failed Deliveries
                  </span>
                  <span className="text-lg font-black text-amber-600 font-mono">
                    {selectedCustomer.failed_deliveries || 0}
                  </span>
                </div>
              </div>

              {/* Administrative Actions & Controls */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3 text-xs">
                <span className="font-bold uppercase tracking-wider text-black block">
                  Administrative Account Controls
                </span>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Audit reason (e.g. Verified customer confirmed fake COD order)"
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-neutral-300 outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCustomer.is_suspended ? (
                      <button
                        type="button"
                        onClick={() => handleAction('unsuspend')}
                        className="py-2 bg-green-700 text-white font-bold uppercase tracking-wider text-[11px] hover:bg-green-800"
                      >
                        Reinstate Account
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction('suspend')}
                        className="py-2 bg-red-600 text-white font-bold uppercase tracking-wider text-[11px] hover:bg-red-700"
                      >
                        Suspend / Block Account
                      </button>
                    )}

                    {selectedCustomer.is_restricted ? (
                      <button
                        type="button"
                        onClick={() => handleAction('unrestrict')}
                        className="py-2 bg-neutral-800 text-white font-bold uppercase tracking-wider text-[11px]"
                      >
                        Lift Restrictions
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction('restrict')}
                        className="py-2 bg-neutral-200 text-neutral-800 font-bold uppercase tracking-wider text-[11px] hover:bg-neutral-300"
                      >
                        Restrict (Block COD)
                      </button>
                    )}

                    {selectedCustomer.is_flagged_suspicious ? (
                      <button
                        type="button"
                        onClick={() => handleAction('unflag')}
                        className="col-span-2 py-1.5 border border-neutral-300 text-neutral-700 text-[11px] font-semibold hover:border-black"
                      >
                        Clear Suspicious Flag
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction('flag')}
                        className="col-span-2 py-1.5 bg-amber-500 text-black font-bold uppercase tracking-wider text-[11px] hover:bg-amber-600"
                      >
                        Flag for Manual Review
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black flex items-center justify-between">
                  <span>Customer Order History ({customerOrders.length})</span>
                </h3>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-neutral-400 p-4 border border-neutral-200 text-center">
                    No order history associated with this profile yet.
                  </p>
                ) : (
                  <div className="divide-y divide-neutral-200 border border-neutral-200">
                    {customerOrders.map((o) => (
                      <div key={o.id} className="p-3 text-xs flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-black">{o.order_number}</p>
                          <span className="text-[11px] text-neutral-400">
                            {new Date(o.created_at).toLocaleDateString()} • {o.items.length} items
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-black">
                            ৳{o.total}
                          </span>
                          <span
                            className={`block text-[10px] font-bold uppercase ${
                              o.status === 'delivered'
                                ? 'text-green-700'
                                : o.status === 'cancelled'
                                ? 'text-red-600'
                                : 'text-neutral-600'
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
