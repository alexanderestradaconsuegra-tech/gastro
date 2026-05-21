-- Atomically increment cash session totals to prevent lost-update races
-- when multiple closeTable calls happen concurrently.
CREATE OR REPLACE FUNCTION public.increment_cash_session(
  p_amount_col TEXT,
  p_amount     INTEGER,
  p_tips       INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id
  FROM public.cash_sessions
  WHERE status = 'open'
  ORDER BY opened_at DESC
  LIMIT 1;

  IF v_id IS NULL THEN
    RETURN;
  END IF;

  -- Use dynamic SQL for the column name; validate against whitelist to prevent injection
  IF p_amount_col NOT IN ('cash_total', 'card_total', 'transfer_total') THEN
    RAISE EXCEPTION 'Invalid amount column: %', p_amount_col;
  END IF;

  EXECUTE format(
    'UPDATE public.cash_sessions SET %I = %I + $1, tips_total = tips_total + $2 WHERE id = $3 AND status = ''open''',
    p_amount_col, p_amount_col
  ) USING p_amount, p_tips, v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_cash_session(TEXT, INTEGER, INTEGER) TO authenticated;
