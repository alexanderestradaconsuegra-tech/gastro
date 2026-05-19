-- ============================================================
-- GASTRO POS - Usuarios de Supabase Auth para staff demo
-- PIN: 1234 → bcrypt hash $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================================

DO $$
DECLARE
  pwd  TEXT := '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  inst UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password, email_confirmed_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    phone_change, phone_change_token,
    email_change_token_current, reauthentication_token,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user, is_anonymous,
    created_at, updated_at
  ) VALUES
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'admin@nido.cl',    pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW()),
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'marco@nido.cl',    pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW()),
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'isabella@nido.cl', pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW()),
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'tomas@nido.cl',    pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW()),
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'cocina@nido.cl',   pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW()),
  (inst, gen_random_uuid(), 'authenticated', 'authenticated', 'caja@nido.cl',     pwd, NOW(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"restaurant_id":"nido"}', false, false, false, NOW(), NOW());
END $$;
