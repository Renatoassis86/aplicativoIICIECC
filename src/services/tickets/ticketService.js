import { supabase } from '../../lib/supabase';

/**
 * SERVIÇO DE INGRESSOS E CHECK-IN CIECC
 * Lida com emissões, bloqueios e o motor de leitura do Scanner Staff.
 */

// ==============================
// 1. CARREGAR TICKET DO USUÁRIO
// ==============================
export const fetchUserTicket = async (cpf) => {
  try {
    if (!cpf) return { status: 'not_generated', message: 'Inscrição não encontrada.' };

    const { data: ticket, error } = await supabase
      .from('system_tickets')
      .select('*')
      .eq('member_cpf', cpf)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
         // Ticket não achado = cria pra simular importação tardia/auto-emissão (mock flexível)
         return generateTicketForNewUser(cpf);
      }
      throw error;
    }

    return {
      ticket_id: ticket.id,
      cpf: ticket.member_cpf,
      ticket_type: ticket.ticket_type,
      status: ticket.status,
      created_at: ticket.created_at
    };

  } catch (error) {
    console.error("Erro ao buscar ticket no banco:", error);
    return { status: 'error', message: 'Erro na conexão com o servidor.' };
  }
};

const generateTicketForNewUser = async (cpf) => {
  const { data, error } = await supabase.from('system_tickets').insert({
    member_cpf: cpf,
    ticket_type: 'Geral', // Default caso não lido ainda do Admin
    status: 'active'
  }).select().single();

  if (error) {
    console.warn("Auto-emission failed");
    // Fallback Mock Seguro se não rodou o script SQL ainda 
    return {
      ticket_id: `mock-uuid-${Date.now()}`,
      cpf: cpf,
      ticket_type: 'Presencial Padrão',
      status: 'active',
      created_at: new Date().toISOString()
    };
  }

  return {
    ticket_id: data.id,
    cpf: data.member_cpf,
    ticket_type: data.ticket_type,
    status: data.status,
    created_at: data.created_at
  };
};

// ==================================
// 2. SCANNER STAFF (MOTOR DE CHECK-IN)
// ==================================
export const validateScannedTicket = async (qrPayload, staffUserId) => {
  try {
    // 2.1 Pega usando CPF (visto que o gerador de QR atual joga o CPF, ou ID)
    // Nosso QR de mock tá jogando string mista, mas idealmente usa o CPF
    // Ex: "ciecc:ticket:12345678909"
    const parsedCpf = qrPayload.split(':').pop();

    const { data: ticket, error: ticketErr } = await supabase
      .from('system_tickets')
      .select('*')
      .eq('member_cpf', parsedCpf)
      .single();

    if (ticketErr || !ticket) {
      await logScan(null, staffUserId, false, 'Ingresso Inexistente / QR Falso');
      return { success: false, message: 'Ingresso Inválido ou Adulterado.' };
    }

    // 2.2 Avalia a política de Status
    if (ticket.status === 'blocked') {
      await logScan(ticket.id, staffUserId, false, 'Tentativa em Ingresso Bloqueado');
      return { success: false, message: 'Ingresso encontra-se Bloqueado pela Organização.', ticket };
    }

    if (ticket.status === 'scanned') {
      await logScan(ticket.id, staffUserId, false, 'Tentativa de Reentrada / Duplo Scan');
      return { success: false, message: 'Este ingresso já foi utilizado no Check-in!', ticket };
    }

    if (ticket.status === 'active') {
      // 2.3 Faz Checkin OFICIAL via Transaction / Update Lock
      const { error: updateErr } = await supabase
        .from('system_tickets')
        .update({ status: 'scanned' })
        .eq('id', ticket.id);

      if (updateErr) throw updateErr;

      // Log Triunfante
      await logScan(ticket.id, staffUserId, true, 'Check-in Sucesso');
      
      return { success: true, message: 'Acesso Liberado com Sucesso!', ticket };
    }

    return { success: false, message: 'Erro desconhecido de status.' };
  } catch (err) {
     console.error("Erro interno no Motor de Scanner:", err);
     return { success: false, message: 'Falha Técnica Remota. Tente de novo.' };
  }
};

const logScan = async (ticketId, scannerId, success, message) => {
  await supabase.from('system_ticket_scans').insert({
    ticket_id: ticketId,
    scanner_user_id: scannerId,
    success: success,
    scan_message: message
  });
};
// ===================================
// 3. ADMIN: GESTÃO CENTRAL DE TICKETS
// ===================================

/**
 * Busca todos os tickets com dados do membro associado
 */
export const fetchAllTickets = async () => {
  try {
    const { data, error } = await supabase
      .from('system_tickets')
      .select(`
        *,
        member:members(name, email, phone)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao buscar base de tickets:", error);
    return [];
  }
};

/**
 * Altera status do ingresso (Manual Override)
 */
export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const { error } = await supabase
      .from('system_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar ticket:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Busca estatísticas rápidas para o painel
 */
export const fetchTicketStats = async () => {
    try {
        const { data: total } = await supabase.from('system_tickets').select('id', { count: 'exact', head: true });
        const { data: scanned } = await supabase.from('system_tickets').select('id', { count: 'exact', head: true }).eq('status', 'scanned');
        const { data: blocked } = await supabase.from('system_tickets').select('id', { count: 'exact', head: true }).eq('status', 'blocked');

        return {
            total: total?.length || 0, // Fallback if count head doesn't work as expected with length
            scanned: scanned?.length || 0,
            blocked: blocked?.length || 0
        };
    } catch (e) {
        return { total: 0, scanned: 0, blocked: 0 };
    }
};
