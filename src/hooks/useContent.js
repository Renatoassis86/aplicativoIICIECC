import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Hook universal para carregar conteúdos dinâmicos do CMS (content_registry)
 * Pode buscar uma chave específica ou uma seção inteira.
 */
export function useContent(section = null, key = null) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchContent() {
      try {
        setLoading(true);
        let query = supabase.from('content_registry').select('*');

        if (section) query = query.eq('section', section);
        if (key) query = query.eq('key', key);

        const { data, error } = await query;
        if (error) throw error;

        if (isMounted) {
          if (key) {
            if (data.length > 0) {
              setContent(data[0].value);
            } else {
              setContent(null); // Key provided but not found
            }
          } else if (section) {
            // Retorna um objeto mapeado por chaves
            const mapped = data.reduce((acc, curr) => {
              acc[curr.key] = curr.value;
              return acc;
            }, {});
            setContent(mapped);
          } else {
            setContent(data);
          }
        }
      } catch (err) {
        console.error(`[useContent] Erro ao carregar (${section}/${key}):`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
      setLoading(false);
    }

    fetchContent();

    // SUBSCRIPTION REALTIME: Garante sincronização imediata com Admin
    const subscription = supabase
      .channel(`content_registry_${section || 'all'}_${key || 'all'}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'content_registry'
      }, () => {
        fetchContent();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(subscription);
    };
  }, [section, key]);

  return { content, loading };
}
