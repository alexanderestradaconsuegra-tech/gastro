-- ============================================================
-- GASTRO POS - Schema completo
-- Supabase / PostgreSQL
-- ============================================================

-- ─────────────────────────────────────────────
-- RESTAURANTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  legal_name       TEXT,
  rut              TEXT,
  address          TEXT,
  phone            TEXT,
  website          TEXT,
  google_review_url TEXT,
  settings         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- STAFF (before tables to allow FK from tables)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'camarero', 'cocina', 'caja')),
  pin_hash      TEXT,
  shift         TEXT,
  status        TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo', 'Pausa', 'Fuera')),
  avatar_url    TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tables (
  id                 SERIAL PRIMARY KEY,
  restaurant_id      TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number       INTEGER NOT NULL,
  label              TEXT NOT NULL,
  zone               TEXT NOT NULL,
  qr_token           TEXT UNIQUE NOT NULL,
  status             TEXT NOT NULL DEFAULT 'Libre' CHECK (
    status IN (
      'Libre','Comiendo','Esperando plato','Pedido nuevo',
      'Camarero ocupado','Solicita cobro','Preparando','Cocina llama'
    )
  ),
  guests             INTEGER NOT NULL DEFAULT 0,
  waiter_id          UUID REFERENCES staff(id) ON DELETE SET NULL,
  bill_total         INTEGER NOT NULL DEFAULT 0,
  tip_accepted       BOOLEAN NOT NULL DEFAULT FALSE,
  tip_amount         INTEGER NOT NULL DEFAULT 0,
  active             BOOLEAN NOT NULL DEFAULT TRUE,
  last_activity_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, table_number)
);

-- ─────────────────────────────────────────────
-- MENU ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
  id              TEXT PRIMARY KEY,
  restaurant_id   TEXT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  subtitle        TEXT,
  description     TEXT,
  category        TEXT NOT NULL,
  price           INTEGER NOT NULL,
  avg_prep_minutes INTEGER NOT NULL DEFAULT 15,
  kcal            INTEGER,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  allergens       TEXT[] NOT NULL DEFAULT '{}',
  wine_pair       TEXT,
  image_url       TEXT,
  stock_status    TEXT NOT NULL DEFAULT 'OK' CHECK (stock_status IN ('OK', 'Bajo', 'Agotado')),
  available       BOOLEAN NOT NULL DEFAULT TRUE,
  visible_client  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id),
  table_id      INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  qr_token      TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at     TIMESTAMPTZ,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed'))
);

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id),
  session_id    TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  table_id      INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  waiter_id     UUID REFERENCES staff(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'received' CHECK (
    status IN ('received', 'prep', 'plating', 'served', 'cancelled')
  ),
  priority      TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Alta', 'Crítica')),
  channel       TEXT NOT NULL DEFAULT 'QR Mesa',
  eta_minutes   INTEGER NOT NULL DEFAULT 18,
  notes         TEXT,
  total         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           SERIAL PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id) ON DELETE SET NULL,
  dish_name    TEXT NOT NULL,
  qty          INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price   INTEGER NOT NULL CHECK (unit_price >= 0),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'prep', 'ready', 'served')
  ),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CALLS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS calls (
  id            TEXT PRIMARY KEY DEFAULT ('C-' || substr(gen_random_uuid()::TEXT, 1, 8)),
  restaurant_id TEXT REFERENCES restaurants(id),
  table_id      INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  session_id    TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  waiter_id     UUID REFERENCES staff(id) ON DELETE SET NULL,
  source        TEXT NOT NULL DEFAULT 'mesa' CHECK (source IN ('mesa', 'cocina')),
  call_type     TEXT NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Alta', 'Crítica')),
  status        TEXT NOT NULL DEFAULT 'Pendiente' CHECK (
    status IN ('Pendiente', 'En atención', 'Resuelto')
  ),
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID REFERENCES staff(id) ON DELETE SET NULL
);

-- ─────────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            SERIAL PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id),
  table_id      INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  session_id    TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  waiter_id     UUID REFERENCES staff(id) ON DELETE SET NULL,
  from_role     TEXT NOT NULL DEFAULT 'Cliente' CHECK (from_role IN ('Cliente', 'Camarero', 'Cocina')),
  message_type  TEXT CHECK (message_type IN ('Cobro', 'Alergia', 'Pedido', 'Nota cocina', 'General')),
  text          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'urgente', 'resuelto')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- CASH SESSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cash_sessions (
  id               TEXT PRIMARY KEY,
  restaurant_id    TEXT REFERENCES restaurants(id),
  opened_by        UUID REFERENCES staff(id) ON DELETE SET NULL,
  closed_by        UUID REFERENCES staff(id) ON DELETE SET NULL,
  turn             TEXT NOT NULL CHECK (turn IN ('Día', 'Noche', 'Full')),
  status           TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opening_cash     INTEGER NOT NULL DEFAULT 0 CHECK (opening_cash >= 0),
  cash_total       INTEGER NOT NULL DEFAULT 0,
  card_total       INTEGER NOT NULL DEFAULT 0,
  transfer_total   INTEGER NOT NULL DEFAULT 0,
  tips_total       INTEGER NOT NULL DEFAULT 0,
  expenses_total   INTEGER NOT NULL DEFAULT 0,
  opened_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at        TIMESTAMPTZ
);

-- ─────────────────────────────────────────────
-- EXPENSES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id               TEXT PRIMARY KEY DEFAULT ('E-' || substr(gen_random_uuid()::TEXT, 1, 8)),
  restaurant_id    TEXT REFERENCES restaurants(id),
  cash_session_id  TEXT REFERENCES cash_sessions(id) ON DELETE SET NULL,
  staff_id         UUID REFERENCES staff(id) ON DELETE SET NULL,
  expense_type     TEXT NOT NULL DEFAULT 'Caja' CHECK (expense_type IN ('Caja', 'Proveedor', 'Otro')),
  detail           TEXT NOT NULL,
  amount           INTEGER NOT NULL CHECK (amount > 0),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- INVENTORY
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory (
  id            TEXT PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id),
  name          TEXT NOT NULL,
  category      TEXT,
  stock         DECIMAL NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock     DECIMAL NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  unit          TEXT NOT NULL DEFAULT 'kg',
  linked_dishes TEXT[] NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id),
  session_id    TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  table_id      INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  waiter_id     UUID REFERENCES staff(id) ON DELETE SET NULL,
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  source        TEXT NOT NULL DEFAULT 'table_qr',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tables_qr_token        ON tables (qr_token);
CREATE INDEX IF NOT EXISTS idx_orders_table_id         ON orders (table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status           ON orders (status);
CREATE INDEX IF NOT EXISTS idx_calls_status            ON calls (status);
CREATE INDEX IF NOT EXISTS idx_calls_table_id          ON calls (table_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id    ON orders (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_sessions_table_id       ON sessions (table_id);
CREATE INDEX IF NOT EXISTS idx_messages_table_id       ON messages (table_id);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- FUNCIÓN: generate_order_id()
-- ============================================================
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'ORD-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT COUNT(*) > 0 INTO exists FROM orders WHERE id = new_id;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE restaurants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables        ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff         ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls         ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;

-- ── service_role: acceso total (bypass RLS) ──────────────────
-- service_role bypasses RLS by default in Supabase, no policies needed.

-- ── anon: solo lectura mínima ─────────────────────────────────

-- menu_items: anon puede leer ítems visibles al cliente
CREATE POLICY "anon_read_menu_items"
  ON menu_items FOR SELECT
  TO anon
  USING (visible_client = TRUE AND available = TRUE);

-- tables: anon puede leer por qr_token (para validar escaneo QR)
CREATE POLICY "anon_read_tables_by_qr"
  ON tables FOR SELECT
  TO anon
  USING (active = TRUE);

-- ── authenticated: acceso con JWT de Supabase ─────────────────

CREATE POLICY "auth_all_restaurants"
  ON restaurants FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_tables"
  ON tables FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_staff"
  ON staff FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_menu_items"
  ON menu_items FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_sessions"
  ON sessions FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_orders"
  ON orders FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_order_items"
  ON order_items FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_calls"
  ON calls FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_messages"
  ON messages FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_cash_sessions"
  ON cash_sessions FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_expenses"
  ON expenses FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

CREATE POLICY "auth_all_reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- ============================================================
-- REALTIME: habilitar publicaciones
-- ============================================================
-- Ejecutar como superuser o via Supabase dashboard si falla
DO $$
BEGIN
  -- orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  -- calls
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'calls'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE calls;
  END IF;

  -- messages
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  -- tables
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'tables'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tables;
  END IF;
END $$;
