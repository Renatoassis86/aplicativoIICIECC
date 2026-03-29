-- Schema para Ingressos e Validação (Check-in) pela Equipe (Scanner Staff)
-- II Congresso CIECC

-- 1. Tabela Base de Ingressos Pessoais
CREATE TABLE IF NOT EXISTS system_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  member_cpf TEXT NOT NULL UNIQUE, -- Liga à autenticação/cadastro nativo
  ticket_type TEXT NOT NULL DEFAULT 'Geral', -- 'Geral', 'Premium', 'VIP'
  status TEXT NOT NULL DEFAULT 'active' -- 'active', 'blocked', 'scanned'
);

-- 2. Tabela de Logs de Check-in (Auditoria de Acesso)
CREATE TABLE IF NOT EXISTS system_ticket_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ticket_id UUID REFERENCES system_tickets(id) ON DELETE CASCADE,
  scanner_user_id TEXT NOT NULL, -- Quem foi o Staff que bipou o ingresso
  success BOOLEAN NOT NULL DEFAULT true,
  scan_message TEXT -- Registra se tentou bipar duplo ou tava bloqueado
);

ALTER TABLE system_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_ticket_scans ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Todo o congressista pode ler o seu próprio ou todos via Dashboard para check publico
CREATE POLICY "Tickets leitura global" ON system_tickets FOR SELECT USING (true);
CREATE POLICY "Tickets criacao livre" ON system_tickets FOR INSERT WITH CHECK (true); -- Backend Server / Importação cria

CREATE POLICY "Scans leitura" ON system_ticket_scans FOR SELECT USING (true);
CREATE POLICY "Staff posta scan" ON system_ticket_scans FOR INSERT WITH CHECK (true);
