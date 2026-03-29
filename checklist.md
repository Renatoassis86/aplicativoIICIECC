# Checklist de Desenvolvimento - App II Congresso CIECC

Este documento rastreia o progresso das funcionalidades e a integridade do projeto.

---

## ✅ Concluído (Feito)

### 1. Autenticação e Segurança
- [x] Login baseado em CPF (Banco de Inscritos).
- [x] Senha padrão inicial `congresso2026`.
- [x] Fluxo de redefinição de senha obrigatório no 1º acesso.
- [x] Botão de "Limpar Dados de Teste" para simulações rápidas.
- [x] Recuperação de senha ("Esqueci minha senha") com simulação de e-mail.

### 2. Fluxo de Onboarding e Questionários
- [x] Seleção de Perfil/Tipo de Inscrição (12 categorias mapeadas).
- [x] Motor de Questionário Gamificado (Progress bar, tipos variados de input).
- [x] Sincronização Literal (100% de fidelidade) dos questionários:
    - [x] Liderança Escolar (`SchoolSurvey`)
    - [x] Alunos FICV (`StudentSurvey`)
    - [x] Famílias Educadoras (`FamilySurvey`)
    - [x] Igrejas / Formação Bíblica (`ChurchSurvey`)
    - [x] Público Potencial (`ProspectSurvey`)

### 3. Banco de Dados & Integração
- [x] Configuração do projeto Supabase `aplicativo_evento`.
- [x] Criação da tabela `members` (CPFs autorizados).
- [x] Criação da tabela `profiles` (Estado e senhas novas).
- [x] Criação da tabela `survey_responses` (Respostas JSONB literais).
- [x] Integração via `src/supabase.js` e refatoração do `App.jsx`.

### 4. Design & Home (Dashboard)
- [x] Design System Premium (Inter + Playfair Display).
- [x] Paleta Institucional (Vermelho, Preto, Dourado Acadêmico).
- [x] Refinamento Profundo da Home (8 blocos institucionais):
    - Cabeçalho, Banner, Comunicados, Acesso Rápido, Resumo, Comercial, Cobertura, Rodapé.

---

## 🏗️ Em Desenvolvimento / Próximos Passos

### 1. Admin Backend (Gestão de Conteúdo)
- [ ] Criar portal de administração para gerenciar membros/CPFs.
- [ ] Criar interface para o admin postar "Comunicados Oficiais".
- [ ] Dashboard de estatísticas das respostas dos questionários.

### 2. Funcionalidades da Agenda
- [ ] Implementar a aba `AgendaTab` com as sessões reais do congresso.
- [ ] Sistema de "Favoritos" para sessões específicas.

### 3. Networking & Networking
- [ ] Implementar o diretório de participantes.
- [ ] Chat ou sistema de conexão entre congressistas.

### 4. Preparação para Real Deployment
- [ ] Configuração final de variáveis de ambiente no Vercel.
- [ ] Testes de carga na integração com Supabase.

---

## 📂 Estrutura de Arquivos Relevante
- `src/supabase.js`: Cliente de conexão.
- `src/App.jsx`: Controlador central de estado e roteamento.
- `src/views/questionnaires/`: Módulos dos questionários literais.
- `src/views/tabs/HomeTab.jsx`: A vitrine institucional do aplicativo.
