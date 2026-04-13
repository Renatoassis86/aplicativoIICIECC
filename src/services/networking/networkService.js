import { supabase } from '../../lib/supabase';

/**
 * Serviço de Networking Real
 * Busca dados das tabelas profiles e members.
 */

export const fetchNetworkProfiles = async (searchTerm = '', filterType = 'all') => {
  try {
    // 1. Buscar dados principais da tabela members com join na tabela profiles
    let query = supabase
      .from('members')
      .select(`
        cpf, 
        name, 
        institution, 
        position,
        profiles!inner (
          user_type,
          avatar_url,
          job_title
        )
      `)
      .order('name');

    if (filterType !== 'all') {
      const typeMap = {
        'palestrante': 'palestrante',
        'congressista': 'congressista',
        'expositor': 'expositor',
        'parceiro': 'parceiro',
        'staff': 'organizador'
      };
      query = query.eq('profiles.user_type', typeMap[filterType] || filterType);
    }

    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data: members, error } = await query;
    if (error) throw error;

    // 2. Mesclar e formatar dados
    return (members || []).map(m => ({
      id: m.cpf,
      name: m.name || 'Participante',
      role: m.position || m.profiles?.job_title || (m.profiles?.user_type === 'palestrante' ? 'Palestrante' : 'Congressista'),
      institution: m.institution || '',
      type: m.profiles?.user_type === 'organizador' ? 'staff' : (m.profiles?.user_type || 'congressista'),
      verified: m.profiles?.user_type === 'palestrante' || m.profiles?.user_type === 'organizador',
      avatar: m.profiles?.avatar_url
    }));
  } catch (error) {
    console.error("Erro ao buscar a rede de contatos real:", error);
    return [];
  }
};
