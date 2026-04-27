import { supabase } from '../lib/supabase';

export const logService = {
  async log(level, message, details = {}, component = 'unknown', userCpf = null) {
    console.log(`[${level.toUpperCase()}] ${component}: ${message}`, details);
    
    try {
      await supabase.from('system_logs').insert([{
        level,
        message,
        details,
        component,
        user_cpf: userCpf || localStorage.getItem('current_user_cpf'),
      }]);
    } catch (e) {
      console.error("Falha ao gravar log no banco:", e);
    }
  },

  async getRecentLogs(limit = 100) {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  async clearLogs() {
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (error) throw error;
  },

  error(message, details = {}, component = 'unknown') {
    return this.log('error', message, details, component);
  },

  warn(message, details = {}, component = 'unknown') {
    return this.log('warning', message, details, component);
  },

  info(message, details = {}, component = 'unknown') {
    return this.log('info', message, details, component);
  }
};
