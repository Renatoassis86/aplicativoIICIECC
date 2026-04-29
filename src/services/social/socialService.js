import { supabase } from '../../lib/supabase';

/**
 * SERVIÇO SOCIAL / FEED: INTEGRAÇÃO SUPABASE REAL
 * Gerencia postagens, likes, saves e comentários permanentemente nas tabelas relacionais.
 */

export const SPONSOR_TIERS = {
  GOLD: { level: 3, name: 'Ouro', color: '#FFD700' },
  SILVER: { level: 2, name: 'Prata', color: '#C1C1C1' },
  BRONZE: { level: 1, name: 'Bronze', color: '#CD7F32' },
  ORGANIZADOR: { level: 4, name: 'Organizador', color: '#FFFFFF' }
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
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (postErr) {
      console.warn("[SocialService] Error fetching posts:", postErr.message);
      return [];
    }
    
    return processPostsResponse(rawPosts || [], userId);
  } catch (err) {
    console.error("[SocialService] Critical Error: ", err);
    return [];
  }
};

const processPostsResponse = async (rawPosts, userId) => {
    if (!rawPosts || rawPosts.length === 0) return [];
    
    try {
        const postIds = rawPosts.map(p => p.id);

        // 1. Fetch only comments for these posts
        const { data: allComments } = await supabase
          .from('social_comments')
          .select('*')
          .in('post_id', postIds)
          .order('created_at', { ascending: true });

        // 2. Fetch engagements for posts and their comments
        const commentIds = (allComments || []).map(c => c.id);
        const { data: postEngs } = await supabase
          .from('social_engagements')
          .select('*')
          .in('post_id', postIds);
        const { data: commentEngs } = commentIds.length > 0
          ? await supabase.from('social_engagements').select('*').in('comment_id', commentIds)
          : { data: [] };
        const engagements = [...(postEngs || []), ...(commentEngs || [])];

        const hydratedPosts = await Promise.all(rawPosts.map(async post => {
          try {
              const flatComments = (allComments || []).filter(c => c.post_id === post.id);
              
              // Build recursive comment tree
              const buildTree = (parentId = null) => {
                return flatComments
                  .filter(c => c.parent_id === parentId)
                  .map(c => {
                    const cLikes = (engagements || []).filter(e => e.type === 'like_comment' && e.comment_id === c.id);
                    return {
                      ...c,
                      authorName: c.user_name,
                      text: c.content,
                      isOwner: c.user_id === userId,
                      likes: cLikes.length,
                      likedByMe: cLikes.some(e => e.user_id === userId),
                      replies: buildTree(c.id)
                    };
                  });
              };

              const pLikes = (engagements || []).filter(e => e.type === 'post_like' && e.post_id === post.id);
              const pSaves = (engagements || []).filter(e => e.type === 'post_save' && e.post_id === post.id);

              // Hydrate Tagged Users
              let taggedUsersNames = [];
              if (post.tagged_user_ids && Array.isArray(post.tagged_user_ids) && post.tagged_user_ids.length > 0) {
                const validIds = post.tagged_user_ids.filter(id => id && id.length > 5);
                if (validIds.length > 0) {
                  const { data: memberData } = await supabase.from('members').select('name').in('cpf', validIds);
                  taggedUsersNames = (memberData || []).map(m => m.name);
                }
              }

              return {
                id: post.id,
                sponsorName: post.author_name || post.sponsor_name || 'Organização CIECC',
                sponsorRole: post.author_role || post.sponsor_role || 'Comunicado Oficial',
                tier: getSponsorTierByLevel(post.author_tier || post.tier_level || 4),
                sponsorAvatar: (post.author_name || post.sponsor_name || 'C').charAt(0).toUpperCase(),
                mediaType: post.content_type || post.media_type || 'image',
                mediaUrls: post.media_urls || [],
                caption: post.caption || '',
                isPinned: post.is_pinned || false,
                isArchived: post.is_archived || false,
                isSponsor: (post.author_tier || post.tier_level || 4) > 1, 
                comments: buildTree(null),
                likes: pLikes.length,
                likedByMe: pLikes.some(e => e.user_id === userId),
                savedByMe: pSaves.some(e => e.user_id === userId),
                timeAgo: agilizarTempoRelativo(post.created_at),
                taggedUsers: taggedUsersNames,
                user_id: post.user_id || post.owner_id
              };
          } catch (itemErr) {
              console.error("[SocialService] Error hydrating post:", post.id, itemErr);
              return null;
          }
        }));

        return hydratedPosts.filter(p => p !== null);
    } catch (err) {
        console.error("[SocialService] processPostsResponse Critical Error:", err);
        return [];
    }
};

export const togglePinPost = async (postId, currentState) => {
  await supabase.from('social_posts').update({ is_pinned: !currentState }).eq('id', postId);
  return !currentState;
};

export const toggleArchivePost = async (postId, currentState) => {
  await supabase.from('social_posts').update({ is_archived: !currentState }).eq('id', postId);
  return !currentState;
};

export const createPost = async (authorName, authorRole, authorTier, contentType, mediaUrls, caption, userId, taggedUserIds = []) => {
  // 1. Criar o post
  const { data, error } = await supabase.from('social_posts').insert({
    author_name: authorName,
    author_role: authorRole,
    author_tier: authorTier,
    content_type: contentType,
    media_urls: mediaUrls,
    caption,
    user_id: userId,
    tagged_user_ids: taggedUserIds // Novo campo no banco
  }).select().single();
  
  if (error) throw error;

  // 2. Notificar usuários marcados (se houver)
  if (taggedUserIds && taggedUserIds.length > 0) {
    const notifications = taggedUserIds.map(targetId => ({
      title: "Você foi marcado!",
      message: `${authorName} marcou você em uma nova publicação no feed.`,
      target_user_cpf: targetId,
      type: 'tag',
      author_id: userId,
      sender_name: authorName,
      target_role: 'congressista'
    }));

    await supabase.from('system_notifications').insert(notifications);
  }

  return data;
};

/**
 * BUSCAR USUÁRIOS PARA MARCAÇÃO
 * Procura na tabela de perfis (profiles ou members) por nomes semelhantes ao query.
 */
export const searchUsers = async (query) => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('members') 
      .select('cpf, name')
      .ilike('name', `%${query}%`)
      .limit(10);
      
    if (error) throw error;
    // Map to normalized format
    return (data || []).map(u => ({
      id: u.cpf,
      full_name: u.name,
      role: 'Participante'
    }));
  } catch (err) {
    console.error("[SocialService] searchUsers error:", err);
    return [];
  }
};

export const deletePostApi = async (postId) => {
  // 1. Opcional: deletar engajamentos e comentários vinculados (ou confiar em ON DELETE CASCADE)
  await supabase.from('social_comments').delete().eq('post_id', postId);
  await supabase.from('social_engagements').delete().eq('post_id', postId);
  
  // 2. Deletar o post
  await supabase.from('social_posts').delete().eq('id', postId);
  return true;
};

export const updatePostApi = async (postId, updates) => {
  const { data, error } = await supabase
    .from('social_posts')
    .update({
      caption: updates.caption,
      tagged_user_ids: updates.taggedUserIds
    })
    .eq('id', postId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const toggleLikePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, type: 'post_like', post_id: postId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, type: 'post_like', post_id: postId});
  }
  return !currentState;
};

export const postComment = async (postId, text, authorName, authorId, parentId = null) => {
  try {
    const { data, error } = await supabase.from('social_comments').insert({
      post_id: postId,
      content: text,
      user_name: authorName,
      user_id: authorId,
      parent_id: parentId
    }).select().single();
    
    if (error || !data) throw new Error("Falha ao postar comentário.");

    return {
      ...data,
      authorName: data.user_name,
      text: data.content,
      isOwner: true,
      likes: 0,
      likedByMe: false,
      replies: []
    };
  } catch (err) {
    console.error("[postComment]", err);
    return null;
  }
};

export const toggleSavePost = async (postId, currentState, userId) => {
  if (currentState) {
    await supabase.from('social_engagements').delete().match({ user_id: userId, type: 'post_save', post_id: postId});
  } else {
    await supabase.from('social_engagements').insert({ user_id: userId, type: 'post_save', post_id: postId});
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
  if (dif < 1000) return 'agora'; // Menos de 1 segundo
  
  const mins = Math.floor(dif / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}
