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
    console.log("[SocialService] Fetching posts for user:", userId);
    
    const { data: rawPosts, error: postErr } = await supabase
      .from('social_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (postErr) {
      console.warn("[SocialService] Error fetching posts:", postErr.message);
      return [];
    }
    
    if (!rawPosts || rawPosts.length === 0) {
      console.log("[SocialService] Feed empty, seeding mock posts...");
      const seeded = await seedMockPosts(userId);
      if (seeded) {
        const { data: retryPosts } = await supabase
          .from('social_posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        return processPostsResponse(retryPosts || [], userId);
      }
    }

    return processPostsResponse(rawPosts, userId);
  } catch (err) {
    console.error("[SocialService] Critical Error: ", err);
    return [];
  }
};

const processPostsResponse = async (rawPosts, userId) => {
    const { data: comments } = await supabase.from('social_comments').select('*').order('created_at', { ascending: true });
    const { data: engagements } = await supabase.from('social_engagements').select('*');

    const hydratedPosts = rawPosts.map(post => {
      const postComments = (comments || []).filter(c => c.post_id === post.id);
      
      const pLikes = (engagements || []).filter(e => e.type === 'like' && e.post_id === post.id);

      return {
        id: post.id,
        sponsorName: post.author_name,
        sponsorRole: post.author_role,
        tier: getSponsorTierByLevel(post.author_tier),
        sponsorAvatar: post.author_name.charAt(0).toUpperCase(),
        mediaType: post.content_type || 'image',
        mediaUrls: post.media_urls || [],
        caption: post.caption,
        isSponsor: true, 
        comments: postComments.map(c => {
          const cLikes = (engagements || []).filter(e => e.type === 'like_comment' && e.comment_id === c.id);
          return {
            ...c,
            authorName: c.user_name,
            text: c.content,
            isOwner: c.user_id === userId,
            likes: cLikes.length,
            likedByMe: cLikes.some(e => e.user_id === userId)
          };
        }),
        likes: pLikes.length,
        likedByMe: pLikes.some(e => e.user_id === userId),
        timeAgo: agilizarTempoRelativo(post.created_at)
      };
    });

    return hydratedPosts;
};

export const createPost = async (authorName, authorRole, authorTier, contentType, mediaUrls, caption, userId) => {
  const { data, error } = await supabase.from('social_posts').insert({
    author_name: authorName,
    author_role: authorRole,
    author_tier: authorTier,
    content_type: contentType,
    media_urls: mediaUrls,
    caption,
    user_id: userId
  }).select().single();
  if (error) throw error;
  return data;
};

export const deletePostApi = async (postId) => {
  await supabase.from('social_posts').delete().eq('id', postId);
  return true;
};

export const toggleLikePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, type: 'like', post_id: postId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, type: 'like', post_id: postId});
  }
  return !currentState;
};

export const postComment = async (postId, text, authorName, authorId) => {
  try {
    const { data, error } = await supabase.from('social_comments').insert({
      post_id: postId,
      content: text,
      user_name: authorName,
      user_id: authorId
    }).select().single();
    
    if (error || !data) throw new Error("Falha ao postar comentário.");

    return {
      ...data,
      authorName: data.user_name,
      text: data.content,
      isOwner: true,
      likes: 0,
      likedByMe: false
    };
  } catch (err) {
    console.error("[postComment]", err);
    return null;
  }
};

export const toggleSavePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, type: 'save', post_id: postId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, type: 'save', post_id: postId});
  }
  return !currentState;
};

export const deleteCommentApi = async (commentId) => {
  await supabase.from('social_comments').delete().eq('id', commentId);
  return true;
};

export const toggleLikeComment = async (commentId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, type: 'like_comment', comment_id: commentId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, type: 'like_comment', comment_id: commentId});
  }
  return !currentState;
};

export const seedMockPosts = async (userId) => {
  const mocks = [
    {
      author_name: 'Organização CIECC',
      author_role: 'Diretoria Geral',
      author_tier: 4,
      content_type: 'video',
      media_urls: ['https://www.w3schools.com/html/mov_bbb.mp4'],
      caption: '🚀 Bem-vindos ao II CIECC! Estamos preparando uma experiência inesquecível de educação clássica. Confira os preparativos!',
      user_id: userId
    },
    {
      author_name: 'PACTUM',
      author_role: 'Patrocinador Diamante',
      author_tier: 4,
      content_type: 'image',
      media_urls: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&fit=crop'],
      caption: '✅ Consultoria e implementação de escolas clássicas. A PACTUM está presente no II CIECC. #PACTUM #CIECC2026',
      user_id: userId
    },
    {
      author_name: 'Editora Trinitas',
      author_role: 'Patrocinador Ouro',
      author_tier: 3,
      content_type: 'image',
      media_urls: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&fit=crop'],
      caption: '📚 Lançamentos exclusivos para o II CIECC! Visite nosso estande.',
      user_id: userId
    }
  ];
  const { error } = await supabase.from('social_posts').insert(mocks);
  if (error) {
    console.warn("[SocialService] Seed failed:", error.message);
    return false;
  }
  return true;
};

// ============================================
// UTILS
// ============================================
function agilizarTempoRelativo(isoDate) {
  if (!isoDate) return 'agora';
  const d = new Date(isoDate);
  const dif = Date.now() - d.getTime();
  const mins = Math.floor(dif / 60000);
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}
