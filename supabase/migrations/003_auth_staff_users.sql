-- ============================================================
-- GASTRO POS - Usuarios de Supabase Auth para staff demo
-- PIN: 1234 → bcrypt hash $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

-- Insertar usuarios en auth.users usando el mismo hash bcrypt del PIN
-- Esto permite autenticar con supabase.auth.signInWithPassword({ email, password: '1234' })

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
)
VALUES
(
  gen_random_uuid(),
  'admin@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
),
(
  gen_random_uuid(),
  'marco@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
),
(
  gen_random_uuid(),
  'isabella@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
),
(
  gen_random_uuid(),
  'tomas@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
),
(
  gen_random_uuid(),
  'cocina@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
),
(
  gen_random_uuid(),
  'caja@nido.cl',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"restaurant_id":"nido"}',
  NOW(), NOW(),
  'authenticated', 'authenticated'
)
ON CONFLICT (email) DO NOTHING;
