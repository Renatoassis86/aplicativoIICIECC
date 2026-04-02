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
