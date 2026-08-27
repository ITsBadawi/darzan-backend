-- ═══════════════════════════════════════════════════════════════
-- Darzan Database Migration — Supabase (PostgreSQL)
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- ─── Enable UUID extension ───────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES — extends Supabase Auth users with role & name
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  full_name  TEXT NOT NULL DEFAULT '',
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 2. PRODUCTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT DEFAULT '',
  price_min   INTEGER NOT NULL DEFAULT 0,
  price_max   INTEGER NOT NULL DEFAULT 0,
  icon        TEXT DEFAULT 'jacket',
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- ═══════════════════════════════════════════════════════════════
-- 3. PRODUCT_COLORS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_colors (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  hex         TEXT NOT NULL DEFAULT '#000000',
  g1          TEXT DEFAULT '#FFFFFF',
  g2          TEXT DEFAULT '#EEEEEE',
  sort_order  INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_colors_product ON product_colors(product_id);

-- ═══════════════════════════════════════════════════════════════
-- 4. PRODUCT_SKUS — one row per color × size combination
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_skus (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id     UUID NOT NULL REFERENCES product_colors(id) ON DELETE CASCADE,
  size         TEXT NOT NULL,
  sku_code     TEXT NOT NULL UNIQUE,
  price        INTEGER NOT NULL DEFAULT 0,
  stock        INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_product_skus_product ON product_skus(product_id);
CREATE INDEX IF NOT EXISTS idx_product_skus_color ON product_skus(color_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. PRODUCT_IMAGES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id    UUID REFERENCES product_colors(id) ON DELETE SET NULL,
  url         TEXT NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. ORDERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  province        TEXT NOT NULL,
  address         TEXT NOT NULL,
  notes           TEXT,
  total           INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'معلق'
                  CHECK (status IN ('معلق', 'مؤكد', 'قيد التوصيل', 'مُسلّم', 'ملغى')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 7. ORDER_ITEMS — snapshot of product details at order time
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  sku_id        UUID REFERENCES product_skus(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  color_name    TEXT NOT NULL DEFAULT '',
  color_hex     TEXT DEFAULT '#000000',
  g1            TEXT DEFAULT '#FFFFFF',
  g2            TEXT DEFAULT '#EEEEEE',
  size          TEXT NOT NULL DEFAULT '',
  sku_code      TEXT DEFAULT '',
  qty           INTEGER NOT NULL DEFAULT 1,
  unit_price    INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ═══════════════════════════════════════════════════════════════
-- 8. SETTINGS — key-value store for platform configuration
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '9647801234567'),
  ('about_text', 'درزن — منصة جملة الملابس الموثوقة في العراق.'),
  ('return_policy', ''),
  ('store_name', 'درزن')
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- 9. STOCK DECREMENT FUNCTION (used by orders controller)
-- ═══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION decrement_stock(p_sku_id UUID, p_qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE product_skus
  SET stock = GREATEST(0, stock - p_qty)
  WHERE id = p_sku_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ────────────────────────────────────────────────
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ─── PRODUCTS — public read, admin/editor write ─────────────
CREATE POLICY "Public can read active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can read all products"
  ON products FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admin/editor can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admin/editor can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admin/editor can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ─── PRODUCT_COLORS — same as products ──────────────────────
CREATE POLICY "Public can read product colors"
  ON product_colors FOR SELECT
  USING (true);

CREATE POLICY "Admin/editor can manage colors"
  ON product_colors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ─── PRODUCT_SKUS — same as products ────────────────────────
CREATE POLICY "Public can read product SKUs"
  ON product_skus FOR SELECT
  USING (true);

CREATE POLICY "Admin/editor can manage SKUs"
  ON product_skus FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ─── PRODUCT_IMAGES — public read, admin write ─────────────
CREATE POLICY "Public can read product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Admin/editor can manage images"
  ON product_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

-- ─── ORDERS — anyone can insert, admin can read/manage ──────
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read orders"
  ON orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete orders"
  ON orders FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── ORDER_ITEMS ─────────────────────────────────────────────
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can read order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete order items"
  ON order_items FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── SETTINGS ────────────────────────────────────────────────
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admin can update settings"
  ON settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can insert settings"
  ON settings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- 11. SUPABASE STORAGE BUCKET for product images
-- ═══════════════════════════════════════════════════════════════
-- Run this in the Supabase Dashboard > Storage, or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can read, authenticated admin/editor can upload
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin/editor upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Admin/editor delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );
