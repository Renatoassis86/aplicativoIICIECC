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
    
    // Se o banco estiver zerado, popula com exemplos
    if (!rawPosts || rawPosts.length === 0) {
      await seedMockPosts(userId);
      const { data: retryPosts } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
      return processPostsResponse(retryPosts || [], userId);
    }

    return processPostsResponse(rawPosts, userId);
  } catch (err) {
    console.error("Supabase Social Error: ", err);
    return [];
  }
};

const processPostsResponse = async (rawPosts, userId) => {
    // 2. Busca Comentários
    const { data: comments } = await supabase.from('social_comments').select('*').order('created_at', { ascending: true });
    // 3. Busca Todos Engajamentos
    const { data: engagements } = await supabase.from('social_engagements').select('*');

    // 4. Transformação/Hydration
    const hydratedPosts = rawPosts.map(post => {
      
      const postComments = (comments || []).filter(c => c.post_id === post.id && !c.parent_id);
      
      const mappedComments = postComments.map(c => {
         const cLikes = (engagements || []).filter(e => e.target_type === 'comment_like' && e.target_id === c.id);
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

      const pLikes = (engagements || []).filter(e => e.target_type === 'post_like' && e.target_id === post.id);
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
        isSponsor: true, 
        comments: mappedComments,
        likes: pLikes.length,
        likedByMe: pLikes.some(e => e.user_id === userId),
        savedByMe: pSaves.some(e => e.user_id === userId),
        timeAgo: agilizarTempoRelativo(post.created_at)
      };
    });

    return hydratedPosts.sort((a, b) => (b.tier?.level || 0) - (a.tier?.level || 0));
};

// ============================================
// CRIAR E DELETAR POSTAGENS
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
// ENGAJAMENTO (LIKE / SAVE)
// ============================================
export const toggleLikePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, target_type: 'post_like', target_id: postId});
  } else {
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
// COMENTÁRIOS 
// ============================================
export const postComment = async (postId, text, authorName, authorId) => {
  const { data, error } = await supabase.from('social_comments').insert({
    post_id: postId,
    text,
    author_name: authorName,
    author_id: authorId
  }).select().single();
  
  if (error) return null;
  
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
// SEEDING
// ============================================
export const seedMockPosts = async (userId) => {
  const mocks = [
    {
      sponsor_name: 'ARKOS Education',
      sponsor_role: 'Patrocinador Diamante',
      tier_level: 4,
      sponsor_avatar: 'A',
      media_type: 'image',
      media_urls: ['https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=1000'],
      caption: '🚀 Bem-vindos ao II CIECC 2026! A ARKOS está aqui para revolucionar o networking educacional.',
      owner_id: userId
    },
    {
      sponsor_name: 'Tech Learning',
      sponsor_role: 'Sponsor Ouro',
      tier_level: 3,
      sponsor_avatar: 'T',
      media_type: 'image',
      media_urls: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000'],
      caption: 'Venha conhecer as novas soluções de IA para salas de aula no nosso estande B-12.',
      owner_id: userId
    }
  ];
  await supabase.from('social_posts').insert(mocks);
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
