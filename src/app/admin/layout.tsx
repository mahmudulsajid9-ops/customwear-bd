'use client';

import React, { useState } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Image as ImageIcon,
  ShoppingBag,
  Sliders,
  Settings,
  ExternalLink,
  LogOut,
  Shield,
  Menu,
  X,
  Users,
  Boxes,
  Tag,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, loginAsAdmin, logout } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is not admin, show simple authorization challenge or quick demo login button
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 border border-neutral-300 shadow-xl text-center space-y-4">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
            Staff Portal
          </span>
          <h1 className="text-xl font-black uppercase tracking-tight text-black">
            Admin Access Required
          </h1>
          <p className="text-xs text-neutral-600">
            You must be logged in as an administrator to manage CustomWear BD inventory, slides, categories, and orders.
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={loginAsAdmin}
              className="w-full btn-primary text-xs py-3"
            >
              Sign In As Admin (Demo Access)
            </button>
            <NextLink
              href="/"
              className="w-full text-center text-xs text-neutral-500 hover:text-black py-2"
            >
              Return to Customer Storefront
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders & Payments', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products & Variations', href: '/admin/products', icon: Package },
    { label: 'Stock & Inventory', href: '/admin/stock', icon: Boxes },
    { label: 'Customers & Review', href: '/admin/customers', icon: Users },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { label: 'Hero Carousel', href: '/admin/banners', icon: ImageIcon },
    { label: 'Attributes & Sizes', href: '/admin/attributes', icon: Sliders },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row text-neutral-900 font-sans">
      {/* Mobile Admin Header */}
      <div className="lg:hidden bg-black text-white p-4 flex items-center justify-between border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-neutral-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-sm uppercase tracking-wider">CustomWear Admin</span>
        </div>
        <NextLink href="/" className="text-xs text-neutral-400 hover:text-white flex items-center gap-1">
          <span>Store</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </NextLink>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 w-64 bg-black text-white z-40 flex flex-col justify-between border-r border-neutral-800 transform lg:transform-none transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-neutral-800">
            <NextLink href="/admin" className="block">
              <span className="text-lg font-black tracking-tighter uppercase text-white font-sans">
                CUSTOMWEAR<span className="text-neutral-500 font-light">BD</span>
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  Admin Console
                </span>
              </div>
            </NextLink>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);

              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-neutral-800 text-white border-l-2 border-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-neutral-800 space-y-3">
          <NextLink
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-neutral-400 hover:text-white px-2 py-1 transition-colors"
          >
            <span>Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NextLink>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
