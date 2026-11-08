'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  Menu,
  X,
  User,
  Shield,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { FacebookIcon, InstagramIcon, YoutubeIcon, TikTokIcon } from '@/components/common/SocialIcons';
import { useStore } from '@/context/StoreContext';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const router = useRouter();
  const {
    settings,
    cartCount,
    setIsCartOpen,
    wishlist,
    user,
    isAdmin,
    logout,
    loginAsAdmin,
    products,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter products for quick search popup
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchFocused(false);
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Categories', href: '/categories' },
    { label: 'Design Studio', href: '/customizer' },
    { label: 'New Arrivals', href: '/shop?filter=new' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top Notification / Announcement Bar */}
      <div className="bg-black text-white text-xs py-2 px-4 border-b border-neutral-800">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <p className="font-light tracking-wide text-neutral-300">
            {settings.announcement_text || 'Premium Custom Apparel | Delivery across all 64 districts in Bangladesh'}
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span className="hidden md:inline text-[11px] text-neutral-400">
              📍 AK Khan, Chattogram
            </span>
            <div className="flex items-center gap-3">
              {settings.site_facebook && (
                <a
                  href={settings.site_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.site_instagram && (
                <a
                  href={settings.site_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.site_youtube && (
                <a
                  href={settings.site_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.site_tiktok && (
                <a
                  href={settings.site_tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
        <div className="container-custom">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-neutral-700 hover:text-black focus:outline-none"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link href="/" className="group flex items-center gap-3">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={settings.site_name}
                    className="h-10 w-auto object-contain max-w-[170px]"
                  />
                ) : (
                  <div className="flex flex-col">
                    <span className="text-2xl font-black tracking-tighter uppercase text-black font-sans group-hover:opacity-90 transition-opacity">
                      CUSTOMWEAR<span className="text-neutral-500 font-light ml-1">BD</span>
                    </span>
                    <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 -mt-1 font-medium">
                      {settings.site_tagline || 'YOUR DESIGN, YOUR STYLE'}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Middle: Product Search Bar Beside Logo */}
            <div
              ref={searchContainerRef}
              className="hidden md:block flex-1 max-w-md mx-6 relative"
            >
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search T-shirts, oversized, hoodies, polos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-neutral-100 border border-transparent focus:border-black focus:bg-white text-xs text-neutral-900 rounded-none pl-10 pr-10 py-2.5 transition-all outline-none"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs"
                  >
                    ×
                  </button>
                )}
              </form>

              {/* Quick Search Dropdown Preview */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 shadow-xl z-50 divide-y divide-neutral-100">
                  <div className="p-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                    Suggested Products
                  </div>
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/shop/${item.slug}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors"
                    >
                      <img
                        src={item.images[0]?.image_url}
                        alt={item.name}
                        className="w-10 h-10 object-cover border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-neutral-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs font-semibold text-black">
                          {settings.currency_symbol}
                          {item.sale_price ?? item.regular_price}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2 text-xs font-medium text-black bg-neutral-50 hover:bg-neutral-100 transition-colors"
                  >
                    View all results for &quot;{searchQuery}&quot;
                  </button>
                </div>
              )}
            </div>

            {/* Right: Actions (Auth, Wishlist, Cart, Admin) */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Admin Quick Switcher / Badge */}
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={loginAsAdmin}
                  className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-500 hover:text-black border border-neutral-200 hover:border-black transition-all"
                  title="Quickly switch to admin mode for demonstration"
                >
                  <Shield className="w-3 h-3" />
                  Admin Demo
                </button>
              )}

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="p-2 text-neutral-700 hover:text-black flex items-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:inline max-w-[100px] truncate">
                      {user.full_name}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="p-2 text-neutral-700 hover:text-black flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline">Login</span>
                  </button>
                )}

                {userDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="text-xs font-semibold text-neutral-900 truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 font-medium"
                    >
                      My Orders & Profile
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
                    >
                      Track Order
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="p-2 text-neutral-700 hover:text-black relative transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-neutral-700 hover:text-black relative transition-colors flex items-center gap-1.5"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="w-5 h-5 bg-black text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center justify-center space-x-8 py-3 border-t border-neutral-100">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:text-black transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-black transition-all duration-200 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-50">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-lg font-black tracking-tighter uppercase text-black font-sans">
                  CUSTOMWEAR<span className="text-neutral-500 font-light ml-1">BD</span>
                </span>
                <p className="text-[10px] tracking-widest uppercase text-neutral-500">
                  {settings.site_tagline}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-neutral-500 hover:text-black"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-neutral-100">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search clothing..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-100 border-none text-xs pl-9 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-black"
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </form>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                Navigation
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-6 py-3 text-sm font-medium text-neutral-900 hover:bg-neutral-50 border-b border-neutral-50 uppercase tracking-wider"
                >
                  {link.label}
                </Link>
              ))}

              <div className="px-4 pt-6 pb-2 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                Quick Access
              </div>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                My Account & Orders
              </Link>
              <Link
                href="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Track My Order
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50"
              >
                Wishlist ({wishlist.length})
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-6 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 font-semibold"
              >
                Admin Panel {isAdmin ? '(Active)' : ''}
              </Link>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <p className="text-xs text-neutral-600 mb-2 font-medium">
                AK Khan, Chattogram, Bangladesh
              </p>
              <div className="flex items-center gap-3 text-neutral-600">
                {settings.site_facebook && (
                  <a href={settings.site_facebook} target="_blank" rel="noopener noreferrer">
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
                {settings.site_instagram && (
                  <a href={settings.site_instagram} target="_blank" rel="noopener noreferrer">
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                )}
                {settings.site_youtube && (
                  <a href={settings.site_youtube} target="_blank" rel="noopener noreferrer">
                    <YoutubeIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </>
  );
}
