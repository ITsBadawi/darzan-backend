-- ═══════════════════════════════════════════════════════════════
-- Darzan Seed Data — Demo suppliers, products, and SKU generation (v2.0)
-- Run AFTER migration.sql in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Insert Suppliers ───────────────────────────────────

INSERT INTO suppliers (id, supplier_code, name, phone, notes, is_active) VALUES
  ('33333333-0001-0001-0001-000000000001', 'SUP-A', 'مخزن أبو علي', '07812345678', 'متخصص بالملابس الرجالية والشتوية', true),
  ('33333333-0002-0001-0001-000000000002', 'SUP-B', 'شركة النخبة', '07798765432', 'أزياء نسائية وفساتين جملة', true),
  ('33333333-0003-0001-0001-000000000003', 'SUP-LEGACY', 'المنتجات السابقة', '', 'سجل افتراضي للمنتجات القديمة', false)
ON CONFLICT (supplier_code) DO NOTHING;

-- ─── 2. Insert Products ─────────────────────────────────────

INSERT INTO products (id, product_number, supplier_id, name, category, description, price_min, price_max, icon) VALUES
  ('11111111-1111-1111-1111-111111111101', 1, '33333333-0001-0001-0001-000000000001', 'كنزة شتوية صوف', 'رجالي', 'كنزة شتوية دافئة من خامة صوف عالية الجودة، مناسبة لأجواء الشتاء الباردة. قصّة مريحة تناسب جميع الأذواق، ومتوفرة بعدة ألوان ومقاسات تبدأ من S وحتى 4XL.', 25000, 30000, 'jacket'),
  ('11111111-1111-1111-1111-111111111102', 2, '33333333-0002-0001-0001-000000000002', 'فستان سهرة مطرز', 'فساتين', 'فستان سهرة أنيق بتطريز يدوي دقيق، قصّة تناسب المناسبات الخاصة، متوفر بعدة ألوان ومقاسات.', 45000, 45000, 'dress'),
  ('11111111-1111-1111-1111-111111111103', 3, '33333333-0001-0001-0001-000000000001', 'طقم أطفال شتوي', 'أطفال', 'طقم شتوي دافئ ومريح للأطفال، خامة قطنية ناعمة على البشرة، متوفر بعدة ألوان وأعمار.', 18000, 18000, 'child'),
  ('11111111-1111-1111-1111-111111111104', 4, '33333333-0002-0001-0001-000000000002', 'بيجاما منزلية قطن', 'بيتي', 'بيجاما منزلية من قطن ناعم ومريح، مثالية للاستخدام اليومي في المنزل.', 15000, 15000, 'home'),
  ('11111111-1111-1111-1111-111111111105', 5, '33333333-0001-0001-0001-000000000001', 'قميص رجالي كلاسيك', 'رجالي', 'قميص رجالي كلاسيك بقصّة أنيقة يناسب الدوام والمناسبات، خامة قطنية عالية الجودة.', 20000, 20000, 'jacket'),
  ('11111111-1111-1111-1111-111111111106', 6, '33333333-0002-0001-0001-000000000002', 'عباية سوداء أنيقة', 'نسائي', 'عباية سوداء بقصّة أنيقة وخامة فاخرة، تصميم بسيط يناسب مختلف المناسبات.', 35000, 35000, 'abaya'),
  ('11111111-1111-1111-1111-111111111107', 7, '33333333-0001-0001-0001-000000000001', 'بنطلون قماش رجالي', 'رجالي', 'بنطلون قماش رجالي بقصّة مستقيمة مريحة، مناسب للدوام والاستخدام اليومي.', 22000, 22000, 'jacket'),
  ('11111111-1111-1111-1111-111111111108', 8, '33333333-0002-0001-0001-000000000002', 'فستان يومي قطني', 'نسائي', 'فستان يومي بخامة قطنية مريحة وقصّة عملية تناسب الاستخدام اليومي.', 28000, 28000, 'dress')
ON CONFLICT (id) DO NOTHING;

-- ─── 3. Insert Colors ───────────────────────────────────────

-- كنزة شتوية صوف (p1)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111101', 'RED', 'أحمر', '#8B2E1F', '#E8CFC6', '#D8AC9C', 0),
  ('22222222-0001-0001-0001-000000000002', '11111111-1111-1111-1111-111111111101', 'TEAL', 'أخضر تيل', '#1E4238', '#D9E3DC', '#B9CBC0', 1),
  ('22222222-0001-0001-0001-000000000003', '11111111-1111-1111-1111-111111111101', 'BLACK', 'أسود', '#2B2B2B', '#DCDAD6', '#BEBAB2', 2),
  ('22222222-0001-0001-0001-000000000004', '11111111-1111-1111-1111-111111111101', 'BEIGE', 'بيج', '#C9C2AE', '#EFE8D8', '#DECEB0', 3)
ON CONFLICT (id) DO NOTHING;

-- فستان سهرة مطرز (p2)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0002-0001-0001-000000000001', '11111111-1111-1111-1111-111111111102', 'CLAY', 'قرميدي', '#A8452F', '#EAD9D2', '#D9BDB1', 0),
  ('22222222-0002-0001-0001-000000000002', '11111111-1111-1111-1111-111111111102', 'BLACK', 'أسود', '#2B2B2B', '#DCDAD6', '#BEBAB2', 1)
ON CONFLICT (id) DO NOTHING;

-- طقم أطفال شتوي (p3)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0003-0001-0001-000000000001', '11111111-1111-1111-1111-111111111103', 'GREEN', 'أخضر', '#3D6E5C', '#DCE6DD', '#C4D3C6', 0),
  ('22222222-0003-0001-0001-000000000002', '11111111-1111-1111-1111-111111111103', 'BRASS', 'ذهبي', '#C08A3E', '#EFE2CC', '#DCC59B', 1),
  ('22222222-0003-0001-0001-000000000003', '11111111-1111-1111-1111-111111111103', 'RED', 'أحمر', '#8B2E1F', '#E8CFC6', '#D8AC9C', 2)
ON CONFLICT (id) DO NOTHING;

-- بيجاما منزلية قطن (p4)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0004-0001-0001-000000000001', '11111111-1111-1111-1111-111111111104', 'BEIGE', 'بيج', '#C9C2AE', '#EFE8D8', '#DECEB0', 0),
  ('22222222-0004-0001-0001-000000000002', '11111111-1111-1111-1111-111111111104', 'TEAL', 'أخضر تيل', '#1E4238', '#D9E3DC', '#B9CBC0', 1)
ON CONFLICT (id) DO NOTHING;

-- قميص رجالي كلاسيك (p5)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0005-0001-0001-000000000001', '11111111-1111-1111-1111-111111111105', 'WHITE', 'أبيض', '#FFFDF8', '#F3EFE3', '#E4DBC2', 0),
  ('22222222-0005-0001-0001-000000000002', '11111111-1111-1111-1111-111111111105', 'TEAL', 'أخضر تيل', '#1E4238', '#D9E3DC', '#B9CBC0', 1),
  ('22222222-0005-0001-0001-000000000003', '11111111-1111-1111-1111-111111111105', 'BLACK', 'أسود', '#2B2B2B', '#DCDAD6', '#BEBAB2', 2)
ON CONFLICT (id) DO NOTHING;

-- عباية سوداء أنيقة (p6)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0006-0001-0001-000000000001', '11111111-1111-1111-1111-111111111106', 'BLACK', 'أسود', '#2B2B2B', '#DCDAD6', '#BEBAB2', 0)
ON CONFLICT (id) DO NOTHING;

-- بنطلون قماش رجالي (p7)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0007-0001-0001-000000000001', '11111111-1111-1111-1111-111111111107', 'BLACK', 'أسود', '#2B2B2B', '#DEDBD2', '#C7C2B4', 0),
  ('22222222-0007-0001-0001-000000000002', '11111111-1111-1111-1111-111111111107', 'GRAY', 'رمادي', '#5C6D64', '#DEDBD2', '#C7C2B4', 1)
ON CONFLICT (id) DO NOTHING;

-- فستان يومي قطني (p8)
INSERT INTO product_colors (id, product_id, code, name, hex, g1, g2, sort_order) VALUES
  ('22222222-0008-0001-0001-000000000001', '11111111-1111-1111-1111-111111111108', 'BRASS', 'ذهبي', '#C08A3E', '#EFE2CC', '#DCC59B', 0),
  ('22222222-0008-0001-0001-000000000002', '11111111-1111-1111-1111-111111111108', 'CLAY', 'قرميدي', '#A8452F', '#EAD9D2', '#D9BDB1', 1)
ON CONFLICT (id) DO NOTHING;

-- ─── 4. Auto-generate SKUs (DZN-000001-RED-M) ──────────────

DO $$
DECLARE
  _sizes TEXT[] := ARRAY['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  _color RECORD;
  _product RECORD;
  _size TEXT;
  _i INTEGER;
  _price_bump INTEGER;
  _base_stock INTEGER;
BEGIN
  FOR _color IN SELECT pc.id AS color_id, pc.product_id, pc.code
                FROM product_colors pc
  LOOP
    SELECT price_min, price_max, product_number INTO _product FROM products WHERE id = _color.product_id;

    FOR _i IN 1..array_length(_sizes, 1) LOOP
      _size := _sizes[_i];

      IF _i >= 5 THEN
        _price_bump := GREATEST(
          ROUND((_product.price_max - _product.price_min) * 0.4),
          2000 * (_i - 4)
        );
      ELSE
        _price_bump := 0;
      END IF;

      -- Random demo stock between 0 and 15
      _base_stock := CASE WHEN random() > 0.22 THEN (random() * 15)::int + 1 ELSE 0 END;

      INSERT INTO product_skus (product_id, color_id, size, sku_code, price, stock, is_available)
      VALUES (
        _color.product_id,
        _color.color_id,
        _size,
        'DZN-' || LPAD(_product.product_number::text, 6, '0') || '-' || _color.code || '-' || _size,
        _product.price_min + _price_bump,
        _base_stock,
        true
      )
      ON CONFLICT (sku_code) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- Done! Seeded with suppliers, products, and new SKU codes format.
-- ═══════════════════════════════════════════════════════════════
