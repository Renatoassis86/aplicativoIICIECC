import { supabase } from '../../lib/supabase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * SERVIÇO DE NOTIFICAÇÕES GLOBAIS
 * - Lida com as chamadas nativas do SO (iOS/Android) via Capacitor Push
 * - Lida com a Inbox Secundária (Persistência no App via Supabase)
 */

// ===================================
// INBOX IN-APP (SUPABASE PERSISTENCE)
// ===================================

/**
 * LER MENSAGENS (INBOX)
 * Busca notificações destinadas ao usuário (por CPF ou por Role global)
 */
export const fetchInbox = async (userCpf, userRole = 'congressista') => {
  try {
    if (!userCpf) {
      console.warn("[NotificationService] userId ausente. Pulando busca.");
      return [];
    }
    
    console.log(`[NotificationService] Fetching inbox for ${userCpf} (Role: ${userRole})`);

    // Try new schema (post-migration: target_user_cpf, target_role)
    let allNotifications;
    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .or(`target_user_cpf.eq.${userCpf},target_role.eq.all,target_role.eq.${userRole}`)
      .order('created_at', { ascending: false });

    if (error && error.code === '42703') {
      // Pre-migration fallback: columns don't exist yet, fetch all
      const fallback = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (fallback.error) return [];
      allNotifications = fallback.data;
    } else if (error) {
      throw error;
    } else {
      allNotifications = notifications;
    }

    // Deduplica por id (a query .or() pode retornar a mesma linha múltiplas vezes)
    const seen = new Set();
    const unique = (allNotifications || []).filter(n => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });

    // Read status — table may not exist pre-migration, handle gracefully
    let readIds = new Set();
    try {
      const { data: reads, error: readErr } = await supabase
        .from('system_notifications_reads')
        .select('notification_id')
        .eq('user_id', userCpf);
      if (!readErr && reads) readIds = new Set(reads.map(r => r.notification_id));
    } catch (_) {}

    return unique.map(n => ({
      ...n,
      isRead: readIds.has(n.id)
    }));
  } catch (err) {
    console.error("[NotificationService] Error fetching inbox:", err);
    return [];
  }
};

/**
 * MARCAR COMO LIDA
 */
export const markAsRead = async (userCpf, notificationId) => {
  try {
    if (!userCpf || !notificationId) return;

    const { error } = await supabase
      .from('system_notifications_reads')
      .upsert({ 
        user_id: userCpf, 
        notification_id: notificationId 
      }, { onConflict: 'user_id,notification_id' });

    if (error) {
      if (error.code === '23505') return; // Duplicate
      throw error;
    }
  } catch (err) {
    console.error("[NotificationService] Error marking as read:", err);
  }
};

// ==============================================
// REGISTRO DOS HARDWARES PARA PUSH (APNS/FCM)
// ==============================================

export const initPushNotifications = async (userId) => {
  if (!Capacitor.isNativePlatform()) {
    console.log("Push Notifications só ativarão dentro dos apps iOS e Android empacotados pelo Capacitor.");
    return;
  }

  try {
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
    }

    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM/APNS Token Registration: ', token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received na cara do gol: ', notification);
      alert('Nova Mensagem: ' + notification.title + '\n' + (notification.body || notification.message || ''));
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed - Abriu via Notificação: ', action);
    });

  } catch (err) {
    console.error("Native push error: ", err);
  }
};

/**
 * ESCUTA REALTIME PARA NOVOS ALERTAS GLOBAIS
 */
export const subscribeToNotifications = (onNewNotification) => {
  return supabase
    .channel('public:system_notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_notifications' }, 
      payload => {
        console.log('New notification received via Realtime!', payload.new);
        onNewNotification(payload.new);
      }
    )
    .subscribe();
};
