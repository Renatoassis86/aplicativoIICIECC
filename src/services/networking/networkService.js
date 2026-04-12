import { supabase } from '../../lib/supabase';

/**
 * Serviço de Networking Real
 * Busca dados das tabelas profiles e members.
 */

export const fetchNetworkProfiles = async (searchTerm = '', filterType = 'all') => {
  try {
    // 1. Buscar perfis base com joins ou em paralelo
    let query = supabase
      .from('profiles')
      .select('cpf, user_type, name')
      .order('name');

    if (filterType !== 'all') {
      // Mapeamento de filtros para user_type do banco
      const typeMap = {
        'palestrante': 'palestrante',
        'congressista': 'congressista',
        'expositor': 'expositor',
        'parceiro': 'parceiro',
        'staff': 'organizador' // 'staff' na UI é 'organizador' no banco
      };
      query = query.eq('user_type', typeMap[filterType] || filterType);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data: profiles, error } = await query;
    if (error) throw error;

    // 2. Buscar detalhes adicionais na tabela members (como instituição/cargo)
    const cpfs = profiles.map(p => p.cpf);
    const { data: members } = await supabase
      .from('members')
      .select('cpf, institution, position')
      .in('cpf', cpfs);

    // 3. Mesclar dados
    return profiles.map(p => {
      const memberInfo = (members || []).find(m => m.cpf === p.cpf);
      return {
        id: p.cpf,
        name: p.name || 'Participante',
        role: memberInfo?.position || (p.user_type === 'palestrante' ? 'Palestrante' : 'Congressista'),
        institution: memberInfo?.institution || '',
        type: p.user_type === 'organizador' ? 'staff' : p.user_type,
        verified: p.user_type === 'palestrante' || p.user_type === 'organizador'
      };
    });
  } catch (error) {
    console.error("Erro ao buscar a rede de contatos real:", error);
    return [];
  }
};
