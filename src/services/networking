import { supabase } from '../lib/supabase';

/**
 * Serviço de Networking
 * Responsável por buscar os dados mascarados e públicos dos congressistas.
 * Em produção real, usaria uma VIEW do Supabase que faz JOIN entre:
 * profiles (user_type) + members (name) + survey_responses (cargo, instituicao)
 */

export const fetchNetworkProfiles = async (searchTerm = '', filterType = 'all') => {
  try {
    // PREPARAÇÃO FUTURA SUPABASE:
    // let query = supabase.from('public_profiles_view').select('*');
    // if (filterType !== 'all') query = query.eq('user_type', filterType);
    // if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
    // const { data, error } = await query;

    // MOCK REALISTA TEMPORÁRIO PARA DESENVOLVIMENTO
    await new Promise(resolve => setTimeout(resolve, 600));

    let mockData = [
      { id: '1', name: 'Dr. Thiago Dutra', role: 'Palestrante', institution: 'Schola Classics', type: 'palestrante', linkedin: 'thiagodutra', verified: true },
      { id: '2', name: 'Maurício Fonseca', role: 'Staff Oficial', institution: 'II CIECC', type: 'staff', verified: true },
      { id: '3', name: 'Renato Assis', role: 'Organizador', institution: 'Arkos', type: 'staff', verified: true },
      { id: '4', name: 'Elmer Pires', role: 'Congressista VIP', institution: 'Editora Trinitas', type: 'parceiro', verified: true },
      { id: '5', name: 'João Silva', role: 'Professor', institution: 'Escola Clássica XPTO', type: 'congressista', verified: false },
      { id: '6', name: 'Ana Souza', role: 'Diretora Escolar', institution: 'Colégio Veritas', type: 'congressista', verified: false },
      { id: '7', name: 'Igreja Presbiteriana Central', role: 'Expositor Master', institution: '', type: 'expositor', verified: true },
    ];

    // Aplicação de busca e filtro no front-end por enquanto
    if (filterType !== 'all') {
      mockData = mockData.filter(user => user.type === filterType);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      mockData = mockData.filter(user => 
        user.name.toLowerCase().includes(lower) || 
        user.institution.toLowerCase().includes(lower) ||
        user.role.toLowerCase().includes(lower)
      );
    }

    return mockData;
  } catch (error) {
    console.error("Erro ao buscar a rede de contatos:", error);
    return [];
  }
};
