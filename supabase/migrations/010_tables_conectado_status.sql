-- ============================================================
-- 010 — Add "Conectado" to tables.status allowed values
-- The table-connect API sets status = 'Conectado' when a customer
-- scans the QR code. This was missing from the original CHECK constraint.
-- ============================================================

ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_status_check;

ALTER TABLE tables ADD CONSTRAINT tables_status_check CHECK (
  status IN (
    'Libre',
    'Conectado',
    'Comiendo',
    'Esperando plato',
    'Pedido nuevo',
    'Camarero ocupado',
    'Solicita cobro',
    'Preparando',
    'Cocina llama'
  )
);
