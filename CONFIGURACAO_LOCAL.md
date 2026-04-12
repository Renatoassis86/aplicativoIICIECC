# Guia de Configuração Local - Aplicativo do Congresso

Este documento contém todos os pré-requisitos e passos necessários para rodar este projeto em um novo computador.

## 🛠 Pré-requisitos do Sistema

Para rodar o projeto, você precisará instalar:

1.  **Node.js**: Versão 18 ou superior.
    *   [Download Node.js](https://nodejs.org/)
2.  **Linguagem**: JavaScript/React (visto que o projeto usa Vite).
3.  **Mobile (Opcional)**: Se for trabalhar na versão Android/iOS:
    *   **Java JDK 17**
    *   **Android Studio** (para Android) ou **Xcode** (para iOS/Mac)
    *   **Capacitor CLI**: Já incluso nas dependências do projeto.

---

## 🚀 Passo a Passo para Instalação

### 1. Clonar ou Copiar o Projeto
Traga a pasta do projeto para o novo PC. 
> **Atenção**: Não copie a pasta `node_modules`. Ela será recriada no próximo passo.

### 2. Instalar Dependências (O "Requirements" do Node)
Abra o terminal na pasta do projeto e execute:
```bash
npm install
```
Este comando lerá o arquivo `package.json` e instalará exatamente as mesmas versões das bibliotecas (Supabase, Capacitor, React, etc.) que estão funcionando aqui.

### 3. Configurar Variáveis de Ambiente
O projeto precisa se conectar ao banco de dados.
1.  Crie um arquivo chamado `.env` na raiz do projeto.
2.  Copie o conteúdo do arquivo `.env.example` (criado abaixo) para dentro dele.

### 4. Rodar o Aplicativo
Para iniciar o modo de desenvolvimento:
```bash
npm run dev
```
O terminal informará um endereço (ex: `http://localhost:5173`). Abra-o no navegador.

---

## 📱 Comandos Mobile (Capacitor)
Se você for testar no celular no novo PC:

*   **Sincronizar mudanças**: `npx cap sync`
*   **Abrir no Android Studio**: `npx cap open android`

---

## 📝 Lista de Tecnologias Principais (Resumo)
*   **Framework**: React 19 (Vite)
*   **Banco de Dados**: Supabase
*   **Mobile**: Ionic Capacitor
*   **Ícones**: Lucide React
*   **Estilização**: CSS Nativo
