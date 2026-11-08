-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- PROFILES (extends Supabase auth.users)
-- ===========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- ADDRESSES
-- ===========================================
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- CATEGORIES
-- ===========================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- ATTRIBUTES (Size, Color, etc.)
-- ===========================================
CREATE TABLE public.attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('color', 'size', 'text')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.attribute_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  color_hex TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ===========================================
-- PRODUCTS
-- ===========================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  sku TEXT UNIQUE,
  regular_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  seo_title TEXT,
  seo_description TEXT,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- PRODUCT VARIATIONS
-- ===========================================
CREATE TABLE public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  regular_price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'out_of_stock', 'on_backorder')),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  attributes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction: which attributes a product uses
CREATE TABLE public.product_attributes (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id UUID NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, attribute_id)
);

-- ===========================================
-- INVENTORY MOVEMENTS
-- ===========================================
CREATE TABLE public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'return', 'adjustment', 'restock')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- ORDERS
-- ===========================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT 'CW-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT NOT NULL,
  delivery_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_verification', 'paid', 'rejected', 'refunded')),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  notes TEXT,
  admin_notes TEXT,
  tracking_number TEXT,
  courier TEXT,
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variation_label TEXT,
  sku TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  image_url TEXT
);

CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  note TEXT,
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- PAYMENT SUBMISSIONS
-- ===========================================
CREATE TABLE public.payment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  sender_number TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- PAYMENT METHODS CONFIGURATION
-- ===========================================
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  account_number TEXT,
  account_type TEXT,
  instructions TEXT,
  qr_code_url TEXT,
  requires_transaction_id BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- WISHLISTS
-- ===========================================
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ===========================================
-- PRODUCT REVIEWS
-- ===========================================
CREATE TABLE public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- BANNERS
-- ===========================================
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/shop',
  cta_secondary_text TEXT,
  cta_secondary_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- WEBSITE SETTINGS
-- ===========================================
CREATE TABLE public.website_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'boolean', 'json', 'image')),
  label TEXT NOT NULL,
  "group" TEXT NOT NULL DEFAULT 'general',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- COUPONS
-- ===========================================
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10,2) NOT NULL,
  minimum_order NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- ADMIN AUDIT LOGS
-- ===========================================
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- NEWSLETTER SUBSCRIPTIONS
-- ===========================================
CREATE TABLE public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- ORDER ABUSE TRACKING
-- ===========================================
CREATE TABLE public.order_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- phone or IP
  identifier_type TEXT NOT NULL, -- 'phone', 'ip'
  order_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- INDEXES
-- ===========================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_variations_product ON public.product_variations(product_id);
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_phone ON public.orders(phone);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_wishlists_user ON public.wishlists(user_id);
CREATE INDEX idx_reviews_product ON public.product_reviews(product_id);

-- ===========================================
-- UPDATED AT TRIGGERS
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variations_updated_at BEFORE UPDATE ON public.product_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_submissions_updated_at BEFORE UPDATE ON public.payment_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_settings_updated_at BEFORE UPDATE ON public.website_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_rate_limits ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Service role can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- ADDRESSES policies
CREATE POLICY "Users can manage own addresses" ON public.addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses" ON public.addresses FOR SELECT USING (public.is_admin());

-- CATEGORIES policies
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- ATTRIBUTES policies
CREATE POLICY "Anyone can view attributes" ON public.attributes FOR SELECT USING (true);
CREATE POLICY "Admins can manage attributes" ON public.attributes FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view attribute values" ON public.attribute_values FOR SELECT USING (true);
CREATE POLICY "Admins can manage attribute values" ON public.attribute_values FOR ALL USING (public.is_admin());

-- PRODUCTS policies
CREATE POLICY "Anyone can view published products" ON public.products FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view product variations" ON public.product_variations FOR SELECT USING (true);
CREATE POLICY "Admins can manage product variations" ON public.product_variations FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view product attributes" ON public.product_attributes FOR SELECT USING (true);
CREATE POLICY "Admins can manage product attributes" ON public.product_attributes FOR ALL USING (public.is_admin());

-- INVENTORY MOVEMENTS policies
CREATE POLICY "Admins can manage inventory movements" ON public.inventory_movements FOR ALL USING (public.is_admin());

-- ORDERS policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own pending orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all orders" ON public.orders FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view own order history" ON public.order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_status_history.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "Admins can manage order history" ON public.order_status_history FOR ALL USING (public.is_admin());

-- PAYMENT SUBMISSIONS policies
CREATE POLICY "Users can view own payment submissions" ON public.payment_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payment_submissions.order_id AND orders.user_id = auth.uid())
  OR public.is_admin()
);
CREATE POLICY "Anyone can submit payments" ON public.payment_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage payment submissions" ON public.payment_submissions FOR ALL USING (public.is_admin());

-- PAYMENT METHODS policies
CREATE POLICY "Anyone can view enabled payment methods" ON public.payment_methods FOR SELECT USING (is_enabled = true OR public.is_admin());
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (public.is_admin());

-- WISHLISTS policies
CREATE POLICY "Users can manage own wishlist" ON public.wishlists FOR ALL USING (auth.uid() = user_id);

-- REVIEWS policies
CREATE POLICY "Anyone can view approved reviews" ON public.product_reviews FOR SELECT USING (is_approved = true OR public.is_admin());
CREATE POLICY "Authenticated users can submit reviews" ON public.product_reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage reviews" ON public.product_reviews FOR ALL USING (public.is_admin());

-- BANNERS policies
CREATE POLICY "Anyone can view active banners" ON public.banners FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (public.is_admin());

-- WEBSITE SETTINGS policies
CREATE POLICY "Anyone can view website settings" ON public.website_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.website_settings FOR ALL USING (public.is_admin());

-- COUPONS policies
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- AUDIT LOGS policies
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (public.is_admin());

-- NEWSLETTER policies
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage newsletter" ON public.newsletter_subscriptions FOR ALL USING (public.is_admin());

-- RATE LIMITS policies
CREATE POLICY "Anyone can read rate limits" ON public.order_rate_limits FOR SELECT USING (true);
CREATE POLICY "Anyone can insert rate limits" ON public.order_rate_limits FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update rate limits" ON public.order_rate_limits FOR UPDATE USING (true);
CREATE POLICY "Admins can manage rate limits" ON public.order_rate_limits FOR ALL USING (public.is_admin());

-- ===========================================
-- AUTO CREATE PROFILE ON SIGNUP
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- SEED DEFAULT DATA
-- ===========================================

-- Default payment methods
INSERT INTO public.payment_methods (method_key, name, is_enabled, instructions, requires_transaction_id, sort_order) VALUES
  ('cod', 'Cash on Delivery', true, 'Pay with cash when your order is delivered to your doorstep.', false, 1),
  ('bkash', 'bKash', true, 'Send money to our bKash number and submit your transaction ID.', true, 2),
  ('nagad', 'Nagad', true, 'Send money to our Nagad number and submit your transaction ID.', true, 3),
  ('rocket', 'Rocket', false, 'Send money to our Rocket number and submit your transaction ID.', true, 4);

-- Default website settings
INSERT INTO public.website_settings (key, value, type, label, "group") VALUES
  ('site_name', 'CustomWear BD', 'text', 'Site Name', 'general'),
  ('site_tagline', 'Your Design, Your Style', 'text', 'Tagline', 'general'),
  ('site_email', 'info@customwearbd.com', 'text', 'Contact Email', 'general'),
  ('site_phone', '+880 1XXX-XXXXXX', 'text', 'Contact Phone', 'general'),
  ('site_address', 'AK Khan, Chattogram, Bangladesh', 'text', 'Address', 'general'),
  ('site_facebook', 'https://facebook.com/customwearbd', 'text', 'Facebook URL', 'social'),
  ('site_instagram', 'https://instagram.com/customwearbd', 'text', 'Instagram URL', 'social'),
  ('site_youtube', '', 'text', 'YouTube URL', 'social'),
  ('site_tiktok', '', 'text', 'TikTok URL', 'social'),
  ('shipping_fee', '60', 'number', 'Default Shipping Fee (BDT)', 'shipping'),
  ('free_shipping_threshold', '1000', 'number', 'Free Shipping Threshold (BDT)', 'shipping'),
  ('currency_symbol', '৳', 'text', 'Currency Symbol', 'general'),
  ('return_policy', 'We accept returns within 7 days of delivery for unused items in original condition.', 'text', 'Return Policy', 'policies'),
  ('shipping_policy', 'We ship within 24-48 hours of order confirmation. Delivery takes 2-5 business days.', 'text', 'Shipping Policy', 'policies'),
  ('footer_description', 'CustomWear BD is your premier destination for custom clothing in Bangladesh. Express yourself with our high-quality personalized apparel.', 'text', 'Footer Description', 'general'),
  ('low_stock_alert_threshold', '5', 'number', 'Low Stock Alert Threshold', 'inventory');

-- Default categories
INSERT INTO public.categories (name, slug, description, sort_order, is_active) VALUES
  ('Men''s T-Shirts', 'mens-tshirts', 'Premium custom t-shirts for men', 1, true),
  ('Women''s T-Shirts', 'womens-tshirts', 'Stylish custom t-shirts for women', 2, true),
  ('Hoodies', 'hoodies', 'Comfortable custom hoodies', 3, true),
  ('Polo Shirts', 'polo-shirts', 'Classic custom polo shirts', 4, true),
  ('Kids'' Clothing', 'kids-clothing', 'Fun custom clothing for kids', 5, true),
  ('Accessories', 'accessories', 'Custom accessories and add-ons', 6, true);

-- Default attributes
INSERT INTO public.attributes (id, name, type) VALUES
  (gen_random_uuid(), 'Size', 'size'),
  (gen_random_uuid(), 'Color', 'color');

-- Size values
INSERT INTO public.attribute_values (attribute_id, value, sort_order)
SELECT id, unnest(ARRAY['S', 'M', 'L', 'XL', 'XXL']), 
       generate_series(1, 5)
FROM public.attributes WHERE name = 'Size';

-- Color values
INSERT INTO public.attribute_values (attribute_id, value, color_hex, sort_order)
SELECT id, 'Sage Green', '#8A9A78', 1 FROM public.attributes WHERE name = 'Color'
UNION ALL
SELECT id, 'Black', '#000000', 2 FROM public.attributes WHERE name = 'Color'
UNION ALL
SELECT id, 'White', '#FFFFFF', 3 FROM public.attributes WHERE name = 'Color'
UNION ALL
SELECT id, 'Cream', '#FFF8E8', 4 FROM public.attributes WHERE name = 'Color'
UNION ALL
SELECT id, 'Pink', '#FFB6C1', 5 FROM public.attributes WHERE name = 'Color'
UNION ALL
SELECT id, 'Navy Blue', '#000080', 6 FROM public.attributes WHERE name = 'Color';

-- Default banners
INSERT INTO public.banners (title, subtitle, description, cta_text, cta_link, cta_secondary_text, cta_secondary_link, is_active, sort_order) VALUES
  ('Wear Your Own Story', 'Custom Clothing for Every Occasion', 'Express yourself with our premium custom t-shirts, hoodies, and more. Designed in Bangladesh, made for you.', 'Shop Now', '/shop', 'Explore Collection', '/shop?featured=true', true, 1),
  ('New Arrivals This Season', 'Fresh Styles Just Landed', 'Discover our latest collection of custom clothing. From casual tees to premium hoodies.', 'Shop New Arrivals', '/shop?sort=newest', 'View All', '/shop', true, 2),
  ('Design Your Own', 'Make It Uniquely Yours', 'Upload your design or choose from our templates. Create something truly one-of-a-kind.', 'Start Designing', '/custom-design', 'Learn More', '/about', true, 3);
