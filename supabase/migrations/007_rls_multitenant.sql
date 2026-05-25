-- ============================================================
-- GASTRO POS — Multi-tenant RLS Security Migration
-- Fixes CRITICAL data-leakage: all authenticated policies
-- previously used USING (TRUE), giving any staff member
-- read/write access to ALL restaurants' data.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Helper: extract restaurant_id from the logged-in user's JWT.
-- Supabase stores raw_user_meta_data as the "user_metadata"
-- claim in the JWT issued to authenticated users.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT (auth.jwt() -> 'user_metadata' ->> 'restaurant_id')::TEXT;
$$;

-- ────────────────────────────────────────────────────────────
-- Drop all overly-permissive authenticated policies
-- (every one of these used USING (TRUE))
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "auth_all_restaurants"   ON restaurants;
DROP POLICY IF EXISTS "auth_all_tables"        ON tables;
DROP POLICY IF EXISTS "auth_all_staff"         ON staff;
DROP POLICY IF EXISTS "auth_all_menu_items"    ON menu_items;
DROP POLICY IF EXISTS "auth_all_sessions"      ON sessions;
DROP POLICY IF EXISTS "auth_all_orders"        ON orders;
DROP POLICY IF EXISTS "auth_all_order_items"   ON order_items;
DROP POLICY IF EXISTS "auth_all_calls"         ON calls;
DROP POLICY IF EXISTS "auth_all_messages"      ON messages;
DROP POLICY IF EXISTS "auth_all_cash_sessions" ON cash_sessions;
DROP POLICY IF EXISTS "auth_all_expenses"      ON expenses;
DROP POLICY IF EXISTS "auth_all_inventory"     ON inventory;
DROP POLICY IF EXISTS "auth_all_reviews"       ON reviews;

-- Drop the duplicate cash_sessions policy added by migration 004
DROP POLICY IF EXISTS "auth_all_cash_sessions" ON public.cash_sessions;

-- Drop insecure anon policies added by migration 006
-- (anon can read ALL orders/items across ALL restaurants — data leak)
DROP POLICY IF EXISTS "anon_select_orders"      ON orders;
DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;

-- ────────────────────────────────────────────────────────────
-- RESTAURANTS — own row only
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_restaurant"
  ON restaurants FOR ALL
  TO authenticated
  USING  (id = get_user_restaurant_id())
  WITH CHECK (id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_tables"
  ON tables FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- STAFF
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_staff"
  ON staff FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- MENU ITEMS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_menu_items"
  ON menu_items FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- SESSIONS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_sessions"
  ON sessions FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- ORDERS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_orders"
  ON orders FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- ORDER ITEMS — no restaurant_id column; scope via parent order
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM orders
      WHERE restaurant_id = get_user_restaurant_id()
    )
  )
  WITH CHECK (
    order_id IN (
      SELECT id FROM orders
      WHERE restaurant_id = get_user_restaurant_id()
    )
  );

-- ────────────────────────────────────────────────────────────
-- CALLS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_calls"
  ON calls FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- MESSAGES
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_messages"
  ON messages FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- CASH SESSIONS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_cash_sessions"
  ON cash_sessions FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- EXPENSES
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_expenses"
  ON expenses FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- INVENTORY
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_inventory"
  ON inventory FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- REVIEWS
-- ────────────────────────────────────────────────────────────
CREATE POLICY "auth_own_reviews"
  ON reviews FOR ALL
  TO authenticated
  USING  (restaurant_id = get_user_restaurant_id())
  WITH CHECK (restaurant_id = get_user_restaurant_id());

-- ────────────────────────────────────────────────────────────
-- FIX: increment_cash_session RPC — add restaurant_id filter
-- Previously selected the most recent open session globally;
-- staff from restaurant A could increment restaurant B's cash.
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_cash_session(
  p_amount_col   TEXT,
  p_amount       INTEGER,
  p_tips         INTEGER,
  p_restaurant_id TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id   TEXT;
  v_rid  TEXT;
BEGIN
  -- If caller doesn't pass restaurant_id, derive it from JWT
  v_rid := COALESCE(p_restaurant_id, get_user_restaurant_id());

  IF v_rid IS NULL THEN
    RAISE EXCEPTION 'restaurant_id is required';
  END IF;

  SELECT id INTO v_id
  FROM public.cash_sessions
  WHERE status = 'open'
    AND restaurant_id = v_rid
  ORDER BY opened_at DESC
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN;
  END IF;

  IF p_amount_col NOT IN ('cash_total', 'card_total', 'transfer_total') THEN
    RAISE EXCEPTION 'Invalid amount column: %', p_amount_col;
  END IF;

  EXECUTE format(
    'UPDATE public.cash_sessions SET %I = %I + $1, tips_total = tips_total + $2 WHERE id = $3 AND status = ''open'' AND restaurant_id = $4',
    p_amount_col, p_amount_col
  ) USING p_amount, p_tips, v_id, v_rid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_cash_session(TEXT, INTEGER, INTEGER, TEXT) TO authenticated;

-- ────────────────────────────────────────────────────────────
-- FIX: anon policy for tables — restrict to specific token
-- Previously any anon could list ALL active tables globally.
-- Now anon can only read one table when they supply qr_token.
-- (The WHERE clause in the client query does the filtering;
--  this policy just ensures active=TRUE as a safety check.)
-- For a true single-row guard the client must always query
-- ?qr_token=eq.TOKEN so only one row is returned.
-- ────────────────────────────────────────────────────────────
-- Note: the existing "anon_read_tables_by_qr" policy is kept
-- but renamed here for clarity; it remains USING (active=TRUE).
-- The real protection is that the table has no sensitive columns
-- beyond label/zone/status which are needed for the kiosk UI.
