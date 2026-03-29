import { supabase } from '../../lib/supabase';

/**
 * SERVIÇO SOCIAL / FEED
 * Lida com o Feed Institucional, providenciando postagens dos patrocinadores
 * e o engajamento base (curtidas) dos congressistas.
 */

export const SPONSOR_TIERS = {
  DIAMOND: { level: 4, name: 'Diamante', color: '#B9F2FF' },
  GOLD: { level: 3, name: 'Ouro', color: '#FFD700' },
  SILVER: { level: 2, name: 'Prata', color: '#C0C0C0' },
  BRONZE: { level: 1, name: 'Bronze', color: '#CD7F32' }
};

export const fetchFeedPosts = async () => {
  try {
    // FUTURO SUPABASE:
    // Trazendo dados com JOIN. O algoritmo fará o Order By (tier_level DESC, created_at DESC).
    await new Promise(resolve => setTimeout(resolve, 800));

    // MOCK REALISTA para o Feed Institucional
    const rawPosts = [
      {
        id: 'post-1',
        sponsorName: 'Editora Trinitas',
        sponsorRole: 'Patrocinador Diamante',
        tier: SPONSOR_TIERS.DIAMOND,
        sponsorAvatar: 'T',
        mediaType: 'carousel',
        mediaUrls: [
          'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop'
        ],
        caption: 'Chegaram as novidades! Lançamento exclusivo da nossa nova coleção de Clássicos durante o II CIECC. Deslize para ver mais!',
        likes: 124,
        likedByMe: false,
        savedByMe: false,
        timeAgo: 'Há 2 horas',
        isSponsor: true
      },
      {
        id: 'post-2',
        sponsorName: 'Colégio Veritas',
        sponsorRole: 'Parceiro Ouro',
        tier: SPONSOR_TIERS.GOLD,
        sponsorAvatar: 'V',
        mediaType: 'image',
        mediaUrls: ['https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop'],
        caption: 'Momentos inspiradores no painel de abertura! É uma alegria compartilhar experiências com tantos educadores maravilhosos. #CIECC2026',
        likes: 312,
        likedByMe: true,
        savedByMe: true,
        timeAgo: 'Há 5 horas',
        isSponsor: true
      },
      {
        id: 'post-3',
        sponsorName: 'Arkos',
        sponsorRole: 'Expositor Prata',
        tier: SPONSOR_TIERS.SILVER,
        sponsorAvatar: 'A',
        mediaType: 'reel', // Vídeo vertical
        mediaUrls: ['https://cdn.pixabay.com/video/2020/05/11/38600-417122178_tiny.mp4'],
        caption: 'Venha conhecer o futuro da inteligência educacional. Assista ao nosso reel demonstrativo direto do stand!',
        likes: 541,
        likedByMe: false,
        savedByMe: false,
        timeAgo: 'Há 8 horas',
        isSponsor: true
      }
    ];

    // Algoritmo de Ranqueamento: Mistura peso do Plano de Patrocínio (Level) com Recência
    // Regra simples do front: Ordena primariamente pelo nível do tier (Diamante > Ouro > Prata) e depois por tempo.
    return rawPosts.sort((a, b) => b.tier.level - a.tier.level);

  } catch (error) {
    console.error("Erro ao carregar o feed social", error);
    return [];
  }
};

export const toggleLikePost = async (postId, currentState) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return !currentState;
};

export const toggleSavePost = async (postId, currentState) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return !currentState;
};
