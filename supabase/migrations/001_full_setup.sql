-- ============================================================
-- II CIECC 2026 - MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- Executar no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ffmcmkfbanhyidrxvsst/sql
-- ============================================================

-- ==============================
-- 1. CORRIGIR TABELA: profiles
-- A tabela foi criada com coluna 'user_id' mas o código usa 'cpf'
-- ==============================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
UPDATE profiles SET cpf = user_id WHERE cpf IS NULL AND user_id IS NOT NULL;

-- Índice único para cpf (necessário para upsert onConflict: 'cpf')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename = 'profiles' AND indexname = 'profiles_cpf_unique'
  ) THEN
    CREATE UNIQUE INDEX profiles_cpf_unique ON profiles(cpf) WHERE cpf IS NOT NULL;
  END IF;
END $$;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================
-- 2. CORRIGIR TABELA: members
-- Adicionar colunas faltantes
-- ==============================
ALTER TABLE members ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS ticket_type TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================
-- 3. CORRIGIR TABELA: speakers
-- Adicionar colunas faltantes
-- ==============================
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE speakers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================
-- 4. CORRIGIR TABELA: system_notifications
-- A tabela usa 'user_cpf' mas o código espera 'target_user_cpf'
-- ==============================
ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS target_user_cpf TEXT;
UPDATE system_notifications SET target_user_cpf = user_cpf WHERE target_user_cpf IS NULL AND user_cpf IS NOT NULL;

ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS target_role TEXT DEFAULT 'all';
ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS sender_role TEXT;

-- ==============================
-- 5. CORRIGIR TABELA: sponsors
-- Adicionar colunas para perfil completo do patrocinador
-- ==============================
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS booth TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE sponsors ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ==============================
-- 6. CRIAR TABELA: survey_responses
-- ==============================
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_cpf TEXT NOT NULL,
  survey_type TEXT NOT NULL,
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_cpf ON survey_responses(user_cpf);

-- ==============================
-- 7. CRIAR TABELA: session_materials
-- ==============================
CREATE TABLE IF NOT EXISTS session_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES agenda_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_materials_session_id ON session_materials(session_id);

-- ==============================
-- 8. CRIAR TABELA: agenda_favorites
-- ==============================
CREATE TABLE IF NOT EXISTS agenda_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_cpf TEXT NOT NULL,
  session_id UUID REFERENCES agenda_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_cpf, session_id)
);
CREATE INDEX IF NOT EXISTS idx_agenda_favorites_user_cpf ON agenda_favorites(user_cpf);

-- ==============================
-- 9. CRIAR TABELA: workshop_registrations
-- ==============================
CREATE TABLE IF NOT EXISTS workshop_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_cpf TEXT NOT NULL,
  workshop_id UUID REFERENCES agenda_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_cpf, workshop_id)
);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_user_cpf ON workshop_registrations(user_cpf);
CREATE INDEX IF NOT EXISTS idx_workshop_reg_workshop_id ON workshop_registrations(workshop_id);

-- ==============================
-- 10. CRIAR VIEW: workshop_counts
-- Usada em WorkshopsView.jsx para contar inscritos por oficina
-- ==============================
CREATE OR REPLACE VIEW workshop_counts AS
SELECT
  workshop_id,
  COUNT(*) AS registration_count
FROM workshop_registrations
GROUP BY workshop_id;

-- ==============================
-- 11. CRIAR TABELA: system_ticket_scans
-- ==============================
CREATE TABLE IF NOT EXISTS system_ticket_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES system_tickets(id) ON DELETE SET NULL,
  scanner_user_id TEXT,
  success BOOLEAN DEFAULT FALSE,
  scan_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ticket_scans_ticket_id ON system_ticket_scans(ticket_id);

-- ==============================
-- 12. CRIAR TABELA: system_notifications_reads
-- ==============================
CREATE TABLE IF NOT EXISTS system_notifications_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES system_notifications(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(notification_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_notif_reads_user_id ON system_notifications_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_reads_notif_id ON system_notifications_reads(notification_id);

-- ==============================
-- 13. ÍNDICES DE PERFORMANCE
-- ==============================
CREATE INDEX IF NOT EXISTS idx_system_notifications_target_user ON system_notifications(target_user_cpf);
CREATE INDEX IF NOT EXISTS idx_system_notifications_target_role ON system_notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_members_cpf ON members(cpf);

-- ==============================
-- 14. TRIGGER: broadcasts → system_notifications
-- Cria notificação automática quando um broadcast é inserido
-- ==============================
CREATE OR REPLACE FUNCTION fn_broadcast_to_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO system_notifications (
    title,
    message,
    body,
    target_role,
    sender_role,
    type,
    author_id
  ) VALUES (
    NEW.title,
    NEW.message,
    NEW.message,
    NEW.target_role,
    'admin',
    'broadcast',
    NEW.sender_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_broadcast_to_notifications_v2 ON broadcasts;
CREATE TRIGGER tr_broadcast_to_notifications_v2
  AFTER INSERT ON broadcasts
  FOR EACH ROW EXECUTE FUNCTION fn_broadcast_to_notification();

-- ==============================
-- 15. FUNÇÃO RPC: admin_upsert_user
-- Cria ou atualiza usuário administrativo com verificação de permissão
-- ==============================
CREATE OR REPLACE FUNCTION admin_upsert_user(
  p_admin_cpf  TEXT,
  p_target_cpf TEXT,
  p_name       TEXT,
  p_email      TEXT,
  p_user_type  TEXT,
  p_password   TEXT DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_type TEXT;
BEGIN
  SELECT user_type INTO v_admin_type
  FROM profiles
  WHERE cpf = p_admin_cpf
  LIMIT 1;

  IF v_admin_type IS NULL OR v_admin_type NOT IN ('admin', 'organizador', 'master', 'staff') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado: Permissão insuficiente.');
  END IF;

  -- Upsert na tabela de membros
  INSERT INTO members (cpf, name, email)
  VALUES (p_target_cpf, p_name, p_email)
  ON CONFLICT (cpf) DO UPDATE SET
    name  = EXCLUDED.name,
    email = EXCLUDED.email;

  -- Upsert no perfil
  INSERT INTO profiles (cpf, user_id, user_type, onboarding_completed, password_reset, current_password)
  VALUES (
    p_target_cpf,
    p_target_cpf,
    p_user_type,
    true,
    false,
    COALESCE(p_password, 'congresso2026')
  )
  ON CONFLICT (cpf) DO UPDATE SET
    user_type        = EXCLUDED.user_type,
    current_password = CASE
      WHEN p_password IS NOT NULL THEN p_password
      ELSE profiles.current_password
    END;

  RETURN jsonb_build_object('success', true, 'message', 'Usuário configurado com sucesso.');
END;
$$;

-- ==============================
-- 16. FUNÇÃO RPC: admin_delete_user
-- Remove usuário e todos os dados vinculados
-- ==============================
CREATE OR REPLACE FUNCTION admin_delete_user(
  p_admin_cpf  TEXT,
  p_target_cpf TEXT
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_admin_type TEXT;
BEGIN
  SELECT user_type INTO v_admin_type
  FROM profiles
  WHERE cpf = p_admin_cpf
  LIMIT 1;

  IF v_admin_type IS NULL OR v_admin_type NOT IN ('admin', 'organizador', 'master') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Acesso negado: Apenas admins podem excluir usuários.');
  END IF;

  -- Remove dados vinculados em cascata
  DELETE FROM agenda_favorites WHERE user_cpf = p_target_cpf;
  DELETE FROM workshop_registrations WHERE user_cpf = p_target_cpf;
  DELETE FROM system_notifications_reads WHERE user_id = p_target_cpf;
  DELETE FROM system_tickets WHERE member_cpf = p_target_cpf;
  DELETE FROM survey_responses WHERE user_cpf = p_target_cpf;
  DELETE FROM profiles WHERE cpf = p_target_cpf;
  DELETE FROM members WHERE cpf = p_target_cpf;

  RETURN jsonb_build_object('success', true, 'message', 'Usuário removido com sucesso.');
END;
$$;

-- ==============================
-- 17. POLÍTICAS DE SEGURANÇA (RLS)
-- Permissivas para o app funcionar com a chave anon
-- ==============================

-- survey_responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "survey_responses_all" ON survey_responses;
CREATE POLICY "survey_responses_all" ON survey_responses FOR ALL USING (true) WITH CHECK (true);

-- session_materials
ALTER TABLE session_materials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "session_materials_all" ON session_materials;
CREATE POLICY "session_materials_all" ON session_materials FOR ALL USING (true) WITH CHECK (true);

-- agenda_favorites
ALTER TABLE agenda_favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "agenda_favorites_all" ON agenda_favorites;
CREATE POLICY "agenda_favorites_all" ON agenda_favorites FOR ALL USING (true) WITH CHECK (true);

-- workshop_registrations
ALTER TABLE workshop_registrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workshop_registrations_all" ON workshop_registrations;
CREATE POLICY "workshop_registrations_all" ON workshop_registrations FOR ALL USING (true) WITH CHECK (true);

-- system_ticket_scans
ALTER TABLE system_ticket_scans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ticket_scans_all" ON system_ticket_scans;
CREATE POLICY "ticket_scans_all" ON system_ticket_scans FOR ALL USING (true) WITH CHECK (true);

-- system_notifications_reads
ALTER TABLE system_notifications_reads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_reads_all" ON system_notifications_reads;
CREATE POLICY "notif_reads_all" ON system_notifications_reads FOR ALL USING (true) WITH CHECK (true);

-- ==============================
-- 18. CONTEÚDO INICIAL: content_registry
-- Chaves necessárias para o app funcionar
-- ==============================
INSERT INTO content_registry (section, key, value) VALUES
  ('home', 'home_badge_text',      '"II EDIÇÃO • 2026"'),
  ('home', 'home_title',           '"II CIECC 2026"'),
  ('home', 'home_subtitle',        '"II Congresso Internacional de Educação Cristã Clássica"'),
  ('home', 'home_location',        '"Bom Retiro, São Paulo - SP"'),
  ('home', 'home_date_range',      '"01 e 02 de Maio de 2026"'),
  ('home', 'home_video_url',       '"https://www.youtube.com/embed/t5CB9rnexOY"'),
  ('home', 'home_countdown_date',  '"2026-05-01T08:00:00"'),
  ('titles', 'page_agenda',        '"Programação"'),
  ('titles', 'page_network',       '"Networking"'),
  ('titles', 'page_media',         '"Mídias"')
ON CONFLICT (key) DO NOTHING;

-- ==============================
-- FIM DA MIGRAÇÃO
-- ==============================
SELECT 'Migração concluída com sucesso!' AS status;
