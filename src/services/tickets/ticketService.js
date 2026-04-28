import { supabase } from '../../lib/supabase';

// ── 1. TICKET DO USUÁRIO (APP) ──────────────────────────────────────────────
export const fetchUserTicket = async (cpf) => {
  try {
    if (!cpf) return { status: 'not_generated', message: 'Inscrição não encontrada.' };

    const { data: ticket, error } = await supabase
      .from('system_tickets')
      .select('*')
      .eq('member_cpf', cpf)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return generateTicketForNewUser(cpf);
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
    console.error('Erro ao buscar ticket:', error);
    return { status: 'error', message: 'Erro na conexão.' };
  }
};

const generateTicketForNewUser = async (cpf) => {
  const { data, error } = await supabase
    .from('system_tickets')
    .insert({ member_cpf: cpf, ticket_type: 'Geral', status: 'active' })
    .select()
    .single();

  if (error) {
    return { ticket_id: `mock-${Date.now()}`, cpf, ticket_type: 'Presencial', status: 'active', created_at: new Date().toISOString() };
  }
  return { ticket_id: data.id, cpf: data.member_cpf, ticket_type: data.ticket_type, status: data.status, created_at: data.created_at };
};

// ── 2. SCANNER / CHECK-IN (STAFF) ───────────────────────────────────────────
export const validateScannedTicket = async (qrPayload, staffUserId) => {
  try {
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

    if (ticket.status === 'blocked') {
      await logScan(ticket.id, staffUserId, false, 'Tentativa em Ingresso Bloqueado');
      return { success: false, message: 'Ingresso bloqueado pela Organização.', ticket };
    }

    if (ticket.status === 'scanned') {
      await logScan(ticket.id, staffUserId, false, 'Tentativa de Reentrada / Duplo Scan');
      return { success: false, message: 'Este ingresso já foi utilizado no Check-in!', ticket };
    }

    const { error: updateErr } = await supabase
      .from('system_tickets')
      .update({ status: 'scanned' })
      .eq('id', ticket.id);

    if (updateErr) throw updateErr;

    await logScan(ticket.id, staffUserId, true, 'Check-in Sucesso');
    return { success: true, message: 'Acesso Liberado com Sucesso!', ticket };
  } catch (err) {
    console.error('Erro no Scanner:', err);
    return { success: false, message: 'Falha Técnica. Tente de novo.' };
  }
};

const logScan = async (ticketId, scannerId, success, message) => {
  await supabase.from('system_ticket_scans').insert({
    ticket_id: ticketId, scanner_user_id: scannerId, success, scan_message: message
  });
};

// ── 3. ADMIN: LISTAGEM ──────────────────────────────────────────────────────
export const fetchAllTickets = async () => {
  try {
    const { data: tickets, error } = await supabase
      .from('system_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!tickets || tickets.length === 0) return [];

    // Busca members separadamente (sem FK)
    const cpfs = [...new Set(tickets.map(t => t.member_cpf).filter(Boolean))];
    const { data: members } = cpfs.length > 0
      ? await supabase.from('members').select('cpf, name, email, ticket_type').in('cpf', cpfs)
      : { data: [] };

    const membersMap = (members || []).reduce((acc, m) => { acc[m.cpf] = m; return acc; }, {});

    return tickets.map(t => ({
      ...t,
      member: membersMap[t.member_cpf] || null
    }));
  } catch (error) {
    console.error('Erro ao buscar tickets:', error);
    return [];
  }
};

// ── 4. ADMIN: ESTATÍSTICAS ──────────────────────────────────────────────────
export const fetchTicketStats = async () => {
  try {
    const [resTotal, resScanned, resBlocked] = await Promise.all([
      supabase.from('system_tickets').select('*', { count: 'exact', head: true }),
      supabase.from('system_tickets').select('*', { count: 'exact', head: true }).eq('status', 'scanned'),
      supabase.from('system_tickets').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
    ]);
    return {
      total:   resTotal.count   ?? 0,
      scanned: resScanned.count ?? 0,
      blocked: resBlocked.count ?? 0,
    };
  } catch {
    return { total: 0, scanned: 0, blocked: 0 };
  }
};

// ── 5. ADMIN: ALTERAR STATUS ─────────────────────────────────────────────────
export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const { error } = await supabase
      .from('system_tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ── 6. ADMIN: CRIAR INGRESSO MANUAL ─────────────────────────────────────────
export const createTicket = async (memberCpf, ticketType = 'Geral') => {
  try {
    // Verifica se já existe
    const { data: existing } = await supabase
      .from('system_tickets')
      .select('id')
      .eq('member_cpf', memberCpf)
      .single();

    if (existing) return { success: false, message: 'Já existe um ingresso para este CPF.' };

    const { error } = await supabase
      .from('system_tickets')
      .insert({ member_cpf: memberCpf, ticket_type: ticketType, status: 'active' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ── 7. ADMIN: EXCLUIR INGRESSO ───────────────────────────────────────────────
export const deleteTicket = async (ticketId) => {
  try {
    const { error } = await supabase
      .from('system_tickets')
      .delete()
      .eq('id', ticketId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ── 8. ADMIN: GERAR EM MASSA para todos os members sem ticket ────────────────
export const generateMissingTickets = async () => {
  try {
    const { data: members } = await supabase.from('members').select('cpf, ticket_type');
    const { data: existing } = await supabase.from('system_tickets').select('member_cpf');

    const existingCpfs = new Set((existing || []).map(t => t.member_cpf));
    const missing = (members || []).filter(m => !existingCpfs.has(m.cpf));

    if (missing.length === 0) return { success: true, created: 0 };

    const toInsert = missing.map(m => ({
      member_cpf: m.cpf,
      ticket_type: m.ticket_type || 'Geral',
      status: 'active'
    }));

    const { error } = await supabase.from('system_tickets').insert(toInsert);
    if (error) throw error;
    return { success: true, created: missing.length };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
