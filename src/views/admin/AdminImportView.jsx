import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { formatCPF, isValidCPF, stripCPF } from '../../utils/cpfUtils';
import { bulkImportMembers } from '../../services/adminService';

const AdminImportView = ({ onBackToApp }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Validate, 4: Result
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Mapeamento: chave interna -> nome da coluna no arquivo
  const [mapping, setMapping] = useState({ 
    cpf: '', 
    name: '', 
    email: '', 
    phone: '', 
    institution: '', 
    city: '', 
    state: '', 
    ticket_type: '' 
  });
  
  // Filas validadas
  const [validRows, setValidRows] = useState([]);
  const [invalidRows, setInvalidRows] = useState([]);
  
  // Status final
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  
  const fileInputRef = useRef(null);

  // 1. Processar Arquivo Base (CSV ou XLSX)
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0]; // Pega primeira aba
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }); // Retorna array de arrays
      
      if (data.length > 1) {
        // Assume que a primeira linha é de cabeçalho (headers)
        const headers = data[0];
        const rows = data.slice(1).filter(r => r.length > 0); // remove vazios
        
        // Transforma o array de arrays de volta para array de objetos puros
        const parsedData = rows.map(r => {
          let obj = {};
          headers.forEach((h, i) => {
            obj[h] = r[i];
          });
          return obj;
        });

        setColumns(headers);
        setRawData(parsedData);
        // Tenta auto-mapear se o nome for sugestivo (ex: 'CPF' -> cpf)
        autoMapColumns(headers);
        setStep(2);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  // Tenta acelerar a vida do administrador conectando colunas prováveis
  const autoMapColumns = (headers) => {
    let initialMap = { cpf: '', name: '', email: '', phone: '', institution: '', city: '', state: '', ticket_type: '' };
    headers.forEach(h => {
      const lower = h.toString().toLowerCase().trim();
      if (lower === 'cpf') initialMap.cpf = h;
      else if (lower === 'cnpj' && !initialMap.cpf) initialMap.cpf = h; // Fallback CNPJ se não houver CPF
      else if (lower.includes('nome') || lower.includes('name')) initialMap.name = h;
      else if (lower.includes('email') || lower.includes('e-mail')) initialMap.email = h;
      else if (lower.includes('telefone') || lower.includes('phone') || lower.includes('celular')) initialMap.phone = h;
      else if (lower.includes('escola') || lower.includes('instituicao')) initialMap.institution = h;
      else if (lower.includes('cidade') || lower.includes('city')) initialMap.city = h;
      else if (lower.includes('uf') || lower.includes('estado')) initialMap.state = h;
      else if (lower.includes('tipo') || lower.includes('ticket')) initialMap.ticket_type = h;
    });
    setMapping(prev => ({ ...prev, ...initialMap }));
  };

  const applyForumPreset = () => {
    // Mapeamento baseado no print do usuário: Data,Nome,Email,Telefone,Cargo,Escola,CNPJ,Cidade,UF,Qtd Alunos,Tipo
    let forumMap = { 
        cpf: columns.find(c => c.toLowerCase().trim() === 'cnpj' || c.toLowerCase().includes('cpf')),
        name: columns.find(c => c.toLowerCase().includes('nome')),
        email: columns.find(c => c.toLowerCase().includes('email')),
        phone: columns.find(c => c.toLowerCase().includes('telefone')),
        institution: columns.find(c => c.toLowerCase().includes('escola')),
        city: columns.find(c => c.toLowerCase().includes('cidade')),
        state: columns.find(c => c.toLowerCase().trim() === 'uf'),
        ticket_type: columns.find(c => c.toLowerCase().trim() === 'tipo')
    };
    setMapping(forumMap);
    alert('Layout "Fórum/Moodle" aplicado! Verifique se o identificador está mapeado como CPF/CNPJ.');
  };

  // 2. Etapa de Validação
  const handleValidation = () => {
    if (!mapping.cpf || !mapping.name) {
      alert("Por favor, mapeie ao menos CPF (ou CNPJ) e Nome.");
      return;
    }

    const valids = [];
    const invalids = [];

    rawData.forEach((row, index) => {
      const rawCpf = row[mapping.cpf];
      const rawName = row[mapping.name];
      
      const cleanId = stripCPF(rawCpf || '');
      
      // Valida Identificador (CPF real ou CNPJ/Id de Fórum)
      // Se tiver 11 caracteres tentamos validar como CPF, se tiver 14 como CNPJ, senão apenas checamos presença
      const idIsValid = cleanId.length >= 10; // Critério flexível para aceitar CNPJ e CPF

      if (cleanId && idIsValid && rawName) {
        valids.push({
          cpf: cleanId,
          name: rawName,
          email: mapping.email ? row[mapping.email] : null,
          phone: mapping.phone ? row[mapping.phone] : null,
          institution: mapping.institution ? row[mapping.institution] : null,
          city: mapping.city ? row[mapping.city] : null,
          state: mapping.state ? row[mapping.state] : null,
          ticket_type: mapping.ticket_type ? row[mapping.ticket_type] : 'Fórum/Prover',
          originalRow: index + 2
        });
      } else {
        invalids.push({
          cpf: rawCpf,
          name: rawName,
          reason: !idIsValid ? 'ID (CPF/CNPJ) Inválido ou Curto' : 'Nome Ausente',
          originalRow: index + 2
        });
      }
    });

    setValidRows(valids);
    setInvalidRows(invalids);
    setStep(3);
  };

  // 3. Importação para Supabase
  const handleImport = async () => {
    setIsImporting(true);
    // Payload que será salvo
    const payload = validRows.map(r => ({
      cpf: r.cpf,
      name: r.name,
      email: r.email,
      phone: r.phone,
      institution: r.institution,
      city: r.city,
      state: r.state,
      ticket_type: r.ticket_type
    }));

    const result = await bulkImportMembers(payload);
    
    setImportResult(result);
    setIsImporting(false);
    setStep(4);
  };

  // Funções Utilitárias de Reset e Saída
  const resetFlow = () => {
    setStep(1);
    setFile(null);
    setRawData([]);
    setMapping({ cpf: '', name: '', email: '', birth_date: '', ticket_type: '' });
    setValidRows([]);
    setInvalidRows([]);
    setImportResult(null);
  };

  // Função para baixar planilha modelo
  const downloadTemplate = () => {
    const headers = "CPF;Nome;Email;Data de Nascimento;Tipo Inscricao";
    const example = "00000000000;NOME DO CONGRESSISTA;exemplo@email.com;01/01/1990;Presencial Padrão";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "modelo_importacao_hub.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-import-view fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-dark)',
      paddingBottom: '60px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{ 
        background: 'linear-gradient(180deg, #4A101D 0%, #6B141A 100%)', 
        padding: '32px 20px',
        color: 'white',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'var(--gold)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: '900',
            fontSize: '18px'
          }}>C</div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '900', color: 'white', margin: 0 }}>Importar Congressistas</h1>
            <p style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Módulo de Importação</p>
          </div>
        </div>
        <button onClick={onBackToApp} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
          <LogOut size={20} />
        </button>
      </header>

      <main style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* === STEP 1: UPLOAD === */}
        {step === 1 && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Upload size={32} color="var(--gold)" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'white', marginBottom: '12px' }}>Importar Congressistas</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 32px' }}>
              Suba a lista de inscritos para liberar o acesso ao aplicativo. <br/>
              O CPF será o login e a senha inicial será <strong>congresso2026</strong>.
            </p>
            
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%', maxWidth: '320px' }}
                onClick={() => fileInputRef.current.click()}
              >
                <FileText size={18} />
                Selecionar Planilha do Computador
              </button>

              <button 
                onClick={downloadTemplate}
                style={{ 
                  background: 'transparent', border: 'none', color: 'var(--primary)', 
                  fontSize: '13px', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' 
                }}
              >
                Baixar Planilha Modelo (.CSV)
              </button>
            </div>
          </div>
        )}

        {/* === STEP 2: MAPEAMENTO === */}
        {step === 2 && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>
                Mapeamento de Colunas
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => autoMapColumns(columns)}
                        style={{ fontSize: '11px', fontWeight: '800', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >Autodetectar</button>
                    <button
                        onClick={applyForumPreset}
                        style={{ fontSize: '11px', fontWeight: '800', background: 'var(--gold)', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}
                    >Layout Fórum/Moodle</button>
                </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Identificamos <strong>{rawData.length} registros</strong>. O sistema precisa saber qual coluna representa o CPF/CNPJ e o Nome no seu arquivo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div style={{ margin: 0 }}>
                <label style={mapLabelStyle}>Coluna de CPF/CNPJ (Obrigatório)</label>
                <select style={mapSelectStyle} value={mapping.cpf} onChange={(e) => setMapping({...mapping, cpf: e.target.value})}>
                  <option value="">Selecione a coluna...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ margin: 0 }}>
                <label style={mapLabelStyle}>Coluna de Nome (Obrigatório)</label>
                <select style={mapSelectStyle} value={mapping.name} onChange={(e) => setMapping({...mapping, name: e.target.value})}>
                  <option value="">Selecione a coluna...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ margin: 0 }}>
                <label style={mapLabelStyle}>E-mail (Recomendado)</label>
                <select style={mapSelectStyle} value={mapping.email} onChange={(e) => setMapping({...mapping, email: e.target.value})}>
                  <option value="">Ignorar ou selecione...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={mapLabelStyle}>Telefone / Whats</label>
                  <select style={mapSelectStyle} value={mapping.phone} onChange={(e) => setMapping({...mapping, phone: e.target.value})}>
                    <option value="">Ignorar...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={mapLabelStyle}>Escola / Instituição</label>
                  <select style={mapSelectStyle} value={mapping.institution} onChange={(e) => setMapping({...mapping, institution: e.target.value})}>
                    <option value="">Ignorar...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={mapLabelStyle}>Cidade</label>
                  <select style={mapSelectStyle} value={mapping.city} onChange={(e) => setMapping({...mapping, city: e.target.value})}>
                    <option value="">Ignorar...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={mapLabelStyle}>UF</label>
                  <select style={mapSelectStyle} value={mapping.state} onChange={(e) => setMapping({...mapping, state: e.target.value})}>
                    <option value="">Ignorar...</option>
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ margin: 0 }}>
                <label style={mapLabelStyle}>Coluna Tipo Ingresso (Opcional)</label>
                <select style={mapSelectStyle} value={mapping.ticket_type} onChange={(e) => setMapping({...mapping, ticket_type: e.target.value})}>
                  <option value="">Ignorar ou selecione...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setStep(1)} 
                style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '600', color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}
                onClick={handleValidation}
              >
                Processar e Validar Dados <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* === STEP 3: PREVIEW E VALIDAÇÃO === */}
        {step === 3 && (
          <div className="fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>Resumo da Validação</h3>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ flex: 1, borderLeft: '4px solid #38A169' }}>
                <CheckCircle size={24} color="#38A169" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{validRows.length}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Registros Válidos</p>
              </div>
              <div className="card" style={{ flex: 1, borderLeft: '4px solid #E53E3E' }}>
                <AlertTriangle size={24} color="#E53E3E" style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>{invalidRows.length}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Registros Inválidos</p>
              </div>
            </div>

            {/* Listagem de erros caso haja */}
            {invalidRows.length > 0 && (
              <div className="card" style={{ marginBottom: '24px', background: 'var(--accent)', border: '1px solid rgba(229,62,62,0.2)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#E53E3E', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Linhas com erro
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {invalidRows.slice(0, 15).map((row, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize: '12px' }}>
                      <span style={{ fontWeight: '700' }}>Linha {row.originalRow}:</span> {row.cpf || 'Sem CPF'} - {row.reason}
                    </div>
                  ))}
                  {invalidRows.length > 15 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      E mais {invalidRows.length - 15} erros ocultos...
                    </p>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setStep(2)} 
                style={{ flex: 1, padding: '14px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border)', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontWeight: '600' }}
              >
                <ArrowLeft size={18} /> Voltar
              </button>
              <button 
                className="btn-primary" 
                style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                onClick={handleImport}
                disabled={validRows.length === 0 || isImporting}
              >
                {isImporting ? (
                   <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RefreshCw size={18} className="spin" /> Sincronizando BD...</span>
                ) : (
                  `Importar ${validRows.length} Inscritos`
                )}
              </button>
            </div>
          </div>
        )}

        {/* === STEP 4: RESULTADO FINAL === */}
        {step === 4 && importResult && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '40px 20px' }}>
            {importResult.success ? (
              <>
                <div style={{ width: '64px', height: '64px', background: '#F0FFF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={32} color="#38A169" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>Importação Concluída!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
                  <strong>{importResult.inserted} novos membros</strong> cadastrados.{' '}
                  {importResult.skipped > 0 && <span>{importResult.skipped} já existentes foram mantidos sem alteração.</span>}
                </p>
                <button 
                  className="btn-primary" 
                  style={{ maxWidth: '200px', margin: '0 auto' }}
                  onClick={resetFlow}
                >
                  Nova Importação
                </button>
              </>
            ) : (
              <>
                <div style={{ width: '64px', height: '64px', background: '#FFF5F5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <AlertTriangle size={32} color="#E53E3E" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--secondary)', marginBottom: '8px' }}>Falha na Sincronização</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Ocorreu um erro ao gravar no Supabase. Detalhes: {importResult.error}
                </p>
                <button 
                  style={{ padding: '14px 24px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '600' }}
                  onClick={resetFlow}
                >
                  Reiniciar Processo
                </button>
              </>
            )}
          </div>
        )}

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default AdminImportView;

const mapLabelStyle = {
  display: 'block', marginBottom: '6px',
  fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase', letterSpacing: '1px'
};
const mapSelectStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.08)',
  color: '#FFFFFF', fontSize: '14px', fontWeight: '600',
  cursor: 'pointer', outline: 'none'
};
