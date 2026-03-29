import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, XCircle, AlertTriangle, ScanLine } from 'lucide-react';
import { validateScannedTicket } from '../services/tickets/ticketService';

/**
 * Módulo Administrativo: Validador de Ingressos e Check-In via Câmera Nativa.
 * Apenas acessível por contas de nível 'staff' para rastreamento de acessos únicos.
 */
const ScannerStaffView = ({ onClose, staffCpf }) => {
  const [scanResult, setScanResult] = useState(null); // success, error, duplicate
  const [scanMessage, setScanMessage] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;
    
    // Inicia a câmera apenas se o Scanner deve estar rodando
    if (isScanning) {
      setTimeout(() => {
        html5QrCode = new Html5Qrcode("reader");
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        html5QrCode.start({ facingMode: "environment" }, config, async (decodedText) => {
          // Quando acha o QR:
          try {
            // Paralisa o scanner temporalmente para ler resultado na tela
            await html5QrCode.stop();
            setIsScanning(false);
            setScanMessage("Verificando credencial...");
            
            // Vai no servidor e confere regras anti-fraude (Duplo scan, fake id)
            const result = await validateScannedTicket(decodedText, staffCpf);
            
            if (result.success) {
               setScanResult('success');
               setScanMessage(result.message); // Acesso Liberado
            } else {
               if (result.message.includes('utilizado')) setScanResult('duplicate');
               else setScanResult('error');
               setScanMessage(result.message);
            }

          } catch (err) {
            console.error("Erro critico Lendo Frame: ", err);
            setScanResult('error');
            setScanMessage('Erro fatal de rede conectando com o cofre de Ingressos.');
          }
        },
        (errorMessage) => {
          // Apenas ignore falhas normais de um frame sem QR
        })
        .catch((err) => {
          console.error("Camera access falhou", err);
          setScanResult('error');
          setScanMessage("Falha ao abrir câmera. O App precisa de permissão de mídia.");
          setIsScanning(false);
        });
      }, 300); // 300ms espera a DOM assentar
    }

    return () => {
      // Limpeza pra não deixar rastro travando o OS
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
      }
    };
  }, [isScanning, staffCpf]);

  const resetScanner = () => {
    setScanResult(null);
    setScanMessage('');
    setIsScanning(true);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000', zIndex: 10000,
      display: 'flex', flexDirection: 'column',
      animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* Header Staff Overlay */}
      <header style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, padding: '24px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ScanLine size={24} color="#D4C19C" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-serif)', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Check-In Scanner
          </h2>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', padding: '4px' }}>
          <X size={32} color="white" />
        </button>
      </header>

      {/* Frame do Renderizador Visual da Câmera */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {isScanning ? (
           <>
             {/* div container nativo onde a lib joga o video feed */}
             <div id="reader" ref={scannerRef} style={{ width: '100%', maxWidth: '500px' }}></div>
             
             {/* Mira central estilo Laser */}
             <div style={{ 
               position: 'absolute', inset: 0, pointerEvents: 'none',
               display: 'flex', alignItems: 'center', justifyContent: 'center'
             }}>
               <div style={{ 
                 width: '260px', height: '260px', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '16px',
                 boxShadow: '0 0 0 4000px rgba(0,0,0,0.5)', position: 'relative'
               }}>
                 {/* Quinas Animadas */}
                 <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '30px', height: '30px', borderTop: '4px solid #D4C19C', borderLeft: '4px solid #D4C19C', borderTopLeftRadius: '16px' }} />
                 <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '30px', height: '30px', borderTop: '4px solid #D4C19C', borderRight: '4px solid #D4C19C', borderTopRightRadius: '16px' }} />
                 <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '30px', height: '30px', borderBottom: '4px solid #D4C19C', borderLeft: '4px solid #D4C19C', borderBottomLeftRadius: '16px' }} />
                 <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '30px', height: '30px', borderBottom: '4px solid #D4C19C', borderRight: '4px solid #D4C19C', borderBottomRightRadius: '16px' }} />
                 {/* Laser Line */}
                 <div style={{ width: '100%', height: '2px', background: '#D4C19C', position: 'absolute', animation: 'scanWave 2s cubic-bezier(0.53, 0, 0.43, 1) infinite' }} />
               </div>
             </div>
           </>
        ) : (
           <div style={{ padding: '40px 20px', textAlign: 'center', width: '100%' }}>
              {/* STATUS RESULTS (Massive Views) */}
              
              {scanResult === 'success' && (
                <div style={{ background: '#2F855A', padding: '40px', borderRadius: '24px', animation: 'pop 0.3s ease-out' }}>
                   <CheckCircle size={80} color="white" style={{ margin: '0 auto 16px' }} />
                   <h1 style={{ fontSize: '28px', color: 'white', fontWeight: '900', textTransform: 'uppercase' }}>Check-in Realizado</h1>
                   <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '12px' }}>{scanMessage}</p>
                </div>
              )}

              {scanResult === 'duplicate' && (
                <div style={{ background: '#DD6B20', padding: '40px', borderRadius: '24px', animation: 'shake 0.4s' }}>
                   <AlertTriangle size={80} color="white" style={{ margin: '0 auto 16px' }} />
                   <h1 style={{ fontSize: '26px', color: 'white', fontWeight: '900', textTransform: 'uppercase' }}>Ingresso Já Usado</h1>
                   <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '12px', fontWeight: '700' }}>{scanMessage}</p>
                </div>
              )}

              {scanResult === 'error' && (
                <div style={{ background: '#E53E3E', padding: '40px', borderRadius: '24px', animation: 'shake 0.4s' }}>
                   <XCircle size={80} color="white" style={{ margin: '0 auto 16px' }} />
                   <h1 style={{ fontSize: '26px', color: 'white', fontWeight: '900', textTransform: 'uppercase' }}>Acesso Negado</h1>
                   <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', marginTop: '12px' }}>{scanMessage}</p>
                </div>
              )}

              <button 
                onClick={resetScanner} 
                style={{ 
                  marginTop: '40px', width: '100%', padding: '18px', borderRadius: '50px', 
                  background: 'white', color: 'black', fontSize: '16px', fontWeight: '800', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' 
                }}
              >
                <Camera size={20} />
                Escanear Próximo
              </button>
           </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanWave { 
          0%, 100% { top: 10px; opacity: 0; } 
          10% { opacity: 1; }
          50% { top: 240px; opacity: 1; }
          90% { opacity: 1; }
        }
        @keyframes pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}} />
    </div>
  );
};

export default ScannerStaffView;
