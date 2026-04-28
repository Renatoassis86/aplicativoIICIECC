import { supabase } from '../../lib/supabase';

// Extrai IDs de arquivo do HTML do embeddedfolderview
const parseFileIdsFromHtml = (html) => {
  const ids = [];
  const seen = new Set();

  // Padrão principal: entry-{fileId}
  const entryRegex = /"entry-([a-zA-Z0-9_-]{10,})"/g;
  for (const m of html.matchAll(entryRegex)) {
    if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
  }

  // Fallback: thumbnail?id={fileId}
  if (ids.length === 0) {
    const thumbRegex = /thumbnail\?id=([a-zA-Z0-9_-]{10,})/g;
    for (const m of html.matchAll(thumbRegex)) {
      if (!seen.has(m[1])) { seen.add(m[1]); ids.push(m[1]); }
    }
  }

  return ids;
};

const buildPhotos = (ids) =>
  ids.map(id => ({ id, name: id, url: `https://lh3.googleusercontent.com/d/${id}=w800` }));

export const driveService = {
  async getSyncConfigs() {
    const { data, error } = await supabase.from('drive_sync').select('*');
    if (error) throw error;
    return data || [];
  },

  async fetchPhotosFromFolder(folderId) {
    if (!folderId) return [];

    // Método 1: Edge Function (quando deployada)
    try {
      const { data, error } = await supabase.functions.invoke('get-drive-photos', {
        body: { folderId }
      });
      if (!error && data?.files?.length > 0) {
        return data.files;
      }
    } catch (_) { /* fallback */ }

    // Método 2: CORS proxy → scraping HTML
    const driveUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}`;
    const proxies = [
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(driveUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(driveUrl)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const html = await res.text();
        const ids = parseFileIdsFromHtml(html);
        if (ids.length > 0) return buildPhotos(ids);
      } catch (_) { /* try next */ }
    }

    return [];
  },
};
