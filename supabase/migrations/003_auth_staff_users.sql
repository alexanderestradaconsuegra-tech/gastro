-- ============================================================
-- GASTRO POS - Usuarios de Supabase Auth para staff demo
-- PIN: 1234 → bcrypt hash $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

-- Insertar usuarios en auth.users usando el mismo hash bcrypt del PIN
-- Esto permite autenticar con supabase.auth.signInWithPassword({ email, password: '1234' })

DO $$
DECLARE
  pwd TEXT := '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'admin@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@nido.cl');

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'marco@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marco@nido.cl');

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'isabella@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'isabella@nido.cl');

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'tomas@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tomas@nido.cl');

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'cocina@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'cocina@nido.cl');

  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
  SELECT gen_random_uuid(), 'caja@nido.cl', pwd, NOW(), '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', NOW(), NOW(), 'authenticated', 'authenticated'
  WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'caja@nido.cl');
END $$;
