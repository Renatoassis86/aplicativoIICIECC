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

    // Executa e insere lote de usuários no banco de dados.
    // 'onConflict' na coluna CPF exige que a tabela esteja com CPF configurado como UNIQUE id
    const { data, error } = await supabase
      .from('members')
      .upsert(payload, { onConflict: 'cpf' })
      .select();

    if (error) {
      console.error('Erro no Supabase Bulk Import:', error);
      throw error;
    }

    return { success: true, count: payload.length, data };
  } catch (error) {
    console.error('Falha genérica no adminService:', error);
    return { success: false, error: error.message };
  }
};
