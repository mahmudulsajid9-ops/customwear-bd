export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  is_suspended?: boolean;
  is_restricted?: boolean;
  is_flagged_suspicious?: boolean;
  suspicious_reason?: string;
  total_orders?: number;
  cancelled_orders?: number;
  failed_deliveries?: number;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
}

export interface AttributeValue {
  id: string;
  attribute_id: string;
  value: string; // e.g. "M", "Black"
  color_hex?: string; // e.g. "#000000"
  sort_order: number;
}

export interface Attribute {
  id: string;
  name: string; // "Size", "Color"
  type: 'size' | 'color' | 'text';
  values: AttributeValue[];
}

export interface ProductVariation {
  id: string;
  product_id: string;
  sku: string;
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  image_url?: string;
  is_active: boolean;
  attributes: Record<string, string>; // attributeName -> value, e.g. { "Size": "M", "Color": "Black" }
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  description: string;
  category_id: string;
  category?: Category;
  sku?: string;
  regular_price: number;
  sale_price?: number;
  stock_quantity: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'on_backorder';
  status: 'published' | 'draft' | 'archived';
  is_featured: boolean;
  is_best_seller: boolean;
  tags: string[];
  images: ProductImage[];
  variations: ProductVariation[];
  available_sizes: string[];
  available_colors: { name: string; hex: string }[];
  is_customizable?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // unique item id: productId-variationId
  product_id: string;
  variation_id?: string;
  product_name: string;
  slug: string;
  image_url: string;
  regular_price: number;
  sale_price?: number;
  unit_price: number;
  quantity: number;
  selected_size?: string;
  selected_color?: string;
  custom_instruction?: string;
  custom_image_url?: string;
  sku?: string;
  max_stock: number;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  cta_secondary_text?: string;
  cta_secondary_link?: string;
  is_active: boolean;
  sort_order: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus =
  | 'unpaid'
  | 'pending_verification'
  | 'paid'
  | 'rejected'
  | 'refunded';

export interface OrderItem {
  id: string;
  product_id: string;
  variation_id?: string;
  product_name: string;
  selected_size?: string;
  selected_color?: string;
  sku?: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
  custom_instruction?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone: string;
  address_line: string;
  city: string; // e.g., "Chattogram", "Dhaka"
  district: string;
  zone: 'inside_chattogram' | 'outside_chattogram';
  delivery_instructions?: string;
  status: OrderStatus;
  payment_method: 'cod' | 'bkash' | 'nagad' | 'rocket';
  payment_status: PaymentStatus;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  coupon_code?: string;
  total: number;
  transaction_id?: string;
  sender_phone?: string;
  admin_notes?: string;
  tracking_number?: string;
  courier?: string;
  is_suspicious?: boolean;
  suspicious_reason?: string;
  history?: OrderStatusHistoryItem[];
  items: OrderItem[];
  created_at: string;
}

export interface WebsiteSettings {
  site_name: string;
  site_tagline: string;
  site_email: string;
  site_phone: string;
  site_address: string;
  logo_url?: string;
  favicon_url?: string;
  site_facebook: string;
  site_instagram: string;
  site_youtube: string;
  site_tiktok: string;
  shipping_inside_ctg: number;
  shipping_outside_ctg: number;
  free_shipping_threshold: number;
  currency_symbol: string;
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  enable_cod: boolean;
  enable_bkash: boolean;
  enable_nagad: boolean;
  enable_rocket: boolean;
  cod_instructions: string;
  bkash_instructions: string;
  nagad_instructions: string;
  rocket_instructions: string;
  announcement_text: string;
  footer_description?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  note?: string;
  changed_by?: string;
  created_at: string;
}

export interface StockAdjustmentLog {
  id: string;
  product_id: string;
  product_name: string;
  variation_id?: string;
  variation_sku?: string;
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number; // e.g. 10 for 10% or 100 for ৳100
  min_spend?: number;
  max_discount?: number;
  expiry_date?: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}
