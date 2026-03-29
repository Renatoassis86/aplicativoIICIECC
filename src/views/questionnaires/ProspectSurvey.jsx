import React from 'react';
import BaseSurvey from './BaseSurvey';

const ProspectSurvey = ({ onComplete, userType }) => {
  const steps = [
    {
      title: 'BLOCO 1 — IDENTIFICAÇÃO DO PERFIL',
      motivation: 'Conte-nos um pouco sobre você.',
      questions: [
        // Omitir p1_1 se já foi selecionado anteriormente
        ...(userType && userType.category === 'general' ? [] : [
          { id: 'p1_1', text: '1.1 Qual das opções abaixo melhor descreve você?', type: 'radio', options: ['Pai/Mãe de escola parceira Cidade Viva Education', 'Professor de Escola de Ensino Básico', 'Acadêmico ou professor de outra Instituição de Ensino Superior', 'Colaborador do Sistema Cidade Viva', 'Servo da Rede Kids / Membro da Igreja Cidade Viva', 'Líder de ministério ou igreja (outras igrejas)'] }
        ]),
        { id: 'p1_2', text: '1.2 Você já conhecia a FICV antes deste contato?', type: 'radio', options: ['Sim, já conhecia bem', 'Já tinha ouvido falar', 'Conheci agora'] }
      ]
    },
    {
      title: 'BLOCO 2 — PERFIL EDUCACIONAL E PROFISSIONAL',
      motivation: 'Queremos entender sua trajetória.',
      questions: [
        { id: 'p2_1', text: '2.1 Qual é o seu nível de escolaridade atual?', type: 'radio', options: ['Ensino médio completo', 'Graduação em andamento', 'Graduação concluída', 'Pós-graduação em andamento', 'Pós-graduação concluída'] },
        { id: 'p2_2', text: '2.2 Sua atuação principal hoje está mais ligada a qual área?', type: 'radio', options: ['Educação', 'Teologia / ministério', 'Gestão / liderança', 'Área jurídica', 'Pesquisa / academia', 'Outra área'] }
      ]
    },
    {
      title: 'BLOCO 3 — INTERESSE FORMATIVO',
      questions: [
        { id: 'p3_1', text: '3.1 Avalie seu nível de concordância com a afirmação: “Tenho interesse em uma formação acadêmica que una rigor intelectual, visão cristã e impacto prático.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] },
        { id: 'p3_2', text: '3.2 Em uma escala de 0 a 10, quão importante é para você investir em uma formação acadêmica cristã nos próximos anos?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 4 — ÁREAS DE INTERESSE',
      questions: [
        { id: 'p4_1', text: '4.1 Em quais áreas você teria interesse em se aprofundar por meio de uma graduação ou pós-graduação?', type: 'checkbox', options: ['Teologia', 'Educação', 'Filosofia', 'Direito', 'Psicopedagogia', 'Liderança', 'Política e sociedade', 'História'] }
      ]
    },
    {
      title: 'BLOCO 5 — BARREIRAS PARA INICIAR UMA FORMAÇÃO',
      questions: [
        { id: 'p5_1', text: '5.1 Quais fatores hoje mais dificultam o início de uma formação acadêmica? (Marque até 3 opções)', type: 'checkbox', options: ['Falta de tempo', 'Questões financeiras', 'Exigência acadêmica', 'Dúvidas sobre aplicação prática', 'Falta de clareza sobre cursos e formatos', 'Dificuldade de conciliar com trabalho ou família'] }
      ]
    },
    {
      title: 'BLOCO 6 — INTERESSE EM CURSOS DA FICV',
      questions: [
        { id: 'p6_1', text: '6.1 Em quais cursos da FICV você teria interesse em cursar ou conhecer melhor? (Marque todas as opções que se aplicam)', type: 'checkbox', options: ['Bacharelado em Teologia – EAD', 'Bacharelado em Teologia – Presencial', 'Bacharelado em Direito', 'Pós-graduação em Psicoteologia', 'Pós-graduação em Educação Cristã Clássica', 'Pós-graduação em Teologia Sistemática', 'Pós-graduação em Gestão Escolar', 'Pós-graduação em Teologia do Novo Testamento', 'Pós-graduação em Liderança Cristã', 'Pós-graduação em Formação Política', 'Pós-graduação em Missiologia Urbana', 'Pós-graduação em Psicopedagogia', 'Pós-graduação em História do Cristianismo'] }
      ]
    },
    {
      title: 'BLOCO 7 — PRIORIDADE FORMATIVA',
      questions: [
        { id: 'p7_1', text: '7.1 Qual curso da FICV seria sua principal prioridade de formação no momento? (Marque apenas uma opção)', type: 'radio', options: ['Bacharelado em Teologia – EAD', 'Bacharelado em Teologia – Presencial', 'Bacharelado em Direito', 'Pós-graduação em Psicoteologia', 'Pós-graduação em Educação Cristã Clássica', 'Pós-graduação em Teologia Sistemática', 'Pós-graduação em Gestão Escolar', 'Pós-graduação em Teologia do Novo Testamento', 'Pós-graduação em Liderança Cristã', 'Pós-graduação em Formação Política', 'Pós-graduação em Missiologia Urbana', 'Pós-graduação em Psicopedagogia', 'Pós-graduação em História do Cristianismo'] }
      ]
    },
    {
      title: 'EXPECTATIVA DE INVESTIMENTO EM PÓS-GRADUAÇÃO',
      questions: [
        { id: 'p_inv', text: 'Pensando em uma futura pós-graduação, qual faixa de mensalidade você consideraria viável? (Considere o valor mensal do curso)', type: 'radio', options: ['Até R$ 300 por mês', 'Entre R$ 301 e R$ 500 por mês', 'Entre R$ 501 e R$ 800 por mês', 'Entre R$ 801 e R$ 1.200 por mês', 'Acima de R$ 1.200 por mês'] }
      ]
    },
    {
      title: 'BLOCO 8 — MOMENTO DE DECISÃO',
      questions: [
        { id: 'p8_1', text: '8.1 Em quanto tempo você considera iniciar uma graduação ou pós-graduação?', type: 'radio', options: ['Até 6 meses', 'Entre 6 e 12 meses', 'Entre 12 e 24 meses', 'Ainda não tenho previsão'] }
      ]
    },
    {
      title: 'BLOCO 9 — PERCEPÇÃO DE VALOR (NPS POTENCIAL)',
      questions: [
        { id: 'p9_1', text: '9.1 Em uma escala de 0 a 10, o quanto você considera a FICV uma instituição relevante para sua formação acadêmica futura?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 10 — CONTINUIDADE DE RELACIONAMENTO',
      questions: [
        { id: 'p10_1', text: '10.1 Você gostaria de receber informações sobre cursos, eventos e oportunidades de formação da FICV?', type: 'radio', options: ['Sim', 'Não'] }
      ]
    }
  ];

  return <BaseSurvey steps={steps} onComplete={onComplete} themeColor="#D69E2E" />;
};

export default ProspectSurvey;
