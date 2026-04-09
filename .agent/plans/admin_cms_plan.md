# Plano de Implementação: CMS do Painel do Administrador

## 1. Visão Geral
Transformar o sistema administrativo em um CMS completo e dinâmico, permitindo a edição fácil de todo o conteúdo do front-end sem necessitar alterações no código-fonte. O foco está na robustez (cache offline anti-falhas) e agilidade na gestão de conteúdo.

## 2. Modelagem do Banco de Dados (Supabase)

Criaremos tabelas focadas em versatilidade:

*   **`content_registry` (Textos e Configurações):**
    *   `id` (uuid)
    *   `section` (text - ex: 'home', 'gt', 'sobre', 'transmissao')
    *   `key` (text - identificador único prático, ex: 'home_welcome_title')
    *   `value` (text/json - conteúdo ou configuração)
    *   `updated_at` (timestamp, para controle do cache)
*   **`media_assets` (Vídeos e Áudios):**
    *   `id` (uuid)
    *   `title` (text)
    *   `description` (text)
    *   `media_type` (text - 'video' ou 'audio')
    *   `source_type` (text - 'link' ou 'upload')
    *   `url_or_path` (text - Link do youtube/vimeo ou path no Storage)
    *   `is_live_stream` (boolean - tag para identificar a transmissão online principal)
    *   `created_at`, `updated_at` (timestamps)
*   **Storage Bucket: `app_media`**
    *   Bucket público para salvar os uploads locais do administrador via painel.

## 3. Estratégia de Cache e Resiliência (Offline First)

Para garantir que o aplicativo **nunca** fique em branco e não apresente bugs de ausência de dados, implementaremos uma abordagem de *Stale-while-revalidate* na camada de serviço (Local Storage + Zustand ou LocalForage):

1.  **Inicialização:** O App sempre carrega com o último estado salvo localmente (Cache/Storage). Se for o primeiro acesso, usa um arquivo de constante local (`fallbackData.js`) estrutural para "segurar a tela".
2.  **Sincronização em Background:** O App dispara buscar no Supabase as tabelas de CMS em background.
3.  **Atualização Suave:** Ao receber atualizações (dados novos do DB), o estado é atualizado sem recarregar e o cache local sobrescreve.

## 4. UI/UX: Módulos do Administrador

A barra lateral (Sidebar) do Painel Administrativo terá a seguinte estrutura centralizada:

1.  **Painel Geral (Dashboard)** - Visão das últimas edições e alertas gerais.
2.  **Página Inicial (Home)** - Edição de textos de boas-vindas, banners e atalhos centrais.
3.  **Agenda & Atividades** - Gerenciamento robusto da programação.
4.  **Mídia & Conteúdo** - Upload direto ou inserção de Links para (Podcasts, Entrevistas, Vídeos).
5.  **Transmissão Ao Vivo (Live)** - Link dedicado e botão para atualizar instantaneamente o iFrame / Player Front-end.
6.  **Questionários/Formulários** - (Módulo já existente).

## 5. Passos para a Implementação

*   [ ] **Fase 1: Infraestrutura de Banco e Supabase**
    *   Criar migrations (ou comando SQL) no Supabase para as tabelas `content_registry` e `media_assets`.
    *   Criar o bucket Storage `app_media`.
*   [ ] **Fase 2: Motor de Gestão de Conteúdo (Hooks e Serviços)**
    *   Criar `cmsService.js` (Buscando dados, lidando com Cache offline e salvamento/fallback).
    *   Tornar instâncias do front-end dinâmicas em Componentes chave.
*   [ ] **Fase 3: Construção do Sidebar e Módulos Base do Admin**
    *   Update no layout do painel administrativo.
    *   Criar tela de gerenciamento de textos ("Editar Página Inicial").
*   [ ] **Fase 4: Módulo Híbrido de Mídias e Transmissões**
    *   Criar o gerenciador com toggle para "Adicionar Link (YouTube)" ou "Upload (Arquivo)".
    *   Vincular front-end para entender ambas origens.
*   [ ] **Fase 5: Testes de Resiliência**
    *   Simular desconexão (Offline mode) provando que o Front-end persiste sem crashes.
