import { supabase } from '../../lib/supabase';

/**
 * SERVIÇO SOCIAL / FEED: INTEGRAÇÃO SUPABASE REAL
 * Gerencia postagens, likes, saves e comentários permanentemente nas tabelas relacionais.
 */

export const SPONSOR_TIERS = {
  DIAMOND: { level: 4, name: 'Diamante', color: '#B9F2FF' },
  GOLD: { level: 3, name: 'Ouro', color: '#FFD700' },
  SILVER: { level: 2, name: 'Prata', color: '#C0C0C0' },
  BRONZE: { level: 1, name: 'Bronze', color: '#CD7F32' }
};

const getSponsorTierByLevel = (level) => {
  return Object.values(SPONSOR_TIERS).find(t => t.level === level) || null;
};

// ============================================
// LER POSTAGENS
// ============================================
export const fetchFeedPosts = async (userId) => {
  try {
    // 1. Busca os Posts puros
    const { data: rawPosts, error: postErr } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
    if (postErr) throw postErr;
    if (!rawPosts) return [];

    // 2. Busca Comentários (para mapear nos posts depois)
    const { data: comments, error: commErr } = await supabase.from('social_comments').select('*').order('created_at', { ascending: true });
    
    // 3. Busca Todos Engajamentos do Sistema
    const { data: engagements, error: engErr } = await supabase.from('social_engagements').select('*');

    // 4. Transformação/Hydration (Montando JSON igual ao mock para o UI Componente não quebrar)
    const hydratedPosts = rawPosts.map(post => {
      
      // Filtra comentários root deste post (sem parent_id)
      const postComments = (comments || []).filter(c => c.post_id === post.id && !c.parent_id);
      
      const mappedComments = postComments.map(c => {
         // Likes no comentário?
         const cLikes = (engagements || []).filter(e => e.target_type === 'comment_like' && e.target_id === c.id);
         // Respostas ao comentário
         const replies = (comments || []).filter(r => r.parent_id === c.id).map(r => {
           const rLikes = (engagements || []).filter(e => e.target_type === 'comment_like' && e.target_id === r.id);
           return {
             ...r,
             isOwner: r.author_id === userId,
             likes: rLikes.length,
             likedByMe: rLikes.some(e => e.user_id === userId)
           };
         });

         return {
           ...c,
           isOwner: c.author_id === userId,
           likes: cLikes.length,
           likedByMe: cLikes.some(e => e.user_id === userId),
           replies
         };
      });

      // Likes do Post
      const pLikes = (engagements || []).filter(e => e.target_type === 'post_like' && e.target_id === post.id);
      // Saves do Post
      const pSaves = (engagements || []).filter(e => e.target_type === 'post_save' && e.target_id === post.id);

      return {
        id: post.id,
        sponsorName: post.sponsor_name,
        sponsorRole: post.sponsor_role,
        tier: getSponsorTierByLevel(post.tier_level),
        sponsorAvatar: post.sponsor_avatar,
        mediaType: post.media_type,
        mediaUrls: post.media_urls || [],
        caption: post.caption,
        isSponsor: true, // todos la sao
        comments: mappedComments,
        
        // Metadados Dinâmicos do Usuário Vigente
        likes: pLikes.length,
        likedByMe: pLikes.some(e => e.user_id === userId),
        savedByMe: pSaves.some(e => e.user_id === userId),
        timeAgo: agilizarTempoRelativo(post.created_at) // helper interno
      };
    });

    // 5. Algoritmo de Ranking final:
    return hydratedPosts.sort((a, b) => b.tier.level - a.tier.level);

  } catch (err) {
    console.error("Supabase Social Error: ", err);
    return [];
  }
};

// ============================================
// CRIAR E DELETAR POSTAGENS (EXCLUSIVO SPONSOR)
// ============================================
export const createPost = async (sponsorName, sponsorRole, tierLevel, mediaType, mediaUrls, caption, userId) => {
  const { data, error } = await supabase.from('social_posts').insert({
    sponsor_name: sponsorName,
    sponsor_role: sponsorRole,
    tier_level: tierLevel,
    sponsor_avatar: sponsorName.charAt(0).toUpperCase(),
    media_type: mediaType,
    media_urls: mediaUrls,
    caption,
    owner_id: userId
  }).select().single();
  if (error) throw error;
  return data;
};

export const deletePostApi = async (postId) => {
  await supabase.from('social_posts').delete().eq('id', postId);
  return true;
};

// ============================================
// ENGAJAMENTO DE POSTAGEM (LIKE / SAVE)
// ============================================
export const toggleLikePost = async (postId, currentState, userId) => {
  if (currentState) {
    // Removendo (estava curtido)
    await supabase.from('social_engagements').delete().match({ user_id: userId, target_type: 'post_like', target_id: postId});
  } else {
    // Adicionando
    await supabase.from('social_engagements').insert({ user_id: userId, target_type: 'post_like', target_id: postId});
  }
  return !currentState;
};

export const toggleSavePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, target_type: 'post_save', target_id: postId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, target_type: 'post_save', target_id: postId});
  }
  return !currentState;
};

// ============================================
// COMENTÁRIOS E SEU ENGAJAMENTO
// ============================================
export const postComment = async (postId, text, authorName, authorId) => {
  const { data, error } = await supabase.from('social_comments').insert({
    post_id: postId,
    text,
    author_name: authorName,
    author_id: authorId
  }).select().single();
  
  if (error) {
    console.error(error);
    return null;
  }
  // Retorna forma mock adaptada pro front instantaneamente re-renderizar
  return {
    id: data.id,
    authorName: data.author_name,
    authorAvatar: data.author_name.charAt(0),
    text: data.text,
    likes: 0,
    likedByMe: false,
    isOwner: true,
    replies: []
  };
};

export const deleteCommentApi = async (commentId) => {
  await supabase.from('social_comments').delete().eq('id', commentId);
  return true;
};

export const toggleLikeComment = async (commentId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, target_type: 'comment_like', target_id: commentId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, target_type: 'comment_like', target_id: commentId});
  }
  return !currentState;
};

// ============================================
// UTILS
// ============================================
function agilizarTempoRelativo(isoDate) {
  const d = new Date(isoDate);
  const dif = Date.now() - d.getTime();
  const mins = Math.floor(dif / 60000);
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}
