import { supabase } from '../lib/supabase';
import { stripCPF } from '../utils/cpfUtils';

/**
 * SERVIÇO DE AUTENTICAÇÃO
 * Responsável por gerenciar todo o ciclo de vida do login CPF + Senha.
 * Implementa o padrão "E-mail Fantasma" para usar o JWT seguro e nativo do Supabase.
 */

/**
 * Função responsável por sanitizar e tentar o login seguro no Supabase.
 * @param {string} rawCpf 
 * @param {string} password 
 * @returns {Object} status da autenticação e dados da sessão
 */
export const loginComCPF = async (rawCpf, password) => {
  const cpf = stripCPF(rawCpf);
  
  if (!cpf || cpf.length !== 11) {
    return { ok: false, error: 'CPF inválido.' };
  }

  const dummyEmail = `${cpf}@ciecc.interno`;

  try {
    // Tenta autenticar via JWT (Mais seguro do que buscar senha em plain-text)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password
    });

    if (authError) {
      // Se falhou por credencial, pode ser o First Access.
      // O App deve interceptar isso para checar a tabela 'members'.
      return { 
        ok: false, 
        error: 'Credenciais inválidas ou primeiro acesso pendente.',
        code: 'invalid_credentials'
      };
    }

    // Sucesso na Autenticação! O Supabase já salvou o JWT no Local Storage automaticamente.
    // Retorna a promessa para capturar profiles
    return {
      ok: true,
      user: authData.user,
    };

  } catch (err) {
    console.error("Erro interno no authService:", err);
    return { ok: false, error: 'Erro de comunicação.' };
  }
};

/**
 * Recupera sessão persistente e segura (em substituição ao localStorage raw)
 */
export const getActiveSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Realiza Logout nativo, deletando cookies JWT HTTP-Only e Storage
 */
export const signOut = async () => {
  await supabase.auth.signOut();
};
