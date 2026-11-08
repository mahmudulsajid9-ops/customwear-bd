// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { hashPassword } from './auth';
import {
  initialCategories,
  initialProducts,
  initialBanners,
  initialSettings,
  initialOrders,
} from './data/mockData';
import {
  Product,
  Category,
  BannerSlide,
  WebsiteSettings,
  Order,
  OrderItem,
  UserProfile,
  StockAdjustmentLog,
  AdminAuditLog,
  OrderStatusHistoryItem,
  Coupon,
} from '@/types';

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL
  );

  let dataDir = path.join(process.cwd(), 'data');

  if (isServerless) {
    const tmpDataDir = path.join(os.tmpdir(), 'customwear-data');
    try {
      if (!fs.existsSync(tmpDataDir)) {
        fs.mkdirSync(tmpDataDir, { recursive: true });
      }
      const seedDbPath = path.join(process.cwd(), 'data', 'customwear.db');
      const tmpDbPath = path.join(tmpDataDir, 'customwear.db');
      if (fs.existsSync(seedDbPath) && !fs.existsSync(tmpDbPath)) {
        try {
          fs.copyFileSync(seedDbPath, tmpDbPath);
        } catch (copyErr) {
          console.warn('Could not copy seed DB to tmp:', copyErr);
        }
      }
      dataDir = tmpDataDir;
    } catch {
      dataDir = os.tmpdir();
    }
  } else {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
    } catch {
      dataDir = os.tmpdir();
    }
  }

  const dbPath = path.join(dataDir, 'customwear.db');
  const db = new DatabaseSync(dbPath);

  // Enable WAL mode, or fallback to DELETE on serverless/ephemeral filesystems
  try {
    db.exec(`PRAGMA journal_mode = WAL;`);
  } catch {
    try {
      db.exec(`PRAGMA journal_mode = DELETE;`);
    } catch {}
  }
  try {
    db.exec(`PRAGMA foreign_keys = ON;`);
  } catch {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      is_active INTEGER NOT NULL DEFAULT 1,
      is_suspended INTEGER NOT NULL DEFAULT 0,
      is_restricted INTEGER NOT NULL DEFAULT 0,
      is_flagged_suspicious INTEGER NOT NULL DEFAULT 0,
      suspicious_reason TEXT,
      total_orders INTEGER NOT NULL DEFAULT 0,
      cancelled_orders INTEGER NOT NULL DEFAULT 0,
      failed_deliveries INTEGER NOT NULL DEFAULT 0,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      seo_title TEXT,
      seo_description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      sku TEXT,
      regular_price REAL NOT NULL,
      sale_price REAL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      stock_status TEXT NOT NULL DEFAULT 'in_stock',
      status TEXT NOT NULL DEFAULT 'published',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_best_seller INTEGER NOT NULL DEFAULT 0,
      is_customizable INTEGER NOT NULL DEFAULT 1,
      tags_json TEXT NOT NULL DEFAULT '[]',
      available_sizes_json TEXT NOT NULL DEFAULT '[]',
      available_colors_json TEXT NOT NULL DEFAULT '[]',
      images_json TEXT NOT NULL DEFAULT '[]',
      variations_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      user_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      address_line TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT NOT NULL,
      zone TEXT NOT NULL,
      delivery_instructions TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'unpaid',
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      transaction_id TEXT,
      sender_phone TEXT,
      admin_notes TEXT,
      tracking_number TEXT,
      courier TEXT,
      is_suspicious INTEGER NOT NULL DEFAULT 0,
      suspicious_reason TEXT,
      items_json TEXT NOT NULL,
      history_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      variation_id TEXT,
      variation_sku TEXT,
      quantity_change INTEGER NOT NULL,
      quantity_before INTEGER NOT NULL,
      quantity_after INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      cta_text TEXT NOT NULL,
      cta_link TEXT NOT NULL,
      cta_secondary_text TEXT,
      cta_secondary_link TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS website_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_spend REAL DEFAULT 0,
      max_discount REAL,
      expiry_date TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Run initial seed if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase(db);
  }

  // Ensure default coupons exist
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get() as { count: number };
  if (couponCount.count === 0) {
    const now = new Date().toISOString();
    const insertCpn = db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_spend, max_discount, expiry_date, is_active, usage_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCpn.run('cpn-1', 'CUSTOM10', 'percentage', 10, 500, 300, null, 1, 14, now);
    insertCpn.run('cpn-2', 'FREESHIP', 'fixed', 120, 800, null, null, 1, 28, now);
    insertCpn.run('cpn-3', 'EIDDROP', 'fixed', 200, 1500, null, null, 1, 7, now);
  }

  dbInstance = db;
  return db;
}

function seedDatabase(db: DatabaseSync) {
  const now = new Date().toISOString();

  // 1. Seed Admin User
  const adminPass = hashPassword('Admin@customwearbd2026');
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, full_name, phone, role, is_active, is_suspended, is_restricted, is_flagged_suspicious, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'admin', 1, 0, 0, 0, ?)
  `).run(
    'usr-admin-1',
    'admin@customwearbd.com',
    adminPass.hash,
    adminPass.salt,
    'Managing Director (Admin)',
    '+880 1812-345678',
    now
  );

  // 2. Seed Customer Users (including one normal and one suspicious for admin review)
  const custPass = hashPassword('Customer123!');
  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, full_name, phone, role, is_active, is_suspended, is_restricted, is_flagged_suspicious, total_orders, cancelled_orders, failed_deliveries, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'customer', 1, 0, 0, 0, 4, 0, 0, ?)
  `).run(
    'usr-cust-1',
    'customer@gmail.com',
    custPass.hash,
    custPass.salt,
    'Tanvir Hossain',
    '01819876543',
    now
  );

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, full_name, phone, role, is_active, is_suspended, is_restricted, is_flagged_suspicious, suspicious_reason, total_orders, cancelled_orders, failed_deliveries, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'customer', 1, 0, 0, 1, 'Repeated cancellation at doorstep (3 cancelled orders in 14 days)', 5, 3, 2, ?)
  `).run(
    'usr-cust-2',
    'suspicious.buyer@mail.com',
    custPass.hash,
    custPass.salt,
    'Rafiqul Islam',
    '01799887766',
    now
  );

  // 3. Seed Website Settings
  db.prepare(`
    INSERT INTO website_settings (key, value_json, updated_at) VALUES ('main_settings', ?, ?)
  `).run(JSON.stringify(initialSettings), now);

  // 4. Seed Categories
  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active, seo_title, seo_description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cat of initialCategories) {
    insertCat.run(
      cat.id,
      cat.name,
      cat.slug,
      cat.description || '',
      cat.image_url,
      cat.sort_order,
      cat.is_active ? 1 : 0,
      cat.seo_title || '',
      cat.seo_description || '',
      now
    );
  }

  // 5. Seed Banners
  const insertBanner = db.prepare(`
    INSERT INTO banners (id, title, subtitle, description, image_url, cta_text, cta_link, cta_secondary_text, cta_secondary_link, is_active, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const b of initialBanners) {
    insertBanner.run(
      b.id,
      b.title,
      b.subtitle || '',
      b.description,
      b.image_url,
      b.cta_text,
      b.cta_link,
      b.cta_secondary_text || '',
      b.cta_secondary_link || '',
      b.is_active ? 1 : 0,
      b.sort_order,
      now
    );
  }

  // 6. Seed Products
  const insertProd = db.prepare(`
    INSERT INTO products (
      id, name, slug, short_description, description, category_id, sku,
      regular_price, sale_price, stock_quantity, stock_status, status,
      is_featured, is_best_seller, is_customizable, tags_json, available_sizes_json,
      available_colors_json, images_json, variations_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of initialProducts) {
    insertProd.run(
      p.id,
      p.name,
      p.slug,
      p.short_description || '',
      p.description,
      p.category_id,
      p.sku || '',
      p.regular_price,
      p.sale_price ?? null,
      p.stock_quantity,
      p.stock_status,
      p.status,
      p.is_featured ? 1 : 0,
      p.is_best_seller ? 1 : 0,
      p.is_customizable ? 1 : 0,
      JSON.stringify(p.tags || []),
      JSON.stringify(p.available_sizes || []),
      JSON.stringify(p.available_colors || []),
      JSON.stringify(p.images || []),
      JSON.stringify(p.variations || []),
      p.created_at || now
    );
  }

  // 7. Seed Orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, full_name, email, phone, address_line, city,
      district, zone, delivery_instructions, status, payment_method, payment_status,
      subtotal, shipping_fee, discount_amount, total, transaction_id, sender_phone,
      admin_notes, tracking_number, courier, is_suspicious, suspicious_reason,
      items_json, history_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of initialOrders) {
    insertOrder.run(
      o.id,
      o.order_number,
      o.user_id || 'usr-cust-1',
      o.full_name,
      o.email || '',
      o.phone,
      o.address_line,
      o.city,
      o.district,
      o.zone,
      o.delivery_instructions || '',
      o.status,
      o.payment_method,
      o.payment_status,
      o.subtotal,
      o.shipping_fee,
      o.discount_amount || 0,
      o.total,
      o.transaction_id || null,
      o.sender_phone || null,
      o.admin_notes || '',
      o.tracking_number || null,
      o.courier || null,
      o.is_suspicious ? 1 : 0,
      o.suspicious_reason || null,
      JSON.stringify(o.items || []),
      JSON.stringify(o.history || [
        {
          id: `hist-${Date.now()}`,
          order_id: o.id,
          new_status: o.status,
          note: 'Initial order placement',
          created_at: o.created_at,
        },
      ]),
      o.created_at
    );
  }

  // 8. Seed Stock Adjustments Log
  const insertStockAdj = db.prepare(`
    INSERT INTO stock_adjustments (id, product_id, product_name, variation_id, variation_sku, quantity_change, quantity_before, quantity_after, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStockAdj.run(
    'adj-init-1',
    'prod-1',
    'Heavyweight 240 GSM Oversized T-Shirt',
    'var-1-2',
    'CW-OVS-BLK-M',
    20,
    0,
    20,
    'Initial Batch Production - Chattogram Workshop',
    'Admin',
    now
  );

  // 9. Seed Admin Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run(
    'audit-1',
    'usr-admin-1',
    'Managing Director (Admin)',
    'SYSTEM_INITIALIZATION',
    'system',
    'all',
    'CustomWear BD store database initialized with full catalog & security settings.',
    now
  );
}

// ==========================================
// REPOSITORY DATA ACCESS METHODS
// ==========================================

export function dbGetSettings(): WebsiteSettings {
  const db = getDb();
  const row = db.prepare("SELECT value_json FROM website_settings WHERE key = 'main_settings'").get() as { value_json: string } | undefined;
  if (!row) return initialSettings;
  return JSON.parse(row.value_json);
}

export function dbUpdateSettings(updates: Partial<WebsiteSettings>): WebsiteSettings {
  const db = getDb();
  const current = dbGetSettings();
  const updated = { ...current, ...updates };
  db.prepare(`
    INSERT INTO website_settings (key, value_json, updated_at) VALUES ('main_settings', ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(JSON.stringify(updated), new Date().toISOString());
  return updated;
}

export function dbGetCategories(): Category[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description,
    image_url: r.image_url,
    sort_order: r.sort_order,
    is_active: Boolean(r.is_active),
    seo_title: r.seo_title,
    seo_description: r.seo_description,
    created_at: r.created_at,
  }));
}

export function dbCreateCategory(cat: Omit<Category, 'id'>): Category {
  const db = getDb();
  const id = `cat-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active, seo_title, seo_description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    cat.name,
    cat.slug,
    cat.description || '',
    cat.image_url,
    cat.sort_order || 0,
    cat.is_active ? 1 : 0,
    cat.seo_title || '',
    cat.seo_description || '',
    now
  );
  return { ...cat, id, created_at: now };
}

export function dbUpdateCategory(id: string, updates: Partial<Category>): Category | null {
  const db = getDb();
  const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as any;
  if (!current) return null;
  const merged: Category = {
    id,
    name: updates.name ?? current.name,
    slug: updates.slug ?? current.slug,
    description: updates.description ?? current.description,
    image_url: updates.image_url ?? current.image_url,
    sort_order: updates.sort_order ?? current.sort_order,
    is_active: updates.is_active !== undefined ? updates.is_active : Boolean(current.is_active),
    seo_title: updates.seo_title ?? current.seo_title,
    seo_description: updates.seo_description ?? current.seo_description,
  };
  db.prepare(`
    UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, sort_order = ?, is_active = ?, seo_title = ?, seo_description = ? WHERE id = ?
  `).run(
    merged.name,
    merged.slug,
    merged.description || '',
    merged.image_url,
    merged.sort_order,
    merged.is_active ? 1 : 0,
    merged.seo_title || '',
    merged.seo_description || '',
    id
  );
  return merged;
}

export function dbDeleteCategory(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  return true;
}

export function dbGetProducts(): Product[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as any[];
  return rows.map(formatProductRow);
}

export function dbGetProductBySlug(slug: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE slug = ?').get(slug) as any;
  if (!row) return null;
  return formatProductRow(row);
}

export function dbGetProductById(id: string): Product | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
  if (!row) return null;
  return formatProductRow(row);
}

function formatProductRow(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    short_description: r.short_description,
    description: r.description,
    category_id: r.category_id,
    sku: r.sku,
    regular_price: r.regular_price,
    sale_price: r.sale_price ?? undefined,
    stock_quantity: r.stock_quantity,
    stock_status: r.stock_status,
    status: r.status,
    is_featured: Boolean(r.is_featured),
    is_best_seller: Boolean(r.is_best_seller),
    is_customizable: Boolean(r.is_customizable),
    tags: JSON.parse(r.tags_json || '[]'),
    available_sizes: JSON.parse(r.available_sizes_json || '[]'),
    available_colors: JSON.parse(r.available_colors_json || '[]'),
    images: JSON.parse(r.images_json || '[]'),
    variations: JSON.parse(r.variations_json || '[]'),
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function dbCreateProduct(p: Omit<Product, 'id' | 'created_at'>): Product {
  const db = getDb();
  const id = `prod-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO products (
      id, name, slug, short_description, description, category_id, sku,
      regular_price, sale_price, stock_quantity, stock_status, status,
      is_featured, is_best_seller, is_customizable, tags_json, available_sizes_json,
      available_colors_json, images_json, variations_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    p.name,
    p.slug,
    p.short_description || '',
    p.description,
    p.category_id,
    p.sku || '',
    p.regular_price,
    p.sale_price ?? null,
    p.stock_quantity,
    p.stock_status,
    p.status,
    p.is_featured ? 1 : 0,
    p.is_best_seller ? 1 : 0,
    p.is_customizable ? 1 : 0,
    JSON.stringify(p.tags || []),
    JSON.stringify(p.available_sizes || []),
    JSON.stringify(p.available_colors || []),
    JSON.stringify(p.images || []),
    JSON.stringify(p.variations || []),
    now
  );
  return { ...p, id, created_at: now };
}

export function dbUpdateProduct(id: string, updates: Partial<Product>): Product | null {
  const db = getDb();
  const current = dbGetProductById(id);
  if (!current) return null;
  const merged: Product = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE products SET
      name = ?, slug = ?, short_description = ?, description = ?, category_id = ?, sku = ?,
      regular_price = ?, sale_price = ?, stock_quantity = ?, stock_status = ?, status = ?,
      is_featured = ?, is_best_seller = ?, is_customizable = ?, tags_json = ?, available_sizes_json = ?,
      available_colors_json = ?, images_json = ?, variations_json = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.name,
    merged.slug,
    merged.short_description || '',
    merged.description,
    merged.category_id,
    merged.sku || '',
    merged.regular_price,
    merged.sale_price ?? null,
    merged.stock_quantity,
    merged.stock_status,
    merged.status,
    merged.is_featured ? 1 : 0,
    merged.is_best_seller ? 1 : 0,
    merged.is_customizable ? 1 : 0,
    JSON.stringify(merged.tags || []),
    JSON.stringify(merged.available_sizes || []),
    JSON.stringify(merged.available_colors || []),
    JSON.stringify(merged.images || []),
    JSON.stringify(merged.variations || []),
    merged.updated_at,
    id
  );
  return merged;
}

export function dbDeleteProduct(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return true;
}

export function dbGetOrders(): Order[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
  return rows.map(formatOrderRow);
}

export function dbGetOrderByIdOrNumber(query: string): Order | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(query, query) as any;
  if (!row) return null;
  return formatOrderRow(row);
}

function formatOrderRow(r: any): Order {
  return {
    id: r.id,
    order_number: r.order_number,
    user_id: r.user_id,
    full_name: r.full_name,
    email: r.email,
    phone: r.phone,
    address_line: r.address_line,
    city: r.city,
    district: r.district,
    zone: r.zone,
    delivery_instructions: r.delivery_instructions,
    status: r.status,
    payment_method: r.payment_method,
    payment_status: r.payment_status,
    subtotal: r.subtotal,
    shipping_fee: r.shipping_fee,
    discount_amount: r.discount_amount,
    total: r.total,
    transaction_id: r.transaction_id,
    sender_phone: r.sender_phone,
    admin_notes: r.admin_notes,
    tracking_number: r.tracking_number,
    courier: r.courier,
    is_suspicious: Boolean(r.is_suspicious),
    suspicious_reason: r.suspicious_reason,
    items: JSON.parse(r.items_json || '[]'),
    history: JSON.parse(r.history_json || '[]'),
    created_at: r.created_at,
  };
}

export function dbCreateOrder(o: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order {
  const db = getDb();
  const id = `ord-${Date.now()}`;
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const order_number = `CW-${randomNum}`;
  const now = new Date().toISOString();

  const history: OrderStatusHistoryItem[] = [
    {
      id: `hist-${Date.now()}`,
      order_id: id,
      new_status: o.status,
      note: `Order placed via ${o.payment_method.toUpperCase()}`,
      created_at: now,
    },
  ];

  db.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, full_name, email, phone, address_line, city,
      district, zone, delivery_instructions, status, payment_method, payment_status,
      subtotal, shipping_fee, discount_amount, total, transaction_id, sender_phone,
      admin_notes, tracking_number, courier, is_suspicious, suspicious_reason,
      items_json, history_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    order_number,
    o.user_id || null,
    o.full_name,
    o.email || '',
    o.phone,
    o.address_line,
    o.city,
    o.district,
    o.zone,
    o.delivery_instructions || '',
    o.status,
    o.payment_method,
    o.payment_status,
    o.subtotal,
    o.shipping_fee,
    o.discount_amount || 0,
    o.total,
    o.transaction_id || null,
    o.sender_phone || null,
    o.admin_notes || '',
    o.tracking_number || null,
    o.courier || null,
    o.is_suspicious ? 1 : 0,
    o.suspicious_reason || null,
    JSON.stringify(o.items || []),
    JSON.stringify(history),
    now
  );

  // Automatically deduct inventory for each ordered item
  for (const item of o.items) {
    dbDeductStock(item.product_id, item.variation_id, item.quantity, `Order placed: #${order_number}`);
  }

  // Increment coupon usage count if applied
  if (o.coupon_code) {
    dbIncrementCouponUsage(o.coupon_code);
  }

  return {
    ...o,
    id,
    order_number,
    created_at: now,
    history,
  };
}

export function dbUpdateOrder(id: string, updates: Partial<Order>, adminName = 'Admin'): Order | null {
  const db = getDb();
  const current = dbGetOrderByIdOrNumber(id);
  if (!current) return null;

  const now = new Date().toISOString();
  const history = [...(current.history || [])];

  // If status is changing, log history
  if (updates.status && updates.status !== current.status) {
    history.push({
      id: `hist-${Date.now()}`,
      order_id: id,
      old_status: current.status,
      new_status: updates.status,
      note: updates.admin_notes ? `Note: ${updates.admin_notes}` : undefined,
      changed_by: adminName,
      created_at: now,
    });

    // If order is cancelled or returned, restore stock
    if ((updates.status === 'cancelled' || updates.status === 'returned') && current.status !== 'cancelled' && current.status !== 'returned') {
      for (const item of current.items) {
        dbRestoreStock(item.product_id, item.variation_id, item.quantity, `Stock restored from order ${updates.status}: #${current.order_number}`);
      }
    }
  }

  // If payment status is changing
  if (updates.payment_status && updates.payment_status !== current.payment_status) {
    history.push({
      id: `hist-pay-${Date.now()}`,
      order_id: id,
      new_status: updates.status || current.status,
      note: `Payment status changed from ${current.payment_status} to ${updates.payment_status}`,
      changed_by: adminName,
      created_at: now,
    });
  }

  const merged: Order = {
    ...current,
    ...updates,
    history,
  };

  db.prepare(`
    UPDATE orders SET
      status = ?, payment_status = ?, courier = ?, tracking_number = ?,
      admin_notes = ?, is_suspicious = ?, suspicious_reason = ?,
      history_json = ?, updated_at = ?
    WHERE id = ?
  `).run(
    merged.status,
    merged.payment_status,
    merged.courier || null,
    merged.tracking_number || null,
    merged.admin_notes || '',
    merged.is_suspicious ? 1 : 0,
    merged.suspicious_reason || null,
    JSON.stringify(history),
    now,
    id
  );

  return merged;
}

export function dbDeductStock(productId: string, variationId: string | undefined, quantity: number, reason: string): boolean {
  const db = getDb();
  const product = dbGetProductById(productId);
  if (!product) return false;

  const now = new Date().toISOString();
  let before = product.stock_quantity;
  let after = Math.max(0, before - quantity);

  let updatedVariations = [...product.variations];
  let varSku: string | undefined;

  if (variationId) {
    updatedVariations = updatedVariations.map((v) => {
      if (v.id === variationId) {
        varSku = v.sku;
        const vBefore = v.stock_quantity;
        const vAfter = Math.max(0, vBefore - quantity);
        return {
          ...v,
          stock_quantity: vAfter,
          stock_status: vAfter <= 0 ? 'out_of_stock' : 'in_stock',
        };
      }
      return v;
    });
  }

  dbUpdateProduct(productId, {
    stock_quantity: after,
    stock_status: after <= 0 ? 'out_of_stock' : 'in_stock',
    variations: updatedVariations,
  });

  // Log stock movement
  db.prepare(`
    INSERT INTO stock_adjustments (id, product_id, product_name, variation_id, variation_sku, quantity_change, quantity_before, quantity_after, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `adj-${Date.now()}-${Math.random()}`,
    productId,
    product.name,
    variationId || null,
    varSku || product.sku || null,
    -quantity,
    before,
    after,
    reason,
    'System (Order Placement)',
    now
  );

  return true;
}

export function dbRestoreStock(productId: string, variationId: string | undefined, quantity: number, reason: string): boolean {
  const db = getDb();
  const product = dbGetProductById(productId);
  if (!product) return false;

  const now = new Date().toISOString();
  let before = product.stock_quantity;
  let after = before + quantity;

  let updatedVariations = [...product.variations];
  let varSku: string | undefined;

  if (variationId) {
    updatedVariations = updatedVariations.map((v) => {
      if (v.id === variationId) {
        varSku = v.sku;
        const vBefore = v.stock_quantity;
        const vAfter = vBefore + quantity;
        return {
          ...v,
          stock_quantity: vAfter,
          stock_status: 'in_stock',
        };
      }
      return v;
    });
  }

  dbUpdateProduct(productId, {
    stock_quantity: after,
    stock_status: 'in_stock',
    variations: updatedVariations,
  });

  db.prepare(`
    INSERT INTO stock_adjustments (id, product_id, product_name, variation_id, variation_sku, quantity_change, quantity_before, quantity_after, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `adj-${Date.now()}-${Math.random()}`,
    productId,
    product.name,
    variationId || null,
    varSku || product.sku || null,
    quantity,
    before,
    after,
    reason,
    'System (Cancellation/Return)',
    now
  );

  return true;
}

export function dbAdjustStockManually(
  productId: string,
  variationId: string | undefined,
  newStock: number,
  reason: string,
  adminName: string
): boolean {
  const db = getDb();
  const product = dbGetProductById(productId);
  if (!product) return false;

  const now = new Date().toISOString();
  const safeStock = Math.max(0, newStock);

  let varSku: string | undefined;
  let before = product.stock_quantity;
  let updatedVariations = [...product.variations];

  if (variationId) {
    const targetVar = updatedVariations.find((v) => v.id === variationId);
    if (targetVar) {
      before = targetVar.stock_quantity;
      varSku = targetVar.sku;
      updatedVariations = updatedVariations.map((v) =>
        v.id === variationId
          ? {
              ...v,
              stock_quantity: safeStock,
              stock_status: safeStock <= 0 ? 'out_of_stock' : 'in_stock',
            }
          : v
      );
      // Recalculate total product stock
      const totalVarStock = updatedVariations.reduce((sum, v) => sum + v.stock_quantity, 0);
      dbUpdateProduct(productId, {
        stock_quantity: totalVarStock,
        stock_status: totalVarStock <= 0 ? 'out_of_stock' : 'in_stock',
        variations: updatedVariations,
      });
    }
  } else {
    dbUpdateProduct(productId, {
      stock_quantity: safeStock,
      stock_status: safeStock <= 0 ? 'out_of_stock' : 'in_stock',
    });
  }

  const change = safeStock - before;

  db.prepare(`
    INSERT INTO stock_adjustments (id, product_id, product_name, variation_id, variation_sku, quantity_change, quantity_before, quantity_after, reason, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `adj-${Date.now()}`,
    productId,
    product.name,
    variationId || null,
    varSku || product.sku || null,
    change,
    before,
    safeStock,
    reason || 'Manual Admin Stock Adjustment',
    adminName,
    now
  );

  return true;
}

export function dbGetStockAdjustments(): StockAdjustmentLog[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM stock_adjustments ORDER BY created_at DESC LIMIT 100').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    product_name: r.product_name,
    variation_id: r.variation_id,
    variation_sku: r.variation_sku,
    quantity_change: r.quantity_change,
    quantity_before: r.quantity_before,
    quantity_after: r.quantity_after,
    reason: r.reason,
    created_by: r.created_by,
    created_at: r.created_at,
  }));
}

export function dbGetAuditLogs(): AdminAuditLog[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 100').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    admin_id: r.admin_id,
    admin_name: r.admin_name,
    action: r.action,
    resource_type: r.resource_type,
    resource_id: r.resource_id,
    details: r.details,
    created_at: r.created_at,
  }));
}

export function dbLogAdminAction(
  adminId: string,
  adminName: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: string
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO admin_audit_logs (id, admin_id, admin_name, action, resource_type, resource_id, details, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `audit-${Date.now()}-${Math.random()}`,
    adminId,
    adminName,
    action,
    resourceType,
    resourceId || null,
    details || null,
    new Date().toISOString()
  );
}

export function dbGetUsers(): UserProfile[] {
  const db = getDb();
  const rows = db.prepare('SELECT id, email, full_name, phone, role, is_active, is_suspended, is_restricted, is_flagged_suspicious, suspicious_reason, total_orders, cancelled_orders, failed_deliveries, avatar_url, created_at FROM users ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    full_name: r.full_name,
    phone: r.phone,
    role: r.role,
    is_active: Boolean(r.is_active),
    is_suspended: Boolean(r.is_suspended),
    is_restricted: Boolean(r.is_restricted),
    is_flagged_suspicious: Boolean(r.is_flagged_suspicious),
    suspicious_reason: r.suspicious_reason,
    total_orders: r.total_orders,
    cancelled_orders: r.cancelled_orders,
    failed_deliveries: r.failed_deliveries,
    avatar_url: r.avatar_url,
    created_at: r.created_at,
  }));
}

export function dbGetUserById(id: string): any {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function dbGetUserByEmail(email: string): any {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function dbCreateUser(userData: {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'admin' | 'customer';
}): UserProfile {
  const db = getDb();
  const id = `usr-${Date.now()}`;
  const now = new Date().toISOString();
  const pass = hashPassword(userData.password);

  db.prepare(`
    INSERT INTO users (id, email, password_hash, salt, full_name, phone, role, is_active, is_suspended, is_restricted, is_flagged_suspicious, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, ?)
  `).run(
    id,
    userData.email.toLowerCase().trim(),
    pass.hash,
    pass.salt,
    userData.full_name,
    userData.phone || null,
    userData.role || 'customer',
    now
  );

  return {
    id,
    email: userData.email,
    full_name: userData.full_name,
    phone: userData.phone,
    role: userData.role || 'customer',
    is_active: true,
    is_suspended: false,
    is_restricted: false,
    is_flagged_suspicious: false,
    created_at: now,
  };
}

export function dbUpdateUserStatus(
  id: string,
  updates: {
    is_active?: boolean;
    is_suspended?: boolean;
    is_restricted?: boolean;
    is_flagged_suspicious?: boolean;
    suspicious_reason?: string;
  },
  adminName = 'Admin'
): boolean {
  const db = getDb();
  const user = dbGetUserById(id);
  if (!user) return false;

  const currentActive = updates.is_active !== undefined ? (updates.is_active ? 1 : 0) : user.is_active;
  const currentSuspended = updates.is_suspended !== undefined ? (updates.is_suspended ? 1 : 0) : user.is_suspended;
  const currentRestricted = updates.is_restricted !== undefined ? (updates.is_restricted ? 1 : 0) : user.is_restricted;
  const currentFlagged = updates.is_flagged_suspicious !== undefined ? (updates.is_flagged_suspicious ? 1 : 0) : user.is_flagged_suspicious;
  const currentReason = updates.suspicious_reason !== undefined ? updates.suspicious_reason : user.suspicious_reason;

  db.prepare(`
    UPDATE users SET
      is_active = ?, is_suspended = ?, is_restricted = ?, is_flagged_suspicious = ?, suspicious_reason = ?
    WHERE id = ?
  `).run(currentActive, currentSuspended, currentRestricted, currentFlagged, currentReason || null, id);

  dbLogAdminAction(
    'admin',
    adminName,
    'UPDATE_USER_STATUS',
    'user',
    id,
    `Updated status for customer ${user.email}: suspended=${currentSuspended}, restricted=${currentRestricted}, flagged=${currentFlagged}`
  );

  return true;
}

export function dbResetUserPassword(email: string, newPassword: string): boolean {
  const db = getDb();
  const user = dbGetUserByEmail(email.toLowerCase().trim());
  if (!user) return false;

  const pass = hashPassword(newPassword);
  db.prepare(`
    UPDATE users SET password_hash = ?, salt = ? WHERE id = ?
  `).run(pass.hash, pass.salt, user.id);

  dbLogAdminAction(
    'system',
    'Security Engine',
    'USER_PASSWORD_RESET',
    'user',
    user.id,
    `Password reset successfully for ${email}`
  );

  return true;
}

export function dbGetBanners(): BannerSlide[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.subtitle,
    description: r.description,
    image_url: r.image_url,
    cta_text: r.cta_text,
    cta_link: r.cta_link,
    cta_secondary_text: r.cta_secondary_text,
    cta_secondary_link: r.cta_secondary_link,
    is_active: Boolean(r.is_active),
    sort_order: r.sort_order,
  }));
}

export function dbCreateBanner(b: Omit<BannerSlide, 'id'>): BannerSlide {
  const db = getDb();
  const id = `slide-${Date.now()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO banners (id, title, subtitle, description, image_url, cta_text, cta_link, cta_secondary_text, cta_secondary_link, is_active, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    b.title,
    b.subtitle || '',
    b.description,
    b.image_url,
    b.cta_text,
    b.cta_link,
    b.cta_secondary_text || '',
    b.cta_secondary_link || '',
    b.is_active ? 1 : 0,
    b.sort_order,
    now
  );
  return { ...b, id };
}

export function dbUpdateBanner(id: string, updates: Partial<BannerSlide>): BannerSlide | null {
  const db = getDb();
  const current = db.prepare('SELECT * FROM banners WHERE id = ?').get(id) as any;
  if (!current) return null;
  const merged: BannerSlide = {
    id,
    title: updates.title ?? current.title,
    subtitle: updates.subtitle ?? current.subtitle,
    description: updates.description ?? current.description,
    image_url: updates.image_url ?? current.image_url,
    cta_text: updates.cta_text ?? current.cta_text,
    cta_link: updates.cta_link ?? current.cta_link,
    cta_secondary_text: updates.cta_secondary_text ?? current.cta_secondary_text,
    cta_secondary_link: updates.cta_secondary_link ?? current.cta_secondary_link,
    is_active: updates.is_active !== undefined ? updates.is_active : Boolean(current.is_active),
    sort_order: updates.sort_order ?? current.sort_order,
  };
  db.prepare(`
    UPDATE banners SET
      title = ?, subtitle = ?, description = ?, image_url = ?, cta_text = ?, cta_link = ?,
      cta_secondary_text = ?, cta_secondary_link = ?, is_active = ?, sort_order = ?
    WHERE id = ?
  `).run(
    merged.title,
    merged.subtitle || '',
    merged.description,
    merged.image_url,
    merged.cta_text,
    merged.cta_link,
    merged.cta_secondary_text || '',
    merged.cta_secondary_link || '',
    merged.is_active ? 1 : 0,
    merged.sort_order,
    id
  );
  return merged;
}

export function dbDeleteBanner(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  return true;
}

// ==========================================
// COUPON REPOSITORY METHODS
// ==========================================

export function dbGetCoupons(): Coupon[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all() as any[];
  return rows.map((r) => ({
    id: r.id,
    code: r.code,
    discount_type: r.discount_type as 'percentage' | 'fixed',
    discount_value: Number(r.discount_value),
    min_spend: r.min_spend ? Number(r.min_spend) : undefined,
    max_discount: r.max_discount ? Number(r.max_discount) : undefined,
    expiry_date: r.expiry_date || undefined,
    is_active: Boolean(r.is_active),
    usage_count: Number(r.usage_count || 0),
    created_at: r.created_at,
  }));
}

export function dbGetCouponByCode(code: string): Coupon | undefined {
  const db = getDb();
  const r = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?)').get(code.trim()) as any;
  if (!r) return undefined;
  return {
    id: r.id,
    code: r.code,
    discount_type: r.discount_type as 'percentage' | 'fixed',
    discount_value: Number(r.discount_value),
    min_spend: r.min_spend ? Number(r.min_spend) : undefined,
    max_discount: r.max_discount ? Number(r.max_discount) : undefined,
    expiry_date: r.expiry_date || undefined,
    is_active: Boolean(r.is_active),
    usage_count: Number(r.usage_count || 0),
    created_at: r.created_at,
  };
}

export function dbCreateCoupon(data: {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend?: number;
  max_discount?: number;
  expiry_date?: string;
  is_active?: boolean;
}): Coupon {
  const db = getDb();
  const id = `cpn-${Date.now()}`;
  const now = new Date().toISOString();
  const cleanCode = data.code.trim().toUpperCase();

  db.prepare(`
    INSERT INTO coupons (id, code, discount_type, discount_value, min_spend, max_discount, expiry_date, is_active, usage_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(
    id,
    cleanCode,
    data.discount_type,
    data.discount_value,
    data.min_spend || 0,
    data.max_discount || null,
    data.expiry_date || null,
    data.is_active !== false ? 1 : 0,
    now
  );

  return {
    id,
    code: cleanCode,
    discount_type: data.discount_type,
    discount_value: data.discount_value,
    min_spend: data.min_spend,
    max_discount: data.max_discount,
    expiry_date: data.expiry_date,
    is_active: data.is_active !== false,
    usage_count: 0,
    created_at: now,
  };
}

export function dbUpdateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
  const db = getDb();
  const current = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id) as any;
  if (!current) return null;

  const merged = {
    code: updates.code ? updates.code.trim().toUpperCase() : current.code,
    discount_type: updates.discount_type ?? current.discount_type,
    discount_value: updates.discount_value ?? current.discount_value,
    min_spend: updates.min_spend !== undefined ? updates.min_spend : current.min_spend,
    max_discount: updates.max_discount !== undefined ? updates.max_discount : current.max_discount,
    expiry_date: updates.expiry_date !== undefined ? updates.expiry_date : current.expiry_date,
    is_active: updates.is_active !== undefined ? (updates.is_active ? 1 : 0) : current.is_active,
  };

  db.prepare(`
    UPDATE coupons SET
      code = ?, discount_type = ?, discount_value = ?, min_spend = ?,
      max_discount = ?, expiry_date = ?, is_active = ?
    WHERE id = ?
  `).run(
    merged.code,
    merged.discount_type,
    merged.discount_value,
    merged.min_spend || 0,
    merged.max_discount || null,
    merged.expiry_date || null,
    merged.is_active,
    id
  );

  return {
    id,
    code: merged.code,
    discount_type: merged.discount_type,
    discount_value: Number(merged.discount_value),
    min_spend: merged.min_spend ? Number(merged.min_spend) : undefined,
    max_discount: merged.max_discount ? Number(merged.max_discount) : undefined,
    expiry_date: merged.expiry_date || undefined,
    is_active: Boolean(merged.is_active),
    usage_count: Number(current.usage_count || 0),
    created_at: current.created_at,
  };
}

export function dbDeleteCoupon(id: string): boolean {
  const db = getDb();
  db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
  return true;
}

export function dbIncrementCouponUsage(code: string): void {
  const db = getDb();
  db.prepare('UPDATE coupons SET usage_count = usage_count + 1 WHERE UPPER(code) = UPPER(?)').run(code.trim());
}
