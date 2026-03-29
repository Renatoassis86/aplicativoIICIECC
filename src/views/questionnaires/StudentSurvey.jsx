import React from 'react';
import BaseSurvey from './BaseSurvey';

const StudentSurvey = ({ onComplete }) => {
  const steps = [
    {
      title: 'BLOCO 1 — PERFIL DO RESPONDENTE',
      motivation: 'Sua jornada na FICV é a nossa melhor vitrine. Conte-nos mais!',
      questions: [
        { id: 's1_1', text: '1.1 Qual é o seu vínculo atual com a FICV?', type: 'radio', options: ['Aluno regularmente matriculado', 'Concluinte', 'Egresso recente'] },
        { id: 's1_2', text: '1.2 Em qual curso da FICV você está ou esteve matriculado? (Marque apenas um)', type: 'radio', options: ['Bacharelado em Teologia – EAD', 'Bacharelado em Teologia – Presencial', 'Bacharelado em Direito', 'Pós-graduação em Psicoteologia', 'Pós-graduação em Educação Cristã Clássica', 'Pós-graduação em Teologia Sistemática', 'Pós-graduação em Gestão Escolar', 'Pós-graduação em Teologia do Novo Testamento', 'Pós-graduação em Liderança Cristã', 'Pós-graduação em Formação Política', 'Pós-graduação em Missiologia Urbana', 'Pós-graduação em Psicopedagogia', 'Pós-graduação em História do Cristianismo'] },
        { id: 's1_3', text: '1.3 Em que etapa do curso você se encontra?', type: 'radio', options: ['Início', 'Meio', 'Final', 'Curso concluído'] }
      ]
    },
    {
      title: 'BLOCO 2 — EXPERIÊNCIA FORMATIVA NA FICV',
      motivation: 'Queremos entender o valor percebido na sua formação.',
      questions: [
        { id: 's2_1', text: '2.1 Em uma escala de 0 a 10, quão satisfeito(a) você está com sua experiência geral na FICV?', type: 'range', min: 0, max: 10 },
        { id: 's2_2', text: '2.2 Avalie seu nível de concordância com a afirmação: “A formação oferecida pela FICV apresenta profundidade acadêmica e coerência metodológica.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] },
        { id: 's2_3', text: '2.3 O quanto os conteúdos estudados dialogam com sua vida profissional, vocacional ou ministerial?', type: 'radio', options: ['Muito', 'Moderadamente', 'Pouco', 'Nada'] }
      ]
    },
    {
      title: 'BLOCO 3 — SUPORTE E ESTRUTURA ACADÊMICA',
      motivation: 'Como você avalia os bastidores da sua formação?',
      questions: [
        { id: 's3_1_org', text: '3.1 Como você avalia os seguintes aspectos da FICV? [Organização acadêmica]', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] },
        { id: 's3_1_com', text: '3.1 Como você avalia os seguintes aspectos da FICV? [Comunicação institucional]', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] },
        { id: 's3_1_corp', text: '3.1 Como você avalia os seguintes aspectos da FICV? [Corpo docente]', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] },
        { id: 's3_1_plat', text: '3.1 Como você avalia os seguintes aspectos da FICV? [Plataforma de ensino (AVA)]', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] },
        { id: 's3_1_sup', text: '3.1 Como você avalia os seguintes aspectos da FICV? [Suporte ao aluno]', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] }
      ]
    },
    {
      title: 'BLOCO 4 — INTEGRAÇÃO FÉ E FORMAÇÃO INTELECTUAL',
      motivation: 'A FICV busca unir estes dois pilares. Como você percebe isso?',
      questions: [
        { id: 's4_1', text: '4.1 Avalie a afirmação: “A FICV contribui para integrar a fé cristã com uma formação intelectual consistente.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] },
        { id: 's4_2', text: '4.2 Em uma escala de 0 a 10, o quanto você percebe que sua visão de mundo foi ampliada a partir da formação na FICV?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 5 — AVALIAÇÃO INSTITUCIONAL (NPS)',
      motivation: 'Sua recomendação é muito importante.',
      questions: [
        { id: 's5_1', text: '5.1 Em uma escala de 0 a 10, o quanto você recomendaria a FICV para um amigo ou colega interessado em formação acadêmica cristã?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 6 — CONTINUIDADE FORMATIVA NA FICV',
      motivation: 'Quais serão os seus próximos passos acadêmicos?',
      questions: [
        { id: 's6_1', text: '6.1 Você considera realizar outra formação acadêmica na FICV no futuro?', type: 'radio', options: ['Sim', 'Talvez', 'Não'] }
      ]
    },
    {
      title: 'BLOCO 7 — INTERESSE EM NOVA JORNADA (CURSOS FICV)',
      motivation: 'Conte-nos seus interesses.',
      questions: [
        { id: 's7_1', text: '7.1 Caso você venha a realizar uma nova formação na FICV, em quais cursos teria interesse? (Marque todas as opções que se aplicam)', type: 'checkbox', options: ['Bacharelado em Teologia – EAD', 'Bacharelado em Teologia – Presencial', 'Bacharelado em Direito', 'Pós-graduação em Psicoteologia', 'Pós-graduação em Educação Cristã Clássica', 'Pós-graduação em Teologia Sistemática', 'Pós-graduação em Gestão Escolar', 'Pós-graduação em Teologia do Novo Testamento', 'Pós-graduação em Liderança Cristã', 'Pós-graduação em Formação Política', 'Pós-graduação em Missiologia Urbana', 'Pós-graduação em Psicopedagogia', 'Pós-graduação em História do Cristianismo'] }
      ]
    },
    {
      title: 'DISPOSIÇÃO DE INVESTIMENTO EM PÓS-GRADUAÇÃO',
      motivation: 'Transparência nos ajuda a planejar.',
      questions: [
        { id: 's_inv', text: 'Considerando sua realidade atual, qual faixa de mensalidade você estaria disposto(a) a investir em uma pós-graduação? (Considere o valor mensal do curso)', type: 'radio', options: ['Até R$ 300 por mês', 'Entre R$ 301 e R$ 500 por mês', 'Entre R$ 501 e R$ 800 por mês', 'Entre R$ 801 e R$ 1.200 por mês', 'Acima de R$ 1.200 por mês'] }
      ]
    },
    {
      title: 'BLOCO 8 — PRIORIDADE DE CURSO',
      questions: [
        { id: 's8_1', text: '8.1 Dentre os cursos assinalados na questão anterior, qual seria sua prioridade principal para iniciar primeiro? (Marque apenas uma opção)', type: 'radio', options: ['Bacharelado em Teologia – EAD', 'Bacharelado em Teologia – Presencial', 'Bacharelado em Direito', 'Pós-graduação em Psicoteologia', 'Pós-graduação em Educação Cristã Clássica', 'Pós-graduação em Teologia Sistemática', 'Pós-graduação em Gestão Escolar', 'Pós-graduação em Teologia do Novo Testamento', 'Pós-graduação em Liderança Cristã', 'Pós-graduação em Formação Política', 'Pós-graduação em Missiologia Urbana', 'Pós-graduação em Psicopedagogia', 'Pós-graduação em História do Cristianismo'] }
      ]
    },
    {
      title: 'BLOCO 9 — MOMENTO DE DECISÃO',
      questions: [
        { id: 's9_1', text: '9.1 Em quanto tempo você considera iniciar uma nova formação acadêmica?', type: 'radio', options: ['Até 6 meses', 'Entre 6 e 12 meses', 'Entre 12 e 24 meses', 'Ainda não tenho previsão'] }
      ]
    },
    {
      title: 'BLOCO 10 — RELACIONAMENTO',
      questions: [
        { id: 's10_1', text: '10.1 Você autoriza a FICV a entrar em contato com informações sobre cursos alinhados ao seu interesse?', type: 'radio', options: ['Sim', 'Não'] }
      ]
    }
  ];

  return <BaseSurvey steps={steps} onComplete={onComplete} themeColor="#2B6CB0" />;
};

export default StudentSurvey;
