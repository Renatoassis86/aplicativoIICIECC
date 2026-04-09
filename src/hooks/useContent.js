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
    async function fetchContent() {
      setLoading(true);
      let query = supabase.from('content_registry').select('*');
      
      if (section) query = query.eq('section', section);
      if (key) query = query.eq('key', key);

      const { data, error } = await query;

      if (!error && data) {
        if (key && data.length > 0) {
          setContent(data[0].value);
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
      setLoading(false);
    }

    fetchContent();
  }, [section, key]);

  return { content, loading };
}
