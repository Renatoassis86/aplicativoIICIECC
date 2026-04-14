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
      
      let type = p?.user_type || 'congressista';
      
      // Normalização de tipos para os filtros do NetworkTab
      if (['organizador', 'staff', 'apoio', 'voluntario'].includes(type.toLowerCase())) {
        type = 'staff';
      } else if (['patrocinador', 'parceiro'].includes(type.toLowerCase())) {
        type = 'parceiro';
      } else if (['expositor'].includes(type.toLowerCase())) {
        type = 'expositor';
      } else if (['palestrante'].includes(type.toLowerCase())) {
        type = 'palestrante';
      } else if (['professor', 'diretor', 'coordenador', 'gestor'].includes(type.toLowerCase())) {
        type = 'congressista';
      }

      return {
        id: m.cpf,
        name: m.name || 'Participante',
        role: p?.job_title || (type === 'palestrante' ? 'Palestrante' : (type === 'parceiro' ? 'Patrocinador' : 'Congressista')),
        institution: m.institution || '',
        type: type,
        verified: type === 'staff' || type === 'palestrante' || type === 'parceiro',
        avatar: p?.avatar_url
      };
    });

    // 3. Buscar Palestrantes da tabela de Palestrantes (Gestão CMS)
    const { data: cmsSpeakers } = await supabase.from('speakers').select('*');
    if (cmsSpeakers) {
      cmsSpeakers.forEach(s => {
        if (!baseResults.some(r => r.name === s.name)) {
          baseResults.push({
            id: s.id,
            name: s.name,
            role: s.institution || 'Palestrante',
            institution: s.institution || 'II CIECC',
            type: 'palestrante',
            verified: true,
            avatar: s.photo_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
          });
        }
      });
    }

    // 4. Buscar Patrocinadores/Parceiros da tabela de Sponsors (Gestão CMS)
    const { data: cmsSponsors } = await supabase.from('sponsors').select('*').eq('active', true);
    if (cmsSponsors) {
      cmsSponsors.forEach(s => {
        if (!baseResults.some(r => r.name === s.name)) {
          baseResults.push({
            id: s.id,
            name: s.name,
            role: s.tagline || 'Patrocinador Oficial',
            institution: s.name,
            type: 'parceiro',
            verified: true,
            avatar: s.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop'
          });
        }
      });
    }

    // 4. Filtro Lógica de Negócio (Client-side para garantir "toda a base")
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
