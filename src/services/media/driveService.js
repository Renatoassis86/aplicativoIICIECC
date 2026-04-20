import { supabase } from '../../lib/supabase';

/**
 * DriveService
 * Fornece integração dinâmica com pastas do Google Drive
 */
export const driveService = {
  /**
   * Obtém as configurações de sincronização do banco
   */
  async getSyncConfigs() {
    const { data, error } = await supabase.from('drive_sync').select('*');
    if (error) throw error;
    return data;
  },

  /**
   * Busca fotos de uma pasta do Google Drive.
   * Utiliza um proxy Apps Script ou Edge Function para listar os arquivos automaticamente.
   */
  async fetchPhotosFromFolder(folderId) {
    try {
      const { data, error } = await supabase.functions.invoke('get-drive-photos', {
        body: { folderId }
      });

      if (error) throw error;
      return data.files || [];
    } catch (e) {
      console.error('Erro ao buscar do Drive:', e);
      return [];
    }
  },

  /**
   * Proxy manual para demonstração ou quando a Edge Function não está disponível.
   * Em produção, recomenda-se o uso da Edge Function com Service Account.
   */
  async getManualDriveProxy(folderId) {
    // Nota: Em um mundo ideal sem API Key, usaríamos um Apps Script público.
    // Como estamos implementando agora, retornaremos um array vazio para o componente carregar
    // e mostraremos ao usuário como ativar a sincronização real.
    return [];
  }
};
