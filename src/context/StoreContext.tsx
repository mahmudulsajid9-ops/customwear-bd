'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Product,
  Category,
  BannerSlide,
  WebsiteSettings,
  CartItem,
  Order,
  OrderStatus,
  PaymentStatus,
  UserProfile,
  StockAdjustmentLog,
  AdminAuditLog,
  Coupon,
} from '@/types';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialSettings,
  initialOrders,
} from '@/lib/data/mockData';

interface StoreContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<Product | undefined>;
  getProductBySlug: (slug: string) => Product | undefined;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Banners / Carousel Slides
  banners: BannerSlide[];
  addBanner: (banner: Omit<BannerSlide, 'id'>) => Promise<BannerSlide>;
  updateBanner: (id: string, updates: Partial<BannerSlide>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  reorderBanners: (banners: BannerSlide[]) => void;

  // Settings
  settings: WebsiteSettings;
  updateSettings: (newSettings: Partial<WebsiteSettings>) => Promise<void>;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>) => Promise<Order>;
  updateOrderStatus: (
    id: string,
    status: OrderStatus,
    adminNotes?: string,
    extra?: { courier?: string; tracking_number?: string }
  ) => Promise<void>;
  updatePaymentStatus: (id: string, payment_status: PaymentStatus) => Promise<void>;
  getOrderByIdOrNumber: (query: string) => Order | undefined;

  // Customers / Users
  customers: UserProfile[];
  updateCustomerStatus: (
    id: string,
    updates: {
      is_active?: boolean;
      is_suspended?: boolean;
      is_restricted?: boolean;
      is_flagged_suspicious?: boolean;
      suspicious_reason?: string;
    }
  ) => Promise<void>;

  // Stock Management
  stockLogs: StockAdjustmentLog[];
  adjustStock: (
    productId: string,
    variationId: string | undefined,
    newStock: number,
    reason: string
  ) => Promise<void>;

  // Admin Audit Logs
  auditLogs: AdminAuditLog[];

  // Coupons
  coupons: Coupon[];
  validateCoupon: (
    code: string,
    subtotal: number
  ) => Promise<{ valid: boolean; discount_amount?: number; message?: string }>;
  addCoupon: (data: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>) => Promise<void>;
  updateCoupon: (id: string, updates: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;

  // Auth / Admin
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string,
    newPassword: string,
    resetCode?: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  loginAsAdmin: () => void;
  loginAsCustomer: (name: string, email: string) => void;
  logout: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [banners, setBanners] = useState<BannerSlide[]>(initialBanners);
  const [settings, setSettings] = useState<WebsiteSettings>(initialSettings);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [stockLogs, setStockLogs] = useState<StockAdjustmentLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize from LocalStorage and then Fetch from API
  useEffect(() => {
    try {
      const storedProds = localStorage.getItem('cw_products');
      if (storedProds) setProducts(JSON.parse(storedProds));

      const storedCats = localStorage.getItem('cw_categories');
      if (storedCats) setCategories(JSON.parse(storedCats));

      const storedBanners = localStorage.getItem('cw_banners');
      if (storedBanners) setBanners(JSON.parse(storedBanners));

      const storedSettings = localStorage.getItem('cw_settings');
      if (storedSettings) setSettings(JSON.parse(storedSettings));

      const storedOrders = localStorage.getItem('cw_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));

      const storedCart = localStorage.getItem('cw_cart');
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem('cw_wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedUser = localStorage.getItem('cw_user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.warn('Storage hydration error', e);
    }
    setIsHydrated(true);

    // Fetch live backend data asynchronously
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    try {
      const [prodRes, catRes, setRes, banRes, ordRes, custRes, stockRes, auditRes, cpnRes] =
        await Promise.allSettled([
          fetch('/api/products').then((r) => r.json()),
          fetch('/api/categories').then((r) => r.json()),
          fetch('/api/settings').then((r) => r.json()),
          fetch('/api/banners').then((r) => r.json()),
          fetch('/api/orders').then((r) => r.json()),
          fetch('/api/customers').then((r) => r.json()),
          fetch('/api/stock').then((r) => r.json()),
          fetch('/api/audit-logs').then((r) => r.json()),
          fetch('/api/coupons').then((r) => r.json()),
        ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.products?.length > 0) {
        setProducts(prodRes.value.products);
      }
      if (catRes.status === 'fulfilled' && catRes.value.categories?.length > 0) {
        setCategories(catRes.value.categories);
      }
      if (setRes.status === 'fulfilled' && setRes.value.settings) {
        setSettings(setRes.value.settings);
      }
      if (banRes.status === 'fulfilled' && banRes.value.banners?.length > 0) {
        setBanners(banRes.value.banners);
      }
      if (ordRes.status === 'fulfilled' && ordRes.value.orders?.length > 0) {
        setOrders(ordRes.value.orders);
      }
      if (custRes.status === 'fulfilled' && custRes.value.users?.length > 0) {
        setCustomers(custRes.value.users);
      }
      if (stockRes.status === 'fulfilled' && stockRes.value.logs?.length > 0) {
        setStockLogs(stockRes.value.logs);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value.logs?.length > 0) {
        setAuditLogs(auditRes.value.logs);
      }
      if (cpnRes.status === 'fulfilled' && cpnRes.value.coupons?.length > 0) {
        setCoupons(cpnRes.value.coupons);
      }
    } catch (e) {
      console.warn('Backend sync warning', e);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_products', JSON.stringify(products));
  }, [products, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_categories', JSON.stringify(categories));
  }, [categories, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_banners', JSON.stringify(banners));
  }, [banners, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_settings', JSON.stringify(settings));
  }, [settings, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_orders', JSON.stringify(orders));
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_cart', JSON.stringify(cart));
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('cw_wishlist', JSON.stringify(wishlist));
  }, [wishlist, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (user) {
      localStorage.setItem('cw_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cw_user');
    }
  }, [user, isHydrated]);

  // Product CRUD
  const addProduct = async (prodData: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });
      const data = await res.json();
      if (data.product) {
        setProducts((prev) => [data.product, ...prev]);
        return data.product;
      }
    } catch (e) {
      console.warn('Offline fallback for addProduct', e);
    }

    const fallback: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [fallback, ...prev]);
    return fallback;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p))
    );
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Failed to sync product update', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to sync product deletion', e);
    }
  };

  const duplicateProduct = async (id: string): Promise<Product | undefined> => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return undefined;

    const copyData: Omit<Product, 'id' | 'created_at'> = {
      ...existing,
      name: `${existing.name} (Copy)`,
      slug: `${existing.slug}-copy-${Date.now()}`,
      sku: existing.sku ? `${existing.sku}-COPY` : undefined,
      variations: (existing.variations || []).map((v, i) => ({
        ...v,
        id: `var-copy-${Date.now()}-${i}`,
        sku: v.sku ? `${v.sku}-COPY` : `CW-VAR-${i}`,
      })),
    };

    return await addProduct(copyData);
  };

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  // Category CRUD
  const addCategory = async (catData: Omit<Category, 'id'>): Promise<Category> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      const data = await res.json();
      if (data.category) {
        setCategories((prev) => [...prev, data.category]);
        return data.category;
      }
    } catch (e) {
      console.warn('Offline fallback for addCategory', e);
    }

    const fallback: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, fallback]);
    return fallback;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Failed to sync category update', e);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to sync category deletion', e);
    }
  };

  // Banner CRUD
  const addBanner = async (bannerData: Omit<BannerSlide, 'id'>): Promise<BannerSlide> => {
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      });
      const data = await res.json();
      if (data.banner) {
        setBanners((prev) => [...prev, data.banner]);
        return data.banner;
      }
    } catch (e) {
      console.warn('Offline fallback for addBanner', e);
    }

    const fallback: BannerSlide = {
      ...bannerData,
      id: `slide-${Date.now()}`,
    };
    setBanners((prev) => [...prev, fallback]);
    return fallback;
  };

  const updateBanner = async (id: string, updates: Partial<BannerSlide>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    try {
      await fetch('/api/banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.warn('Failed to sync banner update', e);
    }
  };

  const deleteBanner = async (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to sync banner deletion', e);
    }
  };

  const reorderBanners = (newBanners: BannerSlide[]) => {
    setBanners(newBanners);
  };

  // Settings
  const updateSettings = async (newSettings: Partial<WebsiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.warn('Failed to sync settings update', e);
    }
  };

  // Orders
  const createOrder = async (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
  ): Promise<Order> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.order) {
        setOrders((prev) => [data.order, ...prev]);
        // Also refresh products to show updated stock immediately
        fetchBackendData();
        return data.order;
      }
      if (data.error) {
        throw new Error(data.error);
      }
    } catch (e) {
      console.warn('Offline fallback for createOrder', e);
    }

    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const fallback: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      order_number: `CW-${randomCode}`,
      created_at: new Date().toISOString(),
    };
    setOrders((prev) => [fallback, ...prev]);

    // Deduct stock in client state
    setProducts((prev) =>
      prev.map((p) => {
        const item = orderData.items.find((i) => i.product_id === p.id);
        if (!item) return p;
        const newStock = Math.max(0, p.stock_quantity - item.quantity);
        return {
          ...p,
          stock_quantity: newStock,
          stock_status: newStock <= 0 ? 'out_of_stock' : 'in_stock',
        };
      })
    );

    return fallback;
  };

  const updateOrderStatus = async (
    id: string,
    status: OrderStatus,
    adminNotes?: string,
    extra?: { courier?: string; tracking_number?: string }
  ) => {
    const existing = orders.find((o) => o.id === id);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              admin_notes: adminNotes ?? o.admin_notes,
              courier: extra?.courier ?? o.courier,
              tracking_number: extra?.tracking_number ?? o.tracking_number,
            }
          : o
      )
    );

    // If order is cancelled or returned, restore stock in client state
    if (
      existing &&
      (status === 'cancelled' || status === 'returned') &&
      existing.status !== 'cancelled' &&
      existing.status !== 'returned'
    ) {
      setProducts((prev) =>
        prev.map((p) => {
          const item = existing.items.find((i) => i.product_id === p.id);
          if (!item) return p;
          const restoredStock = p.stock_quantity + item.quantity;
          return {
            ...p,
            stock_quantity: restoredStock,
            stock_status: 'in_stock',
          };
        })
      );
    }

    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes,
          courier: extra?.courier,
          tracking_number: extra?.tracking_number,
        }),
      });
      fetchBackendData();
    } catch (e) {
      console.warn('Failed to sync order status update', e);
    }
  };

  const updatePaymentStatus = async (id: string, payment_status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, payment_status } : o))
    );
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status }),
      });
    } catch (e) {
      console.warn('Failed to sync payment status update', e);
    }
  };

  const getOrderByIdOrNumber = (query: string) => {
    const q = query.trim().toLowerCase();
    return orders.find(
      (o) => o.id.toLowerCase() === q || o.order_number.toLowerCase() === q
    );
  };

  // Customers
  const updateCustomerStatus = async (
    id: string,
    updates: {
      is_active?: boolean;
      is_suspended?: boolean;
      is_restricted?: boolean;
      is_flagged_suspicious?: boolean;
      suspicious_reason?: string;
    }
  ) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    try {
      await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Failed to sync customer status update', e);
    }
  };

  // Stock Management
  const adjustStock = async (
    productId: string,
    variationId: string | undefined,
    newStock: number,
    reason: string
  ) => {
    try {
      await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          variation_id: variationId,
          new_stock: newStock,
          reason,
          admin_name: user?.full_name || 'Admin',
        }),
      });
      fetchBackendData();
    } catch (e) {
      console.warn('Failed to adjust stock', e);
    }
  };

  // Coupons
  const validateCoupon = async (
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discount_amount?: number; message?: string }> => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      return {
        valid: data.valid,
        discount_amount: data.discount_amount,
        message: data.message,
      };
    } catch {
      return { valid: false, message: 'Could not connect to coupon server.' };
    }
  };

  const addCoupon = async (data: Omit<Coupon, 'id' | 'created_at' | 'usage_count'>) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.coupon) {
        setCoupons((prev) => [json.coupon, ...prev]);
      }
    } catch (e) {
      console.warn('Failed to add coupon', e);
    }
  };

  const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    try {
      await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Failed to update coupon', e);
    }
  };

  const deleteCoupon = async (id: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete coupon', e);
    }
  };

  // Cart
  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === newItem.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        const nextQty = updated[existingIdx].quantity + newItem.quantity;
        // Cap at max stock
        updated[existingIdx].quantity = Math.min(nextQty, newItem.max_stock || 99);
        return updated;
      }
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return { ...item, quantity: Math.min(newQty, item.max_stock || 99) };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart]
  );

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Auth
  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Could not connect to login server.' };
    }
  };

  const register = async (
    fullName: string,
    email: string,
    pass: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password: pass, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      setUser(data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Could not connect to registration server.' };
    }
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    resetCode?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword, reset_code: resetCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Network error. Could not connect to reset password server.' };
    }
  };

  const loginAsAdmin = () => {
    const adminUser: UserProfile = {
      id: 'usr-admin-1',
      email: 'admin@customwearbd.com',
      full_name: 'Managing Director (Admin)',
      phone: '+880 1812-345678',
      role: 'admin',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setUser(adminUser);
  };

  const loginAsCustomer = (name: string, email: string) => {
    const custUser: UserProfile = {
      id: `usr-cust-${Date.now()}`,
      email,
      full_name: name,
      phone: '01819876543',
      role: 'customer',
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setUser(custUser);
  };

  const logout = () => {
    setUser(null);
    fetch('/api/auth/me', { method: 'POST' }).catch(() => {});
  };

  const isAdmin = user?.role === 'admin';

  return (
    <StoreContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        getProductBySlug,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        reorderBanners,
        settings,
        updateSettings,
        orders,
        createOrder,
        updateOrderStatus,
        updatePaymentStatus,
        getOrderByIdOrNumber,
        customers,
        updateCustomerStatus,
        stockLogs,
        adjustStock,
        auditLogs,
        coupons,
        validateCoupon,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        isAdmin,
        login,
        register,
        resetPassword,
        loginAsAdmin,
        loginAsCustomer,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
