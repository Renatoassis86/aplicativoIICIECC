import { supabase } from '../lib/supabase';

const CACHE_KEY = 'app_cms_cache';

/**
 * Serviço para gerenciamento dinâmico de conteúdo (CMS)
 * Implementa estratégia Stale-while-revalidate com LocalStorage
 */
class CMSService {
  constructor() {
    this.cache = this._loadCache();
    this.initializationPromise = null;
  }

  /**
   * Inicializa o serviço carregando dados do Supabase em background
   */
  async initialize() {
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.sync();
    return this.initializationPromise;
  }

  /**
   * Sincroniza o conteúdo local com o banco de dados
   */
  async sync() {
    try {
      const { data, error } = await supabase
        .from('content_registry')
        .select('key, value');

      if (error) throw error;

      const newCache = {};
      data.forEach(item => {
        newCache[item.key] = item.value;
      });

      this.cache = newCache;
      this._saveCache(newCache);
      
      // Emitir evento customizado para componentes interessados
      window.dispatchEvent(new CustomEvent('cms-updated'));
      
      return true;
    } catch (error) {
      console.error('Erro ao sincronizar CMS:', error);
      return false;
    }
  }

  /**
   * Obtém um conteúdo pela chave. Retorna fallback se não encontrado.
   */
  get(key, fallback = null) {
    return this.cache[key] !== undefined ? this.cache[key] : fallback;
  }

  /**
   * Salva um conteúdo ou configuração
   */
  async updateContent(section, key, value) {
    try {
      const { data, error } = await supabase
        .from('content_registry')
        .upsert({ 
          section, 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'key' })
        .select()
        .single();

      if (error) throw error;

      // Atualiza cache local
      this.cache[key] = value;
      this._saveCache(this.cache);
      
      window.dispatchEvent(new CustomEvent('cms-updated'));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar CMS:', error);
      throw error;
    }
  }

  /**
   * Gerenciamento de Mídia
   */
  async getMedia() {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn("[CMS] Erro ao buscar ativos de mídia:", error.message);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('[CMS] Erro ao recuperar mídia:', error);
      return [];
    }
  }

  async uploadMedia(file, title, description, type) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('app_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          title,
          description,
          media_type: type,
          source_type: 'upload',
          url_or_path: filePath
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro no upload de mídia:', error);
      throw error;
    }
  }

  async addMediaLink(title, description, type, url, isLive = false) {
    try {
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          title,
          description,
          media_type: type,
          source_type: 'link',
          url_or_path: url,
          is_live_stream: isLive
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao adicionar link de mídia:', error);
      throw error;
    }
  }

  // --- Privados ---

  _loadCache() {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  _saveCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar cache CMS no LocalStorage');
    }
  }
}

export const cmsService = new CMSService();
