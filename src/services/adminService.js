import { supabase } from '../lib/supabase';
import { stripCPF } from '../utils/cpfUtils';

/**
 * Realiza upload massivo de membros para a base de dados
 * Faz UPSERT, ou seja: converte novos e faz update dos já existentes via CPF.
 * @param {Array} membersArray - Array de objetos: { cpf, name, ...outros }
 */
export const bulkImportMembers = async (membersArray) => {
  try {
    // Garantir que os dados mínimos constam e o CPF está sanitizado para o BD
    const payload = membersArray.map(m => ({
      ...m,
      cpf: stripCPF(m.cpf),
      created_at: m.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 1. Executa e insere lote de usuários na tabela de membros
    const { data: members, error: membersErr } = await supabase
      .from('members')
      .upsert(payload, { onConflict: 'cpf' })
      .select();

    if (membersErr) throw membersErr;

    // 2. Garante que todos existam na tabela de perfis com a senha padrão 'congresso2026'
    // e flag de password_reset: true (Exige troca na entrada)
    const profilesPayload = payload.map(m => ({
      cpf: m.cpf,
      user_type: 'congressista',
      onboarding_completed: true,
      password_reset: true,      
      current_password: 'congresso2026',
      updated_at: new Date().toISOString()
    }));

    const { error: profilesErr } = await supabase
      .from('profiles')
      .upsert(profilesPayload, { onConflict: 'cpf' });

    if (profilesErr) throw profilesErr;

    return { success: true, count: payload.length, data: members };
  } catch (error) {
    console.error('Falha genérica no adminService:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca todos os membros cadastrados
 */
export const fetchAllMembers = async () => {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
};

/**
 * Busca todos os perfis (onde mora o user_type)
 */
export const fetchAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*');
    if (error) throw error;
    return data;
};

/**
 * Cria ou atualiza um usuário administrativo (organizador, staff, patrocinador)
 */
export const createOrUpdateAdminUser = async (userData) => {
    const { cpf, name, email, user_type } = userData;
    const cleanCpf = stripCPF(cpf);

    // 1. Garantir que está na tabela de membros (Inscritos)
    const { error: memberError } = await supabase
        .from('members')
        .upsert({ 
            cpf: cleanCpf, 
            name, 
            email,
            updated_at: new Date().toISOString()
        }, { onConflict: 'cpf' });

    if (memberError) throw memberError;

    // 2. Garantir que tem perfil com o tipo correto
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            cpf: cleanCpf,
            user_type: user_type,
            onboarding_completed: true, // Bypass onboarding for admins/sponsors if needed
            password_reset: false // Will require them to set password on first login
        }, { onConflict: 'cpf' });

    if (profileError) throw profileError;

    return { success: true };
};
