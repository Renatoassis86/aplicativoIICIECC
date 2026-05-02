import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── DEFINIÇÃO COMPLETA DAS QUESTÕES ───────────────────────────────────────
const QUESTIONS = [
  // DIMENSÃO 0 — PERFIL
  { id: 'Q01', dim: 0, dimTitle: 'Seu Perfil', title: 'Qual é o seu perfil de participação?', type: 'single',
    options: ['Gestor ou Diretor de Escola','Mantenedor de Escola','Coordenador Pedagógico','Professor de Escola Básica','Família Educadora (Homeschooling/Afterschooling)','Aluno da FICV','Acadêmico / Pesquisador','Colaborador Cidade Viva Education','Outro'] },
  { id: 'Q02', dim: 0, dimTitle: 'Seu Perfil', title: 'Qual foi sua modalidade de participação?', type: 'single',
    options: ['Presencial — estive fisicamente no evento','Online — acompanhei ao vivo pela transmissão'] },
  { id: 'Q03', dim: 0, dimTitle: 'Seu Perfil', title: 'Era a sua primeira vez no Congresso?', type: 'single',
    options: ['Sim, foi meu primeiro Congresso','Não, já participei do I Congresso (2025)','Não, participei de outros eventos anteriores'] },
  { id: 'Q04', dim: 0, dimTitle: 'Seu Perfil', title: 'Como você ficou sabendo do Congresso?', subtitle: 'Marque até 2 opções', type: 'multiple', max: 2,
    options: ['Redes sociais (Instagram, Facebook, YouTube)','WhatsApp (grupos ou indicação direta)','E-mail marketing','Indicação de amigo ou colega','Site oficial da Cidade Viva Education','Comunicação da minha escola/igreja','Participei do I Congresso','Outro'] },

  // DIMENSÃO 1 — EXPERIÊNCIA GERAL
  { id: 'Q05-10', dim: 1, dimTitle: 'Experiência Geral', title: 'Avalie sua experiência geral no Congresso', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['O Congresso atendeu ou superou minhas expectativas gerais.','O Congresso agregou valor real à minha prática profissional.','Eu me senti bem-vindo(a) e acolhido(a) durante o evento.','A relação entre investimento e o que recebi foi positiva.','O Congresso fortaleceu minha visão sobre Educação Cristã Clássica.','A identidade e propósito do evento foram claros e bem comunicados.'] },
  { id: 'Q11', dim: 1, dimTitle: 'Experiência Geral', title: 'Qual nota global você daria ao Congresso?', subtitle: '0 = Péssimo · 10 = Excelente', type: 'nps' },
  { id: 'Q12', dim: 1, dimTitle: 'Experiência Geral', title: 'Qual foi o momento mais marcante do Congresso para você?', type: 'open', placeholder: 'Descreva aqui o momento que mais te impactou...' },

  // DIMENSÃO 2 — PALESTRAS
  { id: 'Q13-20', dim: 2, dimTitle: 'Palestras Principais', title: 'Avalie as palestras e conferências plenárias', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['Os temas foram relevantes para os desafios que enfrento.','O conteúdo foi aprofundado e fundamentado.','As palestras trouxeram perspectivas novas.','Os palestrantes demonstraram domínio e autoridade.','Houve coerência teológica e pedagógica entre os conteúdos.','A progressão das palestras ao longo dos dois dias foi lógica.','O tempo alocado por palestra foi adequado.','As palestras me motivaram a aplicar mudanças concretas.'] },
  { id: 'Q21', dim: 2, dimTitle: 'Palestras Principais', title: 'Avalie a qualidade geral das palestras:', subtitle: '0 = Péssima · 10 = Excelente', type: 'nps' },
  { id: 'Q22', dim: 2, dimTitle: 'Palestras Principais', title: 'Qual palestra você avaliaria como a mais impactante?', type: 'single',
    options: ['Abertura e conferência inaugural','Conferência teológica / cosmovisão cristã','Palestra sobre currículo clássico','Palestra sobre formação docente','Palestra sobre gestão escolar','Palestra de encerramento','Foram igualmente relevantes'] },
  { id: 'Q23', dim: 2, dimTitle: 'Palestras Principais', title: 'O que você gostaria que tivesse sido mais aprofundado nas palestras?', type: 'open', placeholder: 'Compartilhe sua sugestão...', optional: true },

  // DIMENSÃO 3 — OFICINAS
  { id: 'Q24-30', dim: 3, dimTitle: 'Oficinas e Workshops', title: 'Avalie as oficinas em que você participou', subtitle: '1 = Péssimo · 5 = Excelente', type: 'likert_group', optional: true,
    skipLabel: 'Não participei de oficinas',
    items: ['A variedade de oficinas contemplou bem meu perfil.','A qualidade do conteúdo das oficinas foi alta.','Os facilitadores estavam preparados.','As oficinas foram práticas e aplicáveis.','O tamanho dos grupos permitiu boa interação.','A duração foi adequada para o conteúdo.','A dinâmica de inscrição funcionou bem.'] },
  { id: 'Q31', dim: 3, dimTitle: 'Oficinas e Workshops', title: 'Avalie a experiência geral nas oficinas:', subtitle: '0 = Péssima · 10 = Excelente', type: 'nps', optional: true, skipLabel: 'Não participei' },
  { id: 'Q32', dim: 3, dimTitle: 'Oficinas e Workshops', title: 'Que temas ou formatos de oficina você gostaria de ver no próximo Congresso?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // DIMENSÃO 4 — ORGANIZAÇÃO
  { id: 'Q33-41', dim: 4, dimTitle: 'Organização e Logística', title: 'Avalie a organização e logística do evento', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['O processo de inscrição foi simples e fácil.','As comunicações pré-evento foram claras.','A grade de horários foi bem planejada.','Os horários foram respeitados.','As transições entre sessões foram fluídas.','A sinalização dentro do local foi eficiente.','A equipe resolveu problemas com agilidade.','O credenciamento foi rápido e organizado.','A programação disponibilizada foi clara e completa.'] },
  { id: 'Q42', dim: 4, dimTitle: 'Organização e Logística', title: 'Avalie a organização geral do evento:', subtitle: '0 = Péssima · 10 = Excelente', type: 'nps' },
  { id: 'Q43', dim: 4, dimTitle: 'Organização e Logística', title: 'Descreva algum problema de organização que você enfrentou:', type: 'open', placeholder: 'Se houver, descreva e sugira melhorias...', optional: true },

  // DIMENSÃO 5 — INFRAESTRUTURA (presencial)
  { id: 'Q44-54', dim: 5, dimTitle: 'Infraestrutura (Presencial)', title: 'Avalie a infraestrutura e o local do evento', subtitle: '1 = Muito Insatisfeito · 5 = Muito Satisfeito', type: 'likert_group', optional: true, skipLabel: 'Participei apenas online',
    items: ['A localização foi de fácil acesso.','O auditório comportou bem os participantes.','O conforto térmico foi adequado.','A acústica e som permitiram boa compreensão.','A qualidade visual (telões, projeção) foi satisfatória.','Os banheiros foram suficientes e bem mantidos.','As salas das oficinas tinham espaço adequado.','As áreas de coffee break foram bem planejadas.','A alimentação oferecida foi satisfatória.','A acessibilidade foi adequada.','A limpeza do local foi mantida.'] },
  { id: 'Q55', dim: 5, dimTitle: 'Infraestrutura (Presencial)', title: 'Avalie a infraestrutura e local:', subtitle: '0 = Péssima · 10 = Excelente', type: 'nps', optional: true, skipLabel: 'Participei apenas online' },
  { id: 'Q56', dim: 5, dimTitle: 'Infraestrutura (Presencial)', title: 'Que melhorias de infraestrutura você sugere?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // DIMENSÃO 6 — ONLINE
  { id: 'Q57-64', dim: 6, dimTitle: 'Experiência Online', title: 'Avalie a experiência de transmissão online', subtitle: '1 = Muito Insatisfeito · 5 = Muito Satisfeito', type: 'likert_group', optional: true, skipLabel: 'Participei apenas presencialmente',
    items: ['A qualidade de vídeo da transmissão foi boa.','A qualidade do áudio foi satisfatória.','A plataforma foi fácil de acessar e usar.','Houve boa estabilidade na transmissão.','A interação online (chat, Q&A) foi satisfatória.','O conteúdo foi bem enquadrado para a experiência remota.','O evento valorizou a presença do participante online.','O acesso ao replay foi fácil e funcional.'] },
  { id: 'Q65', dim: 6, dimTitle: 'Experiência Online', title: 'Avalie a experiência online geral:', subtitle: '0 = Péssima · 10 = Excelente', type: 'nps', optional: true, skipLabel: 'Participei apenas presencialmente' },
  { id: 'Q66', dim: 6, dimTitle: 'Experiência Online', title: 'O que melhoraria sua experiência como participante online?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // DIMENSÃO 7 — NETWORKING
  { id: 'Q67-73', dim: 7, dimTitle: 'Networking e Comunidade', title: 'Avalie o networking e os relacionamentos no evento', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['O Congresso me proporcionou oportunidades de conhecer novas pessoas.','Consegui conexões relevantes para minha prática profissional.','Os momentos informais favoreceram o networking.','Senti pertencimento a uma comunidade com valores compartilhados.','As interações com outros participantes enriqueceram minha experiência.','O evento criou espaço para troca entre escolas e educadores.','Senti que líderes com perfis similares ao meu estavam presentes.'] },
  { id: 'Q74', dim: 7, dimTitle: 'Networking e Comunidade', title: 'Que atividade você gostaria para facilitar o networking?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // DIMENSÃO 8 — ATENDIMENTO
  { id: 'Q75-81', dim: 8, dimTitle: 'Atendimento e Equipe', title: 'Avalie o atendimento e a equipe do evento', subtitle: '1 = Péssimo · 5 = Excelente', type: 'likert_group',
    items: ['O atendimento pré-evento foi eficiente.','A equipe de recepção foi cordial e prestativa.','A equipe resolveu problemas com rapidez.','A comunicação via redes sociais foi clara.','O suporte técnico funcionou bem.','O atendimento via WhatsApp ou e-mail foi satisfatório.','Os voluntários demonstraram preparo e atitude de serviço.'] },
  { id: 'Q82', dim: 8, dimTitle: 'Atendimento e Equipe', title: 'Avalie o atendimento geral da equipe:', subtitle: '0 = Péssimo · 10 = Excelente', type: 'nps' },
  { id: 'Q83', dim: 8, dimTitle: 'Atendimento e Equipe', title: 'Algum membro da equipe merece destaque?', type: 'open', placeholder: 'Positivo ou negativo, compartilhe...', optional: true },

  // DIMENSÃO 9 — IMPACTO
  { id: 'Q84-91', dim: 9, dimTitle: 'Impacto e Resultados', title: 'Avalie o impacto do Congresso em você', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['O Congresso ampliou minha compreensão sobre Educação Cristã Clássica.','Saí com insights concretos para aplicar na minha realidade.','O evento influenciou positivamente decisões sobre minha escola.','Fortaleceu minha convicção sobre o papel da cosmovisão cristã.','Meu nível de preparo para desafios educacionais aumentou.','Tenho intenção clara de aplicar um aprendizado nos próximos 90 dias.','O Congresso impactou minha perspectiva pessoal, além da profissional.','Considero este evento um marco relevante na minha trajetória.'] },
  { id: 'Q92', dim: 9, dimTitle: 'Impacto e Resultados', title: 'O que você pretende realizar nos próximos 6 meses?', subtitle: 'Marque todas que se aplicam', type: 'multiple',
    options: ['Implementar mudanças curriculares na minha escola','Investir em formação docente para minha equipe','Adotar ou trocar o sistema de ensino','Avançar na confessionalidade da minha escola','Introduzir ou ampliar o bilíngue','Buscar um parceiro ou sistema educacional cristão clássico','Conectar-me com outras escolas/líderes que conheci','Participar de próximos eventos da Cidade Viva Education','Não tenho ações planejadas no momento'] },
  { id: 'Q93', dim: 9, dimTitle: 'Impacto e Resultados', title: 'Qual foi o principal aprendizado ou decisão que você leva deste Congresso?', type: 'open', placeholder: 'Compartilhe livremente...', optional: true },

  // DIMENSÃO 10 — NPS
  { id: 'Q94', dim: 10, dimTitle: 'Recomendação', title: 'Qual a probabilidade de você recomendar o Congresso a um colega?', subtitle: '0 = Definitivamente NÃO recomendaria · 10 = Definitivamente recomendaria', type: 'nps' },
  { id: 'Q95', dim: 10, dimTitle: 'Recomendação', title: 'Qual a probabilidade de você participar do III Congresso em 2027?', subtitle: '0 = Definitivamente NÃO voltaria · 10 = Definitivamente voltaria', type: 'nps' },
  { id: 'Q96', dim: 10, dimTitle: 'Recomendação', title: 'Qual a probabilidade de recomendar outros produtos da Cidade Viva Education?', subtitle: '0 = Definitivamente NÃO recomendaria · 10 = Definitivamente recomendaria', type: 'nps' },
  { id: 'Q97', dim: 10, dimTitle: 'Recomendação', title: 'O que mais influenciaria sua decisão de retornar ao próximo Congresso?', subtitle: 'Marque até 3 opções', type: 'multiple', max: 3,
    options: ['Temas mais aprofundados para líderes de escola','Palestrantes internacionais de referência','Mais espaço para networking','Melhor infraestrutura e local','Melhor experiência para participantes online','Oficinas ainda mais práticas','Conteúdo mais focado em implementação','Preço mais acessível','Maior diversidade de perfis','Já tenho certeza que voltarei'] },

  // DIMENSÃO 11 — FÓRUM
  { id: 'Q98-105', dim: 11, dimTitle: 'Fórum de Líderes', title: 'Avalie o Fórum de Líderes', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group', optional: true, skipLabel: 'Não participei do Fórum',
    items: ['A programação do Fórum foi diferenciada e alinhada ao perfil de líderes.','O conteúdo trouxe dados e informações estratégicas relevantes.','A apresentação dos dados da pesquisa de mercado foi clara e útil.','O Fórum me ajudou a tomar ou preparar decisões sobre minha escola.','O formato (palestras, dados, debates) foi adequado.','A curadoria de participantes foi qualificada e alinhada.','O Fórum justificou o investimento diferenciado de inscrição.','Os insights foram aplicáveis à realidade da minha escola.'] },
  { id: 'Q106', dim: 11, dimTitle: 'Fórum de Líderes', title: 'Avalie o Fórum de Líderes como um todo:', subtitle: '0 = Péssimo · 10 = Excelente', type: 'nps', optional: true, skipLabel: 'Não participei' },
  { id: 'Q107', dim: 11, dimTitle: 'Fórum de Líderes', title: 'O que você adicionaria ou modificaria no Fórum para o próximo Congresso?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // DIMENSÃO 12 — ESPIRITUALIDADE
  { id: 'Q108-114', dim: 12, dimTitle: 'Dimensão Espiritual', title: 'Avalie a dimensão espiritual do evento', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['Os momentos de louvor e oração enriqueceram minha experiência.','A dimensão espiritual foi integrada de forma autêntica.','O Congresso fortaleceu minha vida de fé pessoal.','A fundamentação teológica foi sólida, bíblica e confessional.','Os momentos devocionais foram apropriados ao contexto.','O Congresso honrou a centralidade de Cristo na programação.','O equilíbrio entre conteúdo teológico e pedagógico foi adequado.'] },
  { id: 'Q115', dim: 12, dimTitle: 'Dimensão Espiritual', title: 'Como você avalia a integração entre fé e educação ao longo do Congresso?', type: 'open', placeholder: 'Compartilhe sua percepção...', optional: true },

  // DIMENSÃO 13 — CUSTO-BENEFÍCIO
  { id: 'Q116-120', dim: 13, dimTitle: 'Custo-Benefício', title: 'Avalie o custo-benefício do seu investimento', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['O valor da inscrição foi justo em relação ao que o evento ofereceu.','O custo total do investimento (inscrição + deslocamento) valeu a pena.','Estaria disposto(a) a investir o mesmo valor no próximo Congresso.','O custo-benefício foi superior a outros eventos educacionais.','As opções de lotes e descontos tornaram o Congresso mais acessível.'] },
  { id: 'Q121', dim: 13, dimTitle: 'Custo-Benefício', title: 'Qual faixa de investimento você considera justa para este nível de qualidade?', type: 'single',
    options: ['Até R$ 300,00','Entre R$ 301,00 e R$ 500,00','Entre R$ 501,00 e R$ 800,00','Entre R$ 801,00 e R$ 1.200,00','Acima de R$ 1.200,00','Qualquer valor, desde que o conteúdo justifique'] },

  // DIMENSÃO 14 — COMUNICAÇÃO
  { id: 'Q122-127', dim: 14, dimTitle: 'Comunicação e Marketing', title: 'Avalie a comunicação e divulgação pré-evento', subtitle: '1 = Discordo Totalmente · 5 = Concordo Totalmente', type: 'likert_group',
    items: ['A comunicação pré-evento gerou expectativas alinhadas com o que foi entregue.','As informações sobre programação e palestrantes foram claras.','O processo de inscrição foi simples e eficiente.','A comunicação via redes sociais criou entusiasmo.','Os materiais de divulgação refletiram bem a identidade do evento.','Recebi todas as informações com tempo hábil para me organizar.'] },
  { id: 'Q128', dim: 14, dimTitle: 'Comunicação e Marketing', title: 'O que poderia ter sido comunicado de forma mais clara antes do evento?', type: 'open', placeholder: 'Sua sugestão...', optional: true },

  // FINAL
  { id: 'Q129', dim: 15, dimTitle: 'Impressão Final', title: 'Qual foi o PONTO FORTE do Congresso — algo que deve ser mantido?', type: 'open', placeholder: 'Compartilhe livremente...', optional: true },
  { id: 'Q130', dim: 15, dimTitle: 'Impressão Final', title: 'Qual foi o PRINCIPAL PONTO DE MELHORIA para o próximo Congresso?', type: 'open', placeholder: 'Sua opinião é muito valiosa...', optional: true },
  { id: 'Q131', dim: 15, dimTitle: 'Impressão Final', title: 'Que temas, palestrantes ou formatos você GOSTARIA DE VER no III Congresso em 2027?', type: 'open', placeholder: 'Suas sugestões...', optional: true },
  { id: 'Q132', dim: 15, dimTitle: 'Impressão Final', title: 'Há algum comentário ou mensagem adicional para a equipe Cidade Viva Education?', type: 'open', placeholder: 'Fique à vontade para compartilhar...', optional: true },
];

const DIM_COLORS = {
  0: '#6B141A', 1: '#4A101D', 2: '#1E3A5F', 3: '#1A4731',
  4: '#3D1A6B', 5: '#6B3D1A', 6: '#1A5F5F', 7: '#5F1A6B',
  8: '#1A3D6B', 9: '#6B5F1A', 10: '#6B141A', 11: '#1A6B3D',
  12: '#3D1A6B', 13: '#1A3D1A', 14: '#6B3D3D', 15: '#2D2D2D',
};

const TOTAL = QUESTIONS.length;
const TOTAL_DIMS = 16; // dimensões 0-15

export default function SatisfactionSurveyView({ userCpf, onClose }) {
  const [current, setCurrent] = useState(-1); // -1 = tela de confirmação de perfil
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const containerRef = useRef(null);

  // Buscar perfil do congressista para pré-preencher
  useEffect(() => {
    if (!userCpf) { setLoadingProfile(false); return; }
    const load = async () => {
      try {
        const { data: member } = await supabase
          .from('members')
          .select('name, email, phone, institution, city, state, ticket_type, modality')
          .eq('cpf', userCpf)
          .single();
        if (member) {
          setProfile(member);
          // Pré-preencher modalidade automaticamente
          const prefilled = {};
          if (member.modality) {
            const mod = member.modality.toLowerCase();
            if (mod.includes('presencial')) prefilled['Q02'] = 'Presencial — estive fisicamente no evento';
            else if (mod.includes('online')) prefilled['Q02'] = 'Online — acompanhei ao vivo pela transmissão';
          }
          setAnswers(prev => ({ ...prefilled, ...prev }));
          // Mantém em -1 para mostrar tela de confirmação
        } else {
          setCurrent(0); // Sem perfil, começa direto nas perguntas
        }
      } catch {
        setCurrent(0);
      }
      setLoadingProfile(false);
    };
    load();
  }, [userCpf]);

  const q = current >= 0 ? QUESTIONS[current] : null;
  const progress = current >= 0 ? Math.round(((current + 1) / TOTAL) * 100) : 0;
  const color = q ? (DIM_COLORS[q.dim] || '#6B141A') : '#6B141A';

  const setAnswer = (val) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
  };

  const canAdvance = () => {
    if (!q || q.optional || q.skipLabel) return true;
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'likert_group') return Array.isArray(ans) && ans.length === q.items.length;
    return true;
  };

  const advance = () => {
    if (current < TOTAL - 1) {
      setCurrent(c => c + 1);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleAutoAdvance = (val) => {
    setAnswers(prev => {
      const next = { ...prev, [q.id]: val };
      setTimeout(() => {
        setCurrent(c => c + 1);
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 350);
      return next;
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const modalityAns = answers['Q02'] || '';
      const modality = modalityAns.toLowerCase().includes('presencial') ? 'presencial' : 'online';
      const profileAns = answers['Q01'] || '';
      const isFirst = (answers['Q03'] || '').toLowerCase().includes('primeiro');

      await supabase.from('satisfaction_responses').insert({
        respondent_cpf: userCpf || null,
        answers,
        modality,
        profile_type: profileAns,
        is_first_congress: isFirst,
        completed: true
      });
    } catch (e) {
      console.error('[Survey] Erro ao salvar:', e);
    }
    setSubmitting(false);
    setDone(true);
  };

  if (done) return <DoneScreen onClose={onClose} />;

  // Tela de confirmação de perfil (exibida antes da primeira pergunta)
  if (loadingProfile) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0A0F1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Carregando...</p>
    </div>
  );

  if (profile && current === -1) return (
    <ProfileConfirmScreen profile={profile} onClose={onClose} onConfirm={() => setCurrent(0)} />
  );

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0A0F1A', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: color, padding: '16px 20px 10px', flexShrink: 0, transition: 'background 0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          {current > 0 ? (
            <button onClick={() => { setCurrent(c => c - 1); containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <ArrowLeft size={18} color="white" />
            </button>
          ) : (
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={18} color="white" />
            </button>
          )}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>{q.dimTitle}</p>
          </div>
          <div style={{ width: 36 }} />
        </div>
        {/* Barra de progresso visual */}
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#D4C19C', borderRadius: '3px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Content */}
      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 120px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', marginBottom: '8px', lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>{q.title}</h2>
        {q.subtitle && <p style={{ fontSize: '13px', color: '#D4C19C', marginBottom: '24px', fontWeight: '600' }}>{q.subtitle}</p>}
        {!q.subtitle && <div style={{ marginBottom: '24px' }} />}

        {q.type === 'single' && <SingleChoice q={q} answers={answers} onSelect={handleAutoAdvance} color={color} />}
        {q.type === 'multiple' && <MultipleChoice q={q} answers={answers} onSelect={setAnswer} color={color} />}
        {q.type === 'likert_group' && <LikertGroup q={q} answers={answers} onSelect={setAnswer} color={color} />}
        {q.type === 'nps' && <NPS q={q} answers={answers} onSelect={handleAutoAdvance} color={color} />}
        {q.type === 'open' && <OpenText q={q} answers={answers} onSelect={setAnswer} />}

        {/* Voltar para single/nps (auto-advance, sem footer) */}
        {(q.type === 'single' || q.type === 'nps') && current > 0 && (
          <button onClick={() => { setCurrent(c => c - 1); containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
            style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: '13px', cursor: 'pointer', padding: '8px 0' }}>
            <ArrowLeft size={14} /> Voltar à pergunta anterior
          </button>
        )}
      </div>

      {/* Footer */}
      {q.type !== 'single' && q.type !== 'nps' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to top, #0A0F1A 80%, transparent)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          {q.skipLabel && (
            <button onClick={() => { setAnswer('__skipped__'); advance(); }}
              style={{ width: '100%', marginBottom: '10px', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
              {q.skipLabel}
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            {current > 0 && (
              <button onClick={() => { setCurrent(c => c - 1); containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '18px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowLeft size={18} />
              </button>
            )}
            <button onClick={advance} disabled={!canAdvance() && !q.optional}
              style={{ flex: 1, padding: '18px', borderRadius: '16px', background: canAdvance() || q.optional ? color : 'rgba(255,255,255,0.1)', border: 'none', color: canAdvance() || q.optional ? '#D4C19C' : 'rgba(255,255,255,0.3)', fontSize: '16px', fontWeight: '900', cursor: canAdvance() || q.optional ? 'pointer' : 'not-allowed', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {current === TOTAL - 1 ? (submitting ? 'Enviando...' : 'Enviar Pesquisa') : 'Continuar'}
              {current < TOTAL - 1 && <ArrowRight size={18} />}
              {current === TOTAL - 1 && !submitting && <Check size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── COMPONENTES DE QUESTÃO ──────────────────────────────────────────────────

function SingleChoice({ q, answers, onSelect, color }) {
  const val = answers[q.id];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {q.options.map(opt => (
        <button key={opt} onClick={() => onSelect(opt)}
          style={{ padding: '16px 20px', borderRadius: '16px', border: `2px solid ${val === opt ? color : 'rgba(255,255,255,0.12)'}`, background: val === opt ? `${color}33` : 'rgba(255,255,255,0.04)', color: 'white', fontSize: '15px', fontWeight: val === opt ? '700' : '500', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {opt}
          {val === opt && <Check size={16} color="#D4C19C" />}
        </button>
      ))}
    </div>
  );
}

function MultipleChoice({ q, answers, onSelect, color }) {
  const val = answers[q.id] || [];
  const toggle = (opt) => {
    const next = val.includes(opt) ? val.filter(v => v !== opt) : (q.max && val.length >= q.max ? val : [...val, opt]);
    onSelect(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {q.max && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Selecionados: {val.length}/{q.max}</p>}
      {q.options.map(opt => {
        const sel = val.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)}
            style={{ padding: '16px 20px', borderRadius: '16px', border: `2px solid ${sel ? color : 'rgba(255,255,255,0.12)'}`, background: sel ? `${color}33` : 'rgba(255,255,255,0.04)', color: 'white', fontSize: '15px', fontWeight: sel ? '700' : '500', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {opt}
            {sel && <Check size={16} color="#D4C19C" />}
          </button>
        );
      })}
    </div>
  );
}

function LikertGroup({ q, answers, onSelect, color }) {
  const val = answers[q.id] || [];
  const setItem = (idx, score) => {
    const next = [...val];
    next[idx] = score;
    onSelect(next);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '4px', paddingLeft: '0' }}>
        {[1,2,3,4,5].map(n => <div key={n} style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>{n}</div>)}
      </div>
      {q.items.map((item, idx) => (
        <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '16px', padding: '14px 16px', border: val[idx] ? `1px solid ${color}66` : '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginBottom: '12px', lineHeight: 1.4 }}>{item}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '6px' }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setItem(idx, n)}
                style={{ padding: '10px 0', borderRadius: '10px', border: 'none', background: val[idx] === n ? color : 'rgba(255,255,255,0.08)', color: val[idx] === n ? '#D4C19C' : 'rgba(255,255,255,0.5)', fontWeight: '900', fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s' }}>
                {n}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function NPS({ q, answers, onSelect, color }) {
  const val = answers[q.id];
  const getColor = (n) => {
    if (n <= 6) return '#E53E3E';
    if (n <= 8) return '#ECC94B';
    return '#38A169';
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11,1fr)', gap: '6px', marginBottom: '16px' }}>
        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => onSelect(n)}
            style={{ padding: '14px 0', borderRadius: '12px', border: `2px solid ${val === n ? getColor(n) : 'rgba(255,255,255,0.12)'}`, background: val === n ? getColor(n) : 'rgba(255,255,255,0.04)', color: 'white', fontWeight: '900', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
            {n}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: '#E53E3E', fontWeight: '700' }}>Detratores (0-6)</span>
        <span style={{ fontSize: '11px', color: '#ECC94B', fontWeight: '700' }}>Neutros (7-8)</span>
        <span style={{ fontSize: '11px', color: '#38A169', fontWeight: '700' }}>Promotores (9-10)</span>
      </div>
    </div>
  );
}

function OpenText({ q, answers, onSelect }) {
  return (
    <textarea
      value={answers[q.id] || ''}
      onChange={e => onSelect(e.target.value)}
      placeholder={q.placeholder}
      rows={5}
      style={{ width: '100%', padding: '18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '15px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
    />
  );
}

function ProfileConfirmScreen({ profile, onClose, onConfirm }) {
  const fields = [
    { label: 'Nome', value: profile.name },
    { label: 'E-mail', value: profile.email },
    { label: 'Telefone', value: profile.phone },
    { label: 'Instituição', value: profile.institution },
    { label: 'Cidade / Estado', value: [profile.city, profile.state].filter(Boolean).join(' / ') },
    { label: 'Modalidade', value: profile.modality },
  ].filter(f => f.value);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: '#0A0F1A', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #4A101D, #6B141A)', padding: '20px 20px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="white" />
          </button>
          <img src="/logo.png" alt="CIECC" style={{ height: '28px', filter: 'brightness(0) invert(1)', opacity: 0.7 }} />
          <div style={{ width: 36 }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'white', margin: 0, fontFamily: 'Georgia, serif' }}>Pesquisa de Satisfação</h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: '6px 0 0' }}>II Congresso Internacional de Educação Cristã Clássica</p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 120px' }}>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: '24px' }}>
          Olá, <strong style={{ color: '#D4C19C' }}>{(profile.name || '').split(' ')[0]}</strong>! Identificamos seu cadastro. Confirme seus dados antes de iniciar:
        </p>

        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(212,193,156,0.2)', overflow: 'hidden', marginBottom: '24px' }}>
          {fields.map((f, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: i < fields.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', display: 'flex', gap: '12px', alignItems: 'baseline' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#D4C19C', textTransform: 'uppercase', letterSpacing: '1px', minWidth: '90px', flexShrink: 0 }}>{f.label}</span>
              <span style={{ fontSize: '15px', color: 'white', fontWeight: '500' }}>{f.value}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.5 }}>
          Leva aproximadamente 10 minutos. Suas respostas são anônimas e usadas apenas para melhorar o próximo Congresso.
        </p>
      </div>

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: 'linear-gradient(to top, #0A0F1A 80%, transparent)', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <button onClick={onConfirm}
          style={{ width: '100%', padding: '18px', borderRadius: '16px', background: '#6B141A', border: 'none', color: '#D4C19C', fontSize: '16px', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          Confirmar e Iniciar Pesquisa
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function DoneScreen({ onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'linear-gradient(135deg, #4A101D, #1E3A5F)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212,193,156,0.15)', border: '2px solid #D4C19C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
        <Check size={36} color="#D4C19C" />
      </div>
      <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>Obrigado!</h2>
      <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '8px' }}>
        Sua resposta foi registrada com sucesso.
      </p>
      <p style={{ fontSize: '14px', color: '#D4C19C', lineHeight: 1.6, marginBottom: '40px' }}>
        Sua opinião é o que nos move a crescer. Cada resposta contribui para que o próximo Congresso seja ainda mais transformador.
      </p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px', fontStyle: 'italic' }}>
        Cidade Viva Education — Educando para a Glória de Deus
      </p>
      <button onClick={onClose}
        style={{ padding: '16px 40px', borderRadius: '16px', background: '#D4C19C', border: 'none', color: '#1A0A0D', fontSize: '15px', fontWeight: '900', cursor: 'pointer' }}>
        Voltar ao Hub
      </button>
    </div>
  );
}
