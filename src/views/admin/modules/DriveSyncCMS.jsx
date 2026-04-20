import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { HardDrive, Save, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

export default function DriveSyncCMS() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('drive_sync').select('*').order('category');
    if (!error) setConfigs(data);
    setLoading(false);
  };

  const handleUpdate = async (category, folderId) => {
    setSaving(true);
    const { error } = await supabase
      .from('drive_sync')
      .update({ folder_id: folderId, updated_at: new Date() })
      .eq('category', category);
    
    if (error) setStatus({ type: 'error', msg: 'Erro ao salvar' });
    else {
      setStatus({ type: 'success', msg: 'Configuração salva!' });
      fetchConfigs();
    }
    setSaving(false);
    setTimeout(() => setStatus(null), 3000);
  };

  if (loading) return <div className="admin-loading">Carregando configurações de Drive...</div>;

  return (
    <div className="card-main fade-in">
      <div className="card-header">
        <div className="header-info">
          <HardDrive size={24} color="var(--primary)" />
          <div>
            <h3>Sincronização Google Drive</h3>
            <p>Gerencie as pastas do Drive que alimentam os carrosséis do aplicativo.</p>
          </div>
        </div>
      </div>

      <div className="cms-content" style={{ marginTop: '24px' }}>
        <div style={{ background: 'rgba(212, 193, 156, 0.1)', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--gold)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle color="var(--gold)" size={20} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              <strong>Importante:</strong> As pastas do Google Drive devem estar configuradas como 
              <span style={{ color: 'var(--primary)', fontWeight: '800' }}> "Qualquer pessoa com o link pode ver" </span> 
              para que a sincronização automática funcione sem a necessidade de chaves de API.
            </p>
          </div>
        </div>

        {status && (
          <div style={{ 
            background: status.type === 'success' ? '#F0FFF4' : '#FFF5F5', 
            color: status.type === 'success' ? '#2F855A' : '#C53030',
            padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', 
            display: 'flex', alignItems: 'center', gap: '10px' 
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{status.msg}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {configs.map(conf => (
            <div key={conf.category} className="card" style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontWeight: '900', color: 'var(--primary)' }}>{conf.category}</h4>
                <a 
                  href={`https://drive.google.com/drive/folders/${conf.folder_id}`} 
                  target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}
                >
                  <ExternalLink size={12} /> Abrir no Drive
                </a>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Folder ID do Google Drive</label>
                  <input 
                    defaultValue={conf.folder_id} 
                    onBlur={(e) => {
                        const val = e.target.value.trim();
                        // Extrai ID do link se o usuário colou o URL completo
                        const match = val.match(/folders\/([a-zA-Z0-9-_]+)/);
                        const id = match ? match[1] : val;
                        if (id !== conf.folder_id) handleUpdate(conf.category, id);
                    }}
                    placeholder="Cole o ID da pasta ou o Link completo"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'white' }} 
                  />
                </div>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Última sincronização/update: {new Date(conf.updated_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
