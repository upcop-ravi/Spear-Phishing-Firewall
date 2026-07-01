-- Enable pgcrypto extension for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Kotwali Nagar
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-kotnagar.ay@up.gov.in',
    crypt('9454403303@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-kotnagar.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Nagar', 'sho-kotnagar.ay@up.gov.in', '9454403303', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 2. Kotwali Cantt
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-cantt.ay@up.gov.in',
    crypt('9454403298@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-cantt.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Cantt', 'sho-cantt.ay@up.gov.in', '9454403298', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 3. Mahila Thana
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-mahilathana.ay@up.gov.in',
    crypt('9454403306@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-mahilathana.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Mahila Thana', 'sho-mahilathana.ay@up.gov.in', '9454403306', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 4. Kotwali Ayodhya
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-kotayodhya.ay@up.gov.in',
    crypt('9454403296@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-kotayodhya.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Ayodhya', 'sho-kotayodhya.ay@up.gov.in', '9454403296', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 5. Ram Janm Bhoomi
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-rjb.ay@up.gov.in',
    crypt('9454403310@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-rjb.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Ram Janm Bhoomi', 'sho-rjb.ay@up.gov.in', '9454403310', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 6. Poorakalandar
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-purakalander.ay@up.gov.in',
    crypt('9454403309@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-purakalander.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Poorakalandar', 'sho-purakalander.ay@up.gov.in', '9454403309', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 7. Raunahi
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-raunahi.ay@up.gov.in',
    crypt('9454403311@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-raunahi.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Raunahi', 'sho-raunahi.ay@up.gov.in', '9454403311', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 8. Maharajganj
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-mahrajganj.ay@up.gov.in',
    crypt('9454403305@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-mahrajganj.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Maharajganj', 'sho-mahrajganj.ay@up.gov.in', '9454403305', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 9. Gosainganj
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-gosaiganj.ay@up.gov.in',
    crypt('9454403299@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-gosaiganj.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Gosainganj', 'sho-gosaiganj.ay@up.gov.in', '9454403299', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 10. Kotwali Bikapur
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-kotbikapur.ay@up.gov.in',
    crypt('9454403297@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-kotbikapur.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Bikapur', 'sho-kotbikapur.ay@up.gov.in', '9454403297', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 11. Tarun
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-tarun.ay@up.gov.in',
    crypt('9454403313@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-tarun.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Tarun', 'sho-tarun.ay@up.gov.in', '9454403313', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 12. Haiderganj
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-haiderganj.ay@up.gov.in',
    crypt('9454403300@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-haiderganj.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Haiderganj', 'sho-haiderganj.ay@up.gov.in', '9454403300', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 13. Kotwali Inayat Nagar
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-inshotnagar.ay@up.gov.in',
    crypt('9454403301@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-inshotnagar.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Inayat Nagar', 'sho-inshotnagar.ay@up.gov.in', '9454403301', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 14. Kumarganj
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-kumarganj.ay@up.gov.in',
    crypt('9454403304@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-kumarganj.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kumarganj', 'sho-kumarganj.ay@up.gov.in', '9454403304', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 15. Khandasa
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-khandasa.ay@up.gov.in',
    crypt('9454403302@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-khandasa.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Khandasa', 'sho-khandasa.ay@up.gov.in', '9454403302', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 16. Kotwali Rudauli
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-kotrudauli.ay@up.gov.in',
    crypt('9454403312@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-kotrudauli.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Kotwali Rudauli', 'sho-kotrudauli.ay@up.gov.in', '9454403312', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 17. Mawai
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-mawai.ay@up.gov.in',
    crypt('9454403307@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-mawai.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Mawai', 'sho-mawai.ay@up.gov.in', '9454403307', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 18. Patranga
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'patarangafzd@gmail.com',
    crypt('9454403308@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'patarangafzd@gmail.com';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Patranga', 'patarangafzd@gmail.com', '9454403308', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 19. Baba Bazar
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-bababazar.ay@up.gov.in',
    crypt('9454403314@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-bababazar.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Baba Bazar', 'sho-bababazar.ay@up.gov.in', '9454403314', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 20. AHTU
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'so-ahtu.ay@up.gov.in',
    crypt('7839860546@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'so-ahtu.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'AHTU', 'so-ahtu.ay@up.gov.in', '7839860546', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 21. Cyber Thana
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'sho-cybercrime.ay@up.gov.in',
    crypt('7839876653@Sho', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'sho-cybercrime.ay@up.gov.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Cyber Thana', 'sho-cybercrime.ay@up.gov.in', '7839876653', 'thana_user', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

-- 22. Super Admin (Cyber HQ)
DO $$
DECLARE
  u_id UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
    is_super_admin, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    u_id,
    'authenticated',
    'authenticated',
    'superadmin@up.nic.in',
    crypt('admin@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    true,
    now(),
    now()
  ) ON CONFLICT (email) DO NOTHING;

  SELECT id INTO u_id FROM auth.users WHERE email = 'superadmin@up.nic.in';

  INSERT INTO public.system_users (id, thana_name, nic_email, cug_mobile, role, is_active)
  VALUES (u_id, 'Cyber Cell HQ', 'superadmin@up.nic.in', '9999999999', 'super_admin', true)
  ON CONFLICT (nic_email) DO NOTHING;
END $$;

