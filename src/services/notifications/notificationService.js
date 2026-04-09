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

export const fetchInbox = async (userId, userRole) => {
  try {
    // 1. Constrói o filtro lógico: Tudo de "all" + Role Específica + Menção Pessoal
    let audienceFilter = `target_role.eq.all,target_role.eq.${userRole || 'congressista'}`;
    if (userRole?.includes('patrocinador')) audienceFilter += `,target_role.eq.sponsors`;
    if (userRole === 'staff' || userRole === 'admin' || userRole === 'organizador') audienceFilter += `,target_role.eq.staff`;
    
    // Adiciona o filtro para notificações direcionadas diretamente à este ID (ex: Marcação)
    // Suporta tanto o antigo target_user_id (UUID) quanto o novo target_user_cpf (Text)
    audienceFilter += `,target_user_cpf.eq.${userId}`;

    // 2. Busca mensagens destinadas a este público
    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .or(audienceFilter)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!notifications) return { unreadCount: 0, items: [] };

    // 3. Busca o que o usuário já leu
    const { data: reads, error: readsErr } = await supabase
      .from('system_notifications_reads')
      .select('notification_id')
      .eq('user_id', userId);

    if (readsErr) throw readsErr;

    const readIds = new Set(reads.map(r => r.notification_id));

    // 4. Mescla estado
    let unreadCount = 0;
    const items = notifications.map(n => {
      const isRead = readIds.has(n.id);
      if (!isRead) unreadCount++;
      return { ...n, isRead };
    });

    return { unreadCount, items };
  } catch (err) {
    console.error("Notifications fetch error: ", err);
    return { unreadCount: 0, items: [] };
  }
};

export const markAsRead = async (notificationId, userId) => {
  try {
    const { error } = await supabase
      .from('system_notifications_reads')
      .insert({ notification_id: notificationId, user_id: userId });
      
    // Se der erro de duplicate key (já leu), apenas ignora.
    if (error && error.code !== '23505') throw error;
    return true;
  } catch (err) {
    console.error("Failed to mark as read: ", err);
    return false;
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
      alert('Nova Mensagem: ' + notification.title + '\n' + notification.body);
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
