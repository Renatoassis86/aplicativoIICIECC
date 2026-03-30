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

export const fetchInbox = async (userId) => {
  try {
    // 1. Busca todas mensagens enviadas pela organização
    const { data: notifications, error } = await supabase
      .from('system_notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!notifications) return { unreadCount: 0, items: [] };

    // 2. Busca o que o usuário já leu
    const { data: reads, error: readsErr } = await supabase
      .from('system_notifications_reads')
      .select('notification_id')
      .eq('user_id', userId);

    if (readsErr) throw readsErr;

    const readIds = new Set(reads.map(r => r.notification_id));

    // 3. Mescla estado
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
  // Apenas roda via Hardware Real (Mobile). Na WEB, o Firebase Web Push seria usado, mas o requisito foca no iOS/Android.
  if (!Capacitor.isNativePlatform()) {
    console.log("Push Notifications só ativarão dentro dos apps iOS e Android empacotados pelo Capacitor.");
    return;
  }

  try {
    // Solicita a permissão pro Usuário ("Deseja receber notificações?")
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Registra o token único do chip (FCM Tokem / APNS Device Token)
      await PushNotifications.register();
    }

    // Ouvinte caso o Token seja gerado
    PushNotifications.addListener('registration', async (token) => {
      console.log('FCM/APNS Token Registration: ', token.value);
      // Aqui você salvaria o token na tabela 'profiles' para o servidor da Organização saber para quem enviar os tiros SMS 
      // await supabase.from('profiles').update({ push_token: token.value }).eq('member_cpf', userId);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Ouvinte quando a Notificação cai e o cara está COM O APP EM TELA CHEIA (Foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received na cara do gol: ', notification);
      alert('Nova Mensagem: ' + notification.title + '\n' + notification.body);
    });

    // Ouvinte quando ele estava fora do App e clica na faixa que desceu (Background -> Action)
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action performed - Abriu via Notificação: ', action);
      // Faria navegação forçada para as abas
    });

  } catch (err) {
    console.error("Native push error: ", err);
  }
};

/**
 * ESCUTA REALTIME PARA NOVOS ALERTAS GLOBAIS
 * - Faz a "mágica" de aparecer o badge ou o alerta sem refresh.
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
