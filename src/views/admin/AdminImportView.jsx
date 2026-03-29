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
  const [mapping, setMapping] = useState({ cpf: '', name: '', ticket_type: '' });
  
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
    let initialMap = { cpf: '', name: '', ticket_type: '' };
    headers.forEach(h => {
      const lower = h.toString().toLowerCase();
      if (lower.includes('cpf')) initialMap.cpf = h;
      else if (lower.includes('nome') || lower.includes('name')) initialMap.name = h;
      else if (lower.includes('tipo') || lower.includes('ticket')) initialMap.ticket_type = h;
    });
    setMapping(initialMap);
  };

  // 2. Etapa de Validação
  const handleValidation = () => {
    if (!mapping.cpf || !mapping.name) {
      alert("Por favor, mapeie ao menos CPF e Nome.");
      return;
    }

    const valids = [];
    const invalids = [];

    rawData.forEach((row, index) => {
      const rawCpf = row[mapping.cpf];
      const rawName = row[mapping.name];
      
      const cleanCpf = stripCPF(rawCpf || '');
      
      // Valida CPF real
      if (cleanCpf && isValidCPF(cleanCpf) && rawName) {
        valids.push({
          cpf: cleanCpf,
          name: rawName,
          ticket_type: mapping.ticket_type ? row[mapping.ticket_type] : 'Presencial Padrão',
          originalRow: index + 2
        });
      } else {
        invalids.push({
          cpf: rawCpf,
          name: rawName,
          reason: !isValidCPF(cleanCpf) ? 'CPF Inválido ou Ausente' : 'Nome Ausente',
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
    setValidRows([]);
    setInvalidRows([]);
    setImportResult(null);
  };

  return (
    <div className="admin-container fade-in" style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      paddingBottom: '60px'
    }}>
      {/* Header Premium Borgonha */}
      <header style={{ 
        background: 'var(--primary)', 
        padding: '24px 20px',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/logo.png" alt="CIECC" style={{ height: '40px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', m: 0 }}>Portal Admin</h1>
            <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600' }}>Importação Massiva ('members')</p>
          </div>
        </div>
        <button onClick={onBackToApp} style={{ color: 'white' }}>
          <LogOut size={24} />
        </button>
      </header>

      <main style={{ padding: '24px 20px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* === STEP 1: UPLOAD === */}
        {step === 1 && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(107, 20, 26, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Upload size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--secondary)' }}>Importar Planilha</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px', marginBottom: '32px' }}>
              Faça upload do seu arquivo .CSV ou .XLSX contendo os CPFs e Nomes dos congressistas.
            </p>
            
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button 
              className="btn-primary" 
              style={{ maxWidth: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: '0 auto' }}
              onClick={() => fileInputRef.current.click()}
            >
              <FileText size={18} />
              Selecionar Arquivo
            </button>
          </div>
        )}

        {/* === STEP 2: MAPEAMENTO === */}
        {step === 2 && (
          <div className="card fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              Mapeamento de Colunas
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Identificamos <strong>{rawData.length} registros</strong>. O sistema precisa saber qual coluna representa o CPF e o Nome no seu arquivo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Coluna de CPF (Obrigatório)</label>
                <select 
                  className="input-field" 
                  value={mapping.cpf} 
                  onChange={(e) => setMapping({...mapping, cpf: e.target.value})}
                >
                  <option value="">Selecione a coluna...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Coluna de Nome (Obrigatório)</label>
                <select 
                  className="input-field" 
                  value={mapping.name} 
                  onChange={(e) => setMapping({...mapping, name: e.target.value})}
                >
                  <option value="">Selecione a coluna...</option>
                  {columns.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Coluna Tipo Ingresso (Opcional)</label>
                <select 
                  className="input-field" 
                  value={mapping.ticket_type} 
                  onChange={(e) => setMapping({...mapping, ticket_type: e.target.value})}
                >
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
                  Foram cadastrados/atualizados <strong>{importResult.count} membros</strong> com sucesso no Supabase.
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
