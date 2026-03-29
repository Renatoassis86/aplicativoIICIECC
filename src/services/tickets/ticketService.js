import { supabase } from '../../lib/supabase';

/**
 * Serviço responsável por buscar, validar e atualizar o ingresso do usuário.
 * Estrutura preparada para integração completa com Supabase utilizando o CPF 
 * como elo de ligação atual (antes da migração total para RLS UUID).
 */

export const fetchUserTicket = async (cpf) => {
  try {
    // PREPARAÇÃO FUTURA (Quando a tabela `tickets` existir):
    // const { data, error } = await supabase.from('tickets').select('*').eq('cpf', cpf).single();
    // if (error) throw error;
    // return data;

    // MOCK REALISTA TEMPORÁRIO 
    // Altera o status simulado com base no cenário para testes visuais.
    // Você pode mudar esse 'status' para testar a UI:
    // 'active' | 'blocked' | 'scanned' | 'not_generated'
    
    // Simulando uma pequena latência de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lógica simulada: se não tiver CPF, falha.
    if (!cpf) {
      return { status: 'not_generated', message: 'Inscrição não encontrada.' };
    }

    return {
      ticket_id: 'ciecc:tkt:550e8400-e29b-41d4-a716-446655440000',
      cpf: cpf,
      ticket_type: 'Presencial Premium',
      status: 'active', // <--- Troque aqui para simular 'blocked' ou 'scanned'
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Erro ao buscar ticket no banco:", error);
    return { status: 'error', message: 'Erro na conexão com o servidor.' };
  }
};
