import { useState, useEffect, useCallback } from 'react';
import { cmsService } from '../services/cmsService';

/**
 * Hook para acessar conteúdo dinâmico do CMS com reatividade
 */
export function useCMS() {
  const [, setTick] = useState(0);

  // Força re-render quando o CMS sincronizar ou atualizar
  useEffect(() => {
    const handleUpdate = () => setTick(t => t + 1);
    window.addEventListener('cms-updated', handleUpdate);
    
    // Iniciar inicialização/sincronização se ainda não foi feita
    cmsService.initialize();
    
    return () => window.removeEventListener('cms-updated', handleUpdate);
  }, []);

  const getContent = useCallback((key, fallback) => {
    return cmsService.get(key, fallback);
  }, []);

  return {
    getContent,
    sync: () => cmsService.sync(),
    cms: cmsService
  };
}
