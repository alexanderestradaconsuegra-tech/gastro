-- ============================================================
-- GASTRO POS - Seed data para restaurante demo "nido"
-- ============================================================

-- ─────────────────────────────────────────────
-- RESTAURANTE
-- ─────────────────────────────────────────────
INSERT INTO restaurants (id, name, legal_name, rut, address, phone, website, google_review_url)
VALUES (
  'nido',
  'NIDO',
  'NIDO SpA',
  '76.543.210-9',
  'Av. Italia 1450, Providencia, Santiago',
  '+56 2 2345 6789',
  'nido.cl',
  'https://g.page/r/CODIGO-DE-RESTAURANTE/review'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- STAFF
-- PINs: todos usan '1234' para demo
-- Hash bcrypt de '1234' con cost 10:
-- $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ─────────────────────────────────────────────
INSERT INTO staff (restaurant_id, name, email, role, pin_hash, shift, status, phone) VALUES
(
  'nido', 'Marco Ferrán', 'marco@nido.cl', 'camarero',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '18:00–00:00', 'Activo', '+56 9 1234 5678'
),
(
  'nido', 'Isabella Ruiz', 'isabella@nido.cl', 'camarero',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '19:00–01:00', 'Activo', '+56 9 2345 6789'
),
(
  'nido', 'Tomás Vera', 'tomas@nido.cl', 'camarero',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '18:00–00:00', 'Activo', '+56 9 3456 7890'
),
(
  'nido', 'Valentina Cruz', 'admin@nido.cl', 'admin',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Full', 'Activo', '+56 9 4567 8901'
),
(
  'nido', 'Chef Roberto', 'cocina@nido.cl', 'cocina',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '17:00–01:00', 'Activo', '+56 9 5678 9012'
),
(
  'nido', 'Ana Soto', 'caja@nido.cl', 'caja',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '18:00–00:00', 'Activo', '+56 9 6789 0123'
)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────
-- MESAS (9 mesas, 4 zonas)
-- ─────────────────────────────────────────────
INSERT INTO tables (restaurant_id, table_number, label, zone, qr_token) VALUES
('nido', 1, 'Mesa 1',     'Salón',   'T001'),
('nido', 2, 'Mesa 2',     'Salón',   'B2M18'),
('nido', 3, 'Mesa 3',     'Terraza', 'T003'),
('nido', 4, 'Mesa 4',     'Terraza', 'T004'),
('nido', 5, 'Mesa 5',     'Bar',     'T005'),
('nido', 6, 'Mesa 6',     'Bar',     'T006'),
('nido', 7, 'Mesa 7',     'Salón',   'A7K92'),
('nido', 8, 'Mesa 8',     'VIP',     'T008'),
('nido', 9, 'Mesa VIP 9', 'VIP',     'VIP09')
ON CONFLICT (restaurant_id, table_number) DO NOTHING;

-- ─────────────────────────────────────────────
-- MENÚ COMPLETO (12 platos)
-- ─────────────────────────────────────────────
INSERT INTO menu_items (
  id, restaurant_id, name, subtitle, description,
  category, price, avg_prep_minutes, kcal,
  tags, allergens, wine_pair, image_url, sort_order
) VALUES
(
  'burrata', 'nido',
  'Burrata di Bufala', 'Tomate heirloom · albahaca · AOVE',
  'Cremosa, fresca y perfecta para compartir.',
  'Entradas', 14500, 8, 420,
  '{TOP,Vegetariano}', '{Lácteos}', 'Prosecco brut',
  'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=600&auto=format&fit=crop',
  10
),
(
  'carpaccio', 'nido',
  'Carpaccio di Manzo', 'Filete · rúcula · parmesano 36m',
  'Corte fino, cítrico y salino.',
  'Entradas', 16800, 10, 360,
  '{Nuevo}', '{Lácteos}', 'Chianti clásico',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop',
  20
),
(
  'arancini', 'nido',
  'Arancini al Tartufo', 'Risotto frito · fontina · trufa negra',
  'Crujiente por fuera, cremoso por dentro.',
  'Entradas', 12900, 12, 510,
  '{CHEF,Vegetariano}', '{Gluten,Lácteos,Huevo}', 'Pinot Grigio',
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=600&auto=format&fit=crop',
  30
),
(
  'tagliatelle', 'nido',
  'Tagliatelle al Ragù', 'Pasta fresca · ternera 6h · parmesano',
  'Nuestra pasta más pedida.',
  'Principales', 21500, 18, 690,
  '{TOP}', '{Gluten,Lácteos,Huevo}', 'Sangiovese',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop',
  10
),
(
  'branzino', 'nido',
  'Branzino al Forno', 'Lubina · limone · olive · hinojo',
  'Pescado de horno, ligero y aromático.',
  'Principales', 28900, 25, 540,
  '{Sin gluten}', '{Pescado}', 'Vermentino',
  'https://images.unsplash.com/photo-1535400255456-984241443b29?q=80&w=600&auto=format&fit=crop',
  20
),
(
  'ossobuco', 'nido',
  'Osso Buco Milanese', 'Jarrete de ternera · gremolata · risotto',
  'Plato lento, intenso y elegante.',
  'Principales', 32500, 32, 820,
  '{CHEF}', '{Lácteos}', 'Barolo',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600&auto=format&fit=crop',
  30
),
(
  'risotto', 'nido',
  'Risotto ai Funghi', 'Carnaroli · porcini · grana padano',
  'Textura cremosa, perfume de bosque.',
  'Principales', 19800, 21, 620,
  '{Vegetariano}', '{Lácteos}', 'Nebbiolo joven',
  'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=600&auto=format&fit=crop',
  40
),
(
  'tiramisu', 'nido',
  'Tiramisù Classico', 'Mascarpone · espresso · savoiardi',
  'Capas suaves, café intenso y cacao amargo.',
  'Postres', 9500, 7, 410,
  '{TOP}', '{Gluten,Lácteos,Huevo,Cafeína}', 'Vin Santo',
  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=600&auto=format&fit=crop',
  10
),
(
  'panna', 'nido',
  'Panna Cotta', 'Vainilla bourbon · frutti rossi',
  'Fina, fría y sedosa.',
  'Postres', 8200, 6, 330,
  '{Sin gluten}', '{Lácteos}', 'Moscato d''Asti',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop',
  20
),
(
  'spritz', 'nido',
  'Spritz Aperol', 'Aperol · Prosecco · soda',
  'Aperitivo fresco, cítrico y amargo suave.',
  'Bebidas', 9800, 5, 180,
  '{2x1 18–20}', '{}', 'Arancini',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop',
  10
),
(
  'vino', 'nido',
  'Vino de la Casa', 'Tinto o blanco · copa',
  'Selección rotativa por temporada.',
  'Bebidas', 7500, 3, 125,
  '{}', '{Sulfitos}', 'Pasta fresca',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop',
  20
),
(
  'agua', 'nido',
  'San Pellegrino', 'Acqua frizzante 750ml',
  'Agua mineral con gas.',
  'Bebidas', 4500, 2, 0,
  '{}', '{}', 'Toda la carta',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=600&auto=format&fit=crop',
  30
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- INVENTARIO BÁSICO
-- ─────────────────────────────────────────────
INSERT INTO inventory (id, restaurant_id, name, category, stock, min_stock, unit, linked_dishes) VALUES
('inv-pasta',      'nido', 'Pasta fresca',    'Ingrediente',  18,   8,   'kg',       '{tagliatelle}'),
('inv-ternera',    'nido', 'Ternera jarrete', 'Carne',        12,   5,   'kg',       '{ossobuco,tagliatelle}'),
('inv-lubina',     'nido', 'Lubina entera',   'Pescado',       6,   3,   'kg',       '{branzino}'),
('inv-mascarpone', 'nido', 'Mascarpone',      'Lácteo',        4,   2,   'kg',       '{tiramisu}'),
('inv-prosecco',   'nido', 'Prosecco brut',   'Bar',          24,   6,   'botellas', '{spritz}'),
('inv-aperol',     'nido', 'Aperol',          'Bar',           8,   3,   'botellas', '{spritz}'),
('inv-carnaroli',  'nido', 'Arroz carnaroli', 'Ingrediente',  15,   5,   'kg',       '{risotto,arancini}'),
('inv-trufa',      'nido', 'Trufa negra',     'Especialidad',  0.8, 0.5, 'kg',       '{arancini}')
ON CONFLICT (id) DO NOTHING;
