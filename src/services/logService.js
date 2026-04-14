import { supabase } from '../lib/supabase';

/**
 * SERVIÇO DE LOGS DO SISTEMA
 * Centraliza o registro de erros e atividades para manutenção.
 */
class LogService {
    /**
     * Registra um erro no banco de dados.
     * @param {string} message - Mensagem resumida do erro.
     * @param {Object} context - Detalhes técnicos (stack trace, props, state).
     * @param {string} component - Nome do componente onde o erro ocorreu.
     * @param {string} userId - ID ou CPF do usuário (opcional).
     */
    async error(message, context = {}, component = 'Unknown', userId = null) {
        console.error(`[System Error] ${component}: ${message}`, context);
        
        try {
            await supabase.from('app_system_logs').insert({
                level: 'error',
                message,
                context,
                component,
                user_id: userId,
                created_at: new Date().toISOString()
            });
        } catch (err) {
            // Se falhar o log no banco, loga local no console apenas para não entrar em loop
            console.warn("Falha ao persistir log no banco:", err);
        }
    }

    async warn(message, context = {}, component = 'Unknown', userId = null) {
        console.warn(`[System Warn] ${component}: ${message}`, context);
        try {
            await supabase.from('app_system_logs').insert({
                level: 'warning',
                message,
                context,
                component,
                user_id: userId
            });
        } catch (err) {}
    }

    async info(message, context = {}, component = 'Unknown', userId = null) {
        console.log(`[System Info] ${component}: ${message}`, context);
        try {
            await supabase.from('app_system_logs').insert({
                level: 'info',
                message,
                context,
                component,
                user_id: userId
            });
        } catch (err) {}
    }

    /**
     * Busca os últimos logs para exibição no painel administrativo.
     */
    async getRecentLogs(limit = 50) {
        const { data, error } = await supabase
            .from('app_system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }

    /**
     * Limpa logs antigos (opcional).
     */
    async clearLogs() {
        const { error } = await supabase.from('app_system_logs').delete().neq('level', 'keep');
        if (error) throw error;
        return true;
    }
}

export const logService = new LogService();
export default logService;
