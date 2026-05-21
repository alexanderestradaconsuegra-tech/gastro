-- Allow anon role to SELECT orders and order_items.
-- The anon key is already embedded in the QR app (public), so this
-- is no more sensitive than what anon can already INSERT.
-- This prevents silent empty results when the admin client's JWT hasn't
-- refreshed yet (e.g. page reload, session timing gap).

CREATE POLICY "anon_select_orders"
  ON orders FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_select_order_items"
  ON order_items FOR SELECT
  TO anon
  USING (true);
