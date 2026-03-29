import { supabase } from '../lib/supabase';
import { stripCPF } from '../utils/cpfUtils';
import { MEMBER_STATUS } from '../constants';

/**
 * SERVIÇO DE MEMBROS (INCRITOS)
 * Lógica transacional pura relacionada ao ciclo de vida e estado de Inscrição 
 * de um indivíduo antes mesmo de ter seu `profile` montado (Onboarding completo).
 */

/**
 * Consulta se um determinado CPF existe na base de dados de inscrições (membros oficiais).
 * Extremamente útil para o "First Access" onde verificamos se ele pode criar a conta.
 * @param {string} rawCpf 
 * @returns {Boolean}
 */
export const checkMemberExists = async (rawCpf) => {
  const cpf = stripCPF(rawCpf);
  
  if (!cpf || cpf.length !== 11) return false;

  const { data, error } = await supabase
    .from('members')
    .select('cpf')
    .eq('cpf', cpf)
    .single();

  if (error || !data) {
    return false;
  }
  
  return true;
};

/**
 * Retorna o Status arquitetural atual do membro lendo de forma limpa
 * o banco de dados (cruza Members com Profiles).
 * @param {string} rawCpf 
 * @returns {string} Status de acordo com a constante MEMBER_STATUS
 */
export const fetchMemberStatus = async (rawCpf) => {
  const cpf = stripCPF(rawCpf);
  
  // 1. O Inscrito pagou o ingresso?
  const { data: member, error: memberErr } = await supabase.from('members').select('*').eq('cpf', cpf).single();
  
  if (memberErr || !member) {
    // Não tem inscrição = Acesso Bloqueado ou Não existe
    return MEMBER_STATUS.BLOCKED; 
  }

  // 2. O aplicativo já criou o Perfil associado a ele?
  const { data: profile, error: profErr } = await supabase.from('profiles').select('*').eq('cpf', cpf).single();

  if (profErr || !profile) {
    // Está na lista mas ainda não tem conta ativa, não fez login
    return MEMBER_STATUS.IMPORTED_WITHOUT_PASSWORD;
  }

  // 3. Ele terminou de preencher todas as telas do aplicativo (Survey)?
  if (!profile.onboarding_completed) {
    return MEMBER_STATUS.ONBOARDING_INCOMPLETE;
  }

  // Passou por tudo, conta liberada padrão ouro
  return MEMBER_STATUS.ACTIVE;
};

/**
 * Faz deduplicação de array cru na memória antes de subida de CSV.
 * Reduz custo computacional no Supabase descartando repetidos de Excel mal feito.
 */
export const deduplicateArrayObjects = (arrayData, uniqueKey = 'cpf') => {
  const map = new Map();
  arrayData.forEach(item => {
    // Usa o último repetido (última alteração é a mais válida)
    if (item[uniqueKey]) {
      map.set(item[uniqueKey], item);
    }
  });
  return Array.from(map.values());
};
