import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Loader2,
  Search,
  Type,
  Hash,
  FileText,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export default function TextContentCMS() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const { data } = await supabase.from('content_registry').select('*').order('section');
    if (data) setItems(data);
    setLoading(false);
  };

  const updateItem = async (id, newValue) => {
    // Tentar converter para JSON se parecer um objeto
    let finalValue = newValue;
    try {
      if (newValue.startsWith('{') || newValue.startsWith('[')) {
        finalValue = JSON.parse(newValue);
      }
    } catch(e) {}

    const { error } = await supabase
      .from('content_registry')
      .update({ value: finalValue, updated_at: new Date() })
      .eq('id', id);
    
    if (!error) {
      setItems(prev => prev.map(item => item.id === id ? { ...item, value: finalValue } : item));
    }
  };

  const filteredItems = items.filter(i => 
    i.key.toLowerCase().includes(search.toLowerCase()) || 
    i.section.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: '1000px' }}>
      <header style={{ marginBottom: '32px' }}>
        <p style={{ color: '#94A3B8', marginBottom: '20px', fontWeight: '600' }}>
          Gerencie aqui todos os textos, títulos e descrições do aplicativo. 
          Use o formato JSON para objetos complexos.
        </p>
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
          <input 
            placeholder="Buscar por chave ou seção..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '16px 16px 16px 48px', borderRadius: '16px', 
              border: '1px solid #E2E8F0', fontSize: '15px', color: '#1E293B', background: 'white'
            }}
          />
        </div>
      </header>

      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredItems.map(item => (
          <div key={item.id} style={{ 
            background: 'var(--card-bg)', padding: '24px', borderRadius: '24px', 
            border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', background: '#FDF2F2', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>
                  {item.section}
                </span>
                <code style={{ fontSize: '13px', color: '#64748B', fontWeight: 'bold' }}>{item.key}</code>
              </div>
              <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                Atualizado: {new Date(item.updated_at).toLocaleDateString()}
              </p>
            </div>

            <textarea 
              defaultValue={typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : item.value}
              onBlur={(e) => updateItem(item.id, e.target.value)}
              style={{ 
                width: '100%', minHeight: '100px', padding: '16px', borderRadius: '12px', 
                border: '1px solid var(--border-color)', fontSize: '14px', fontFamily: 'monospace',
                background: 'rgba(255,255,255,0.05)', color: '#FFFFFF', resize: 'vertical'
              }}
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#94A3B8', fontSize: '11px' }}>
              <AlertCircle size={12} />
              <span>O salvamento é automático ao sair do campo (onBlur).</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
