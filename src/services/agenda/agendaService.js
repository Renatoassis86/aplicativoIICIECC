import { supabase } from '../../lib/supabase';

/**
 * Busca materiais de uma sessão específica
 * @param {number} sessionId 
 */
export const fetchSessionMaterials = async (sessionId) => {
  const { data, error } = await supabase
    .from('session_materials')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
  return data;
};

/**
 * Adiciona um material a uma sessão
 */
export const addSessionMaterial = async (sessionId, title, fileUrl) => {
  const { data, error } = await supabase
    .from('session_materials')
    .insert([
      { session_id: sessionId, title, file_url: fileUrl }
    ])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Deleta um material
 */
export const deleteSessionMaterial = async (id) => {
  const { error } = await supabase
    .from('session_materials')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Busca os IDs das sessões favoritadas pelo usuário
 */
export const fetchUserFavorites = async (userCpf) => {
    if (!userCpf) return [];
    const { data, error } = await supabase
        .from('agenda_favorites')
        .select('session_id')
        .eq('user_cpf', userCpf);
    
    if (error) {
        console.error('Error fetching favorites:', error);
        return [];
    }
    return data.map(f => f.session_id);
};

/**
 * Alterna estado de favorito no banco de dados
 */
export const toggleFavoriteSession = async (userCpf, sessionId) => {
    if (!userCpf || !sessionId) return;

    // 1. Verificar se já existe
    const { data } = await supabase
        .from('agenda_favorites')
        .select('id')
        .eq('user_cpf', userCpf)
        .eq('session_id', sessionId)
        .maybeSingle();

    if (data) {
        // Remover
        await supabase.from('agenda_favorites').delete().eq('id', data.id);
        return false; // Result is not favorite
    } else {
        // Adicionar
        await supabase.from('agenda_favorites').insert([
            { user_cpf: userCpf, session_id: sessionId }
        ]);
        return true; // Result is favorite
    }
};

/**
 * Verifica se a sessão já começou para liberar o material
 * @param {string} date "DD/MM" 
 * @param {string} time "HH:mm"
 */
export const isSessionLiveOrFinished = (date, time) => {
  try {
    const now = new Date();
    const currentYear = 2026; // Fixado para o evento
    
    // Formato date: "01/05"
    const [day, month] = date.split('/').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    
    const sessionDate = new Date(currentYear, month - 1, day, hours, minutes);
    
    return now >= sessionDate;
  } catch (e) {
    console.error('Time check error:', e);
    return false;
  }
};
