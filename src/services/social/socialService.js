import { supabase } from '../../lib/supabase';

/**
 * SERVIÇO SOCIAL / FEED
 * Lida com o Feed Institucional, providenciando postagens dos patrocinadores
 * e o engajamento base (curtidas) dos congressistas.
 */

export const fetchFeedPosts = async () => {
  try {
    // FUTURO SUPABASE:
    // const { data, error } = await supabase.from('social_posts').select('*, profiles(name, avatar_url)').order('created_at', { ascending: false });

    await new Promise(resolve => setTimeout(resolve, 800));

    // MOCK REALISTA para o Feed Institucional
    return [
      {
        id: 'post-1',
        sponsorName: 'Editora Trinitas',
        sponsorRole: 'Patrocinador Premium',
        sponsorAvatar: 'T',
        imageUrl: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?q=80&w=800&auto=format&fit=crop',
        caption: 'Chegaram as novidades! Lançamento exclusivo da nossa nova coleção de Clássicos durante o II CIECC. Visite nosso estande na ala B.',
        likes: 124,
        likedByMe: false,
        timeAgo: 'Há 2 horas',
        isSponsor: true
      },
      {
        id: 'post-2',
        sponsorName: 'Colégio Veritas',
        sponsorRole: 'Parceiro Educacional',
        sponsorAvatar: 'V',
        imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=800&auto=format&fit=crop',
        caption: 'Momentos inspiradores no painel de abertura! É uma alegria compartilhar experiências com tantos educadores maravilhosos. #CIECC2026',
        likes: 312,
        likedByMe: true,
        timeAgo: 'Há 5 horas',
        isSponsor: true
      },
      {
        id: 'post-3',
        sponsorName: 'Organização CIECC',
        sponsorRole: 'Staff Oficial',
        sponsorAvatar: 'C',
        imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=800&auto=format&fit=crop',
        caption: 'Atenção inscritos: A plenária principal será aberta em 30 minutos. Preparamos uma surpresa incrível para o encerramento da manhã.',
        likes: 541,
        likedByMe: false,
        timeAgo: 'Há 8 horas',
        isSponsor: true
      }
    ];
  } catch (error) {
    console.error("Erro ao carregar o feed social", error);
    return [];
  }
};

export const toggleLikePost = async (postId, currentState) => {
  // Simulando resposta de banco de dados
  await new Promise(resolve => setTimeout(resolve, 300));
  return !currentState;
};
