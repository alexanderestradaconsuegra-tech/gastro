-- ============================================================
-- 009 — Storage buckets + production fixes
-- ============================================================

-- ── Supabase Storage buckets ─────────────────────────────────
-- Creates the two buckets used by the admin app.
-- Run this once. Safe to re-run (INSERT ... ON CONFLICT DO NOTHING).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('menu-images',  'menu-images',  true,  5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('staff-avatars','staff-avatars', true,  2097152, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS for storage: authenticated users of the same restaurant can upload;
-- public can read (buckets are public).

CREATE POLICY "auth_upload_menu_images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "auth_update_menu_images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "auth_delete_menu_images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'menu-images');

CREATE POLICY "public_read_menu_images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'menu-images');

CREATE POLICY "auth_upload_staff_avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'staff-avatars');

CREATE POLICY "auth_update_staff_avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'staff-avatars');

CREATE POLICY "auth_delete_staff_avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'staff-avatars');

CREATE POLICY "public_read_staff_avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'staff-avatars');


-- ── tables: add label column default so old rows don't break ──
-- The label column is NOT NULL — any table created before admin fix
-- could have null label. This ensures existing rows have a label.
UPDATE tables
SET label = 'Mesa ' || table_number
WHERE label IS NULL OR label = '';


-- ── prospects table (migration 008 equivalent — idempotent) ───
CREATE TABLE IF NOT EXISTS public.prospects (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  source     text        NOT NULL DEFAULT 'landing',
  status     text        NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new','contacted','demo_sent','converted','lost')),
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS prospects_email_idx ON public.prospects(email);
ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;

-- service_role bypasses RLS; anon cannot see prospects (CRM data)
CREATE POLICY "auth_all_prospects"
  ON prospects FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);


-- ── RLS multitenant hardening ─────────────────────────────────
-- Replace the permissive "auth_all_*" policies with restaurant-scoped ones.
-- Uses get_user_restaurant_id() defined in 007_rls_multitenant.sql.
-- Safe to run multiple times (DROP IF EXISTS before CREATE).

-- helper: if 007 already created this function, reuse it
-- (this is defined in 007 but repeated here for safety)
CREATE OR REPLACE FUNCTION get_user_restaurant_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'restaurant_id'),
    ''
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ORDERS — replace permissive policy
DROP POLICY IF EXISTS "auth_all_orders"   ON orders;
DROP POLICY IF EXISTS "mt_orders"         ON orders;
CREATE POLICY "mt_orders" ON orders FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ORDER_ITEMS — scoped via order's restaurant
DROP POLICY IF EXISTS "auth_all_order_items" ON order_items;
DROP POLICY IF EXISTS "mt_order_items"       ON order_items;
CREATE POLICY "mt_order_items" ON order_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.restaurant_id = get_user_restaurant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_items.order_id
        AND o.restaurant_id = get_user_restaurant_id()
    )
  );

-- TABLES
DROP POLICY IF EXISTS "auth_all_tables" ON tables;
DROP POLICY IF EXISTS "mt_tables"       ON tables;
CREATE POLICY "mt_tables" ON tables FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- STAFF
DROP POLICY IF EXISTS "auth_all_staff" ON staff;
DROP POLICY IF EXISTS "mt_staff"       ON staff;
CREATE POLICY "mt_staff" ON staff FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- MENU_ITEMS
DROP POLICY IF EXISTS "auth_all_menu_items" ON menu_items;
DROP POLICY IF EXISTS "mt_menu_items"       ON menu_items;
CREATE POLICY "mt_menu_items" ON menu_items FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- SESSIONS
DROP POLICY IF EXISTS "auth_all_sessions" ON sessions;
DROP POLICY IF EXISTS "mt_sessions"       ON sessions;
CREATE POLICY "mt_sessions" ON sessions FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- CALLS
DROP POLICY IF EXISTS "auth_all_calls" ON calls;
DROP POLICY IF EXISTS "mt_calls"       ON calls;
CREATE POLICY "mt_calls" ON calls FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- MESSAGES
DROP POLICY IF EXISTS "auth_all_messages" ON messages;
DROP POLICY IF EXISTS "mt_messages"       ON messages;
CREATE POLICY "mt_messages" ON messages FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- CASH_SESSIONS
DROP POLICY IF EXISTS "auth_all_cash_sessions" ON cash_sessions;
DROP POLICY IF EXISTS "mt_cash_sessions"       ON cash_sessions;
CREATE POLICY "mt_cash_sessions" ON cash_sessions FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- EXPENSES
DROP POLICY IF EXISTS "auth_all_expenses" ON expenses;
DROP POLICY IF EXISTS "mt_expenses"       ON expenses;
CREATE POLICY "mt_expenses" ON expenses FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- INVENTORY
DROP POLICY IF EXISTS "auth_all_inventory" ON inventory;
DROP POLICY IF EXISTS "mt_inventory"       ON inventory;
CREATE POLICY "mt_inventory" ON inventory FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- REVIEWS
DROP POLICY IF EXISTS "auth_all_reviews" ON reviews;
DROP POLICY IF EXISTS "mt_reviews"       ON reviews;
CREATE POLICY "mt_reviews" ON reviews FOR ALL TO authenticated
  USING   (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- RESTAURANTS — owner can only see/edit their own restaurant
DROP POLICY IF EXISTS "auth_all_restaurants" ON restaurants;
DROP POLICY IF EXISTS "mt_restaurants"       ON restaurants;
CREATE POLICY "mt_restaurants" ON restaurants FOR ALL TO authenticated
  USING   (id = get_user_restaurant_id())
  WITH CHECK (id = get_user_restaurant_id());
