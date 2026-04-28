import { supabase } from '../lib/supabase';
import { stripCPF } from '../utils/cpfUtils';

/**
 * Realiza upload massivo de membros para a base de dados
 * Faz UPSERT, ou seja: converte novos e faz update dos já existentes via CPF.
 * @param {Array} membersArray - Array de objetos: { cpf, name, ...outros }
 */
export const bulkImportMembers = async (membersArray) => {
  try {
    // Mapa de ticket_type (texto da planilha) → user_type interno
    const typeMap = {
      'aluno da ficv': 'aluno_ficv',
      'professor de escola de ensino básico': 'professor_basico',
      'colaborador do sistema cidade viva': 'colaborador_cv',
      'gestor de escola': 'gestor',
      'diretor de escola': 'diretor',
      'coordenador de escola': 'coordenador',
      'mantenedor de escola': 'mantenedor',
      'pai/mãe de escola parceira cidade viva education': 'pai_parceira',
      'família educadora (homeschooling/afterschooling)': 'familia_educadora',
      'acadêmico ou professor de outra instituição de ensino superior': 'academico',
      'servo da rede kids/membro (igreja cidade viva)': 'servo_kids',
      'líderes de escola bíblica e voluntários de ministério infantil (outras igrejas)': 'lider_infantil',
    };

    const resolveUserType = (ticketType) => {
      if (!ticketType) return 'congressista';
      const key = ticketType.toString().toLowerCase().trim();
      return typeMap[key] || 'congressista';
    };

    // Sanitiza e prepara payload apenas com colunas que existem em 'members'
    const payload = membersArray.map(m => ({
      cpf: stripCPF(m.cpf),
      name: m.name,
      email: m.email || null,
      phone: m.phone || null,
      institution: m.institution || null,
      city: m.city || null,
      state: m.state || null,
      birth_date: m.birth_date || null,
      ticket_type: m.ticket_type || null,
      created_at: m.created_at || new Date().toISOString()
    }));

    // 1. Busca CPFs já existentes para calcular novos vs existentes
    const incomingCpfs = payload.map(m => m.cpf);
    const { data: existing } = await supabase
      .from('members')
      .select('cpf')
      .in('cpf', incomingCpfs);
    const existingSet = new Set((existing || []).map(e => e.cpf));
    const newOnly = payload.filter(m => !existingSet.has(m.cpf));
    const skipped = payload.length - newOnly.length;

    // 2. Insere apenas os novos (sem sobrescrever os existentes)
    let inserted = 0;
    if (newOnly.length > 0) {
      const { data: members, error: membersErr } = await supabase
        .from('members')
        .insert(newOnly)
        .select();
      if (membersErr) throw membersErr;
      inserted = members?.length || newOnly.length;

      // 3. Cria perfil apenas para os novos inseridos
      const profilesPayload = newOnly.map(m => ({
        user_id: m.cpf,
        user_type: resolveUserType(m.ticket_type),
        onboarding_completed: false,
        password_reset: false,
        current_password: 'congresso2026',
        updated_at: new Date().toISOString()
      }));
      const { error: profilesErr } = await supabase
        .from('profiles')
        .upsert(profilesPayload, { onConflict: 'user_id', ignoreDuplicates: true });
      if (profilesErr) throw profilesErr;
    }

    return { success: true, inserted, skipped, count: inserted };
  } catch (error) {
    console.error('Falha genérica no adminService:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca todos os membros cadastrados com todos os campos necessários
 */
export const fetchAllMembers = async () => {
    const { data, error } = await supabase
        .from('members')
        .select('cpf, name, email, phone, institution, city, state, birth_date, ticket_type')
        .order('name');
    if (error) throw error;
    return data;
};

/**
 * Busca todos os perfis (onde mora o user_type)
 * A coluna de identificação do membro é 'user_id' (= CPF) na tabela profiles.
 * Retorna com a propriedade 'cpf' para compatibilidade com o restante do código.
 */
export const fetchAllProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('user_id, user_type, avatar_url, job_title');
    if (error) throw error;
    return (data || []).map(p => ({ ...p, cpf: p.user_id }));
};

/**
 * Cria ou atualiza um usuário administrativo (organizador, staff, patrocinador)
 */
export const createOrUpdateAdminUser = async (userData) => {
    const { cpf, name, email, user_type, password } = userData;
    const adminCpf = localStorage.getItem('current_user_cpf');

    if (!adminCpf) throw new Error("Acesso negado: Administrador não identificado.");

    const { data, error } = await supabase.rpc('admin_upsert_user', {
        p_admin_cpf: adminCpf,
        p_target_cpf: stripCPF(cpf),
        p_name: name,
        p_email: email,
        p_user_type: user_type,
        p_password: password || null
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);

    return { success: true };
};



/**
 * Exclui um membro e todos os seus dados vinculados usando RPC administrativo
 */
export const deleteMember = async (cpf) => {
    const cleanCpf = stripCPF(cpf);
    const adminCpf = localStorage.getItem('current_user_cpf');

    if (!adminCpf) throw new Error("Acesso negado: Administrador não identificado.");

    const { data, error } = await supabase.rpc('admin_delete_user', {
        p_admin_cpf: adminCpf,
        p_target_cpf: cleanCpf
    });

    if (error) throw error;
    if (data && !data.success) throw new Error(data.message);
    
    return { success: true };
};
