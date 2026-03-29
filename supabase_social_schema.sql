-- Criação do Schema Relacional para a Rede Social do II CIECC

-- 1. Tabela de Postagens (Patrocinadores e Expositores)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sponsor_name TEXT NOT NULL,
  sponsor_role TEXT NOT NULL,
  tier_level INTEGER NOT NULL DEFAULT 1,
  sponsor_avatar TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image', 'carousel', 'reel'
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  caption TEXT,
  owner_id TEXT NOT NULL -- CPF ou Nome do usuário que postou
);

-- 2. Tabela de Comentários
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES social_comments(id) ON DELETE CASCADE, -- Para replies
  author_name TEXT NOT NULL,
  author_id TEXT NOT NULL,
  text TEXT NOT NULL
);

-- 3. Tabela de Engajamento (Curtidas e Salvos)
CREATE TABLE IF NOT EXISTS social_engagements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'post_like', 'post_save', 'comment_like'
  target_id UUID NOT NULL, -- id do post ou id do comentario
  UNIQUE(user_id, target_type, target_id)
);

-- Configurando Row Level Security Básica
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagements ENABLE ROW LEVEL SECURITY;

-- Políticas Flexíveis (Leitura Pública para Membros Autenticados, Escrita apenas para Donos)
-- Nota: Para simplificar no App Client Frontend, permitimos acesso anonimo/publico se o RLS não for restrito
CREATE POLICY "Leitura global de posts" ON social_posts FOR SELECT USING (true);
CREATE POLICY "Inserção de posts livre" ON social_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Deleção de posts por donos" ON social_posts FOR DELETE USING (true); -- Controle no front logicamente no MVP

CREATE POLICY "Leitura global de comentarios" ON social_comments FOR SELECT USING (true);
CREATE POLICY "Inserção de comentarios livre" ON social_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Deleção de comentarios" ON social_comments FOR DELETE USING (true);

CREATE POLICY "Leitura engajamentos" ON social_engagements FOR SELECT USING (true);
CREATE POLICY "Inserção engajamentos" ON social_engagements FOR INSERT WITH CHECK (true);
CREATE POLICY "Deleção engajamentos" ON social_engagements FOR DELETE USING (true);
