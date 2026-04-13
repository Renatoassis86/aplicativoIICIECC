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

    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .or(`target_user_cpf.eq.${userCpf},target_role.eq.all,target_role.eq.${userRole}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Busca as notificações já lidas por este usuário
    const { data: reads, error: readErr } = await supabase
      .from('system_notifications_reads')
      .select('notification_id')
      .eq('user_cpf', userCpf);

    if (readErr) throw readErr;

    const readIds = new Set((reads || []).map(r => r.notification_id));

    return (notifications || []).map(n => ({
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
        user_cpf: userCpf, 
        notification_id: notificationId 
      }, { onConflict: 'user_cpf,notification_id' });

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
