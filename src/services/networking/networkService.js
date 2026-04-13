import { supabase } from '../../lib/supabase';

/**
 * Serviço de Networking Real
 * Busca dados das tabelas profiles e members.
 */

export const fetchNetworkProfiles = async (searchTerm = '', filterType = 'all') => {
  try {
    // 1. Buscar TODOS os membros autorizados (MÁX 2000 para performance)
    // Usamos um select simples para garantir que ninguém seja excluído por falta de perfil
    let { data: members, error } = await supabase
      .from('members')
      .select(`
        cpf, 
        name, 
        institution, 
        position,
        profiles (
          user_type,
          avatar_url,
          job_title
        )
      `)
      .order('name')
      .limit(2000);

    if (error) throw error;

    // 2. Mapear e Limpar dados
    let baseResults = (members || []).map(m => {
      const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      
      const type = p?.user_type === 'organizador' ? 'staff' : (p?.user_type || 'congressista');
      
      return {
        id: m.cpf,
        name: m.name || 'Participante',
        role: m.position || p?.job_title || (type === 'palestrante' ? 'Palestrante' : 'Congressista'),
        institution: m.institution || '',
        type: type,
        verified: type === 'palestrante' || type === 'staff',
        avatar: p?.avatar_url
      };
    });

    // 3. Filtro Lógica de Negócio (Client-side para garantir "toda a base")
    if (filterType !== 'all') {
      baseResults = baseResults.filter(r => r.type === filterType);
    }

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      baseResults = baseResults.filter(r => 
        r.name.toLowerCase().includes(lowSearch) || 
        r.institution.toLowerCase().includes(lowSearch) ||
        r.role.toLowerCase().includes(lowSearch)
      );
    }

    return baseResults;
  } catch (error) {
    console.error("Erro ao buscar a rede de contatos real:", error);
    return [];
  }
};
