-- Allow authenticated staff to read and write cash sessions
CREATE POLICY "auth_all_cash_sessions"
  ON public.cash_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add order_items to realtime publication so items stream instantly to admin
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
