import React, { useState } from 'react';
import BaseSurvey from './BaseSurvey';

const SchoolSurvey = ({ onComplete, userType }) => {
  const steps = [
    {
      title: 'ELEGIBILIDADE',
      motivation: 'Sua experiência no 1º congresso é fundamental para nós.',
      questions: [
        { id: 'q0_1', text: '0.1 Sua instituição participou do 1º Congresso Internacional de Educação Cristã Clássica?', type: 'radio', options: ['Sim', 'Não'] }
      ]
    },
    {
      title: 'IDENTIFICAÇÃO E CONTATO',
      motivation: 'Queremos conhecer melhor quem faz parte da liderança.',
      questions: [
        { id: 'q1_1', text: '1.1 Nome completo do respondente:', type: 'text' },
        // A pergunta 1.2 é removida aqui se o tipo de usuário já foi selecionado (Evitando redundância)
        ...(userType && ['mantenedor', 'diretor', 'coordenador'].includes(userType.id) ? [] : [
          { id: 'q1_2', text: '1.2 Cargo/função na instituição:', type: 'radio', options: ['Mantenedor(a) / Proprietário(a)', 'Diretor(a)', 'Coordenador(a) pedagógico(a)', 'Professor(a)', 'Administrativo', 'Outro'] }
        ]),
        { id: 'q1_3', text: '1.3 Nome da instituição de ensino:', type: 'text' },
        { 
          id: 'q1_4_cidade', 
          text: '1.4 Cidade da escola:', 
          type: 'autocomplete', 
          options: ['João Pessoa', 'Cabedelo', 'Bayeux', 'Santa Rita', 'Conde', 'Recife', 'Campina Grande', 'Natal', 'Fortaleza', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Belo Horizonte', 'Curitiba']
        },
        { 
          id: 'q1_4_uf', 
          text: '1.4 UF da escola:', 
          type: 'select', 
          options: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
        },
        { id: 'q1_5', text: '1.5 E-mail para contato:', type: 'email' },
        { id: 'q1_6', text: '1.6 Telefone / WhatsApp para contato:', type: 'tel' }
      ]
    },
    {
      title: 'PERFIL INSTITUCIONAL',
      motivation: 'Entender sua estrutura nos ajuda a oferecer o melhor suporte.',
      questions: [
        { id: 'q2_1', text: '2.1 Há quanto tempo sua escola está em funcionamento?', type: 'radio', options: ['Menos de 1 ano', '1 a 5 anos', '6 a 10 anos', 'Mais de 10 anos'] },
        { id: 'q2_2_infantil', text: '2.2 Quantidade de alunos atendidos por segmento: Educação Infantil', type: 'text' },
        { id: 'q2_2_fund1', text: '2.2 Quantidade de alunos atendidos por segmento: Fundamental I', type: 'text' },
        { id: 'q2_2_fund2', text: '2.2 Quantidade de alunos atendidos por segmento: Fundamental II', type: 'text' },
        { id: 'q2_2_medio', text: '2.2 Quantidade de alunos atendidos por segmento: Ensino Médio', type: 'text' },
        { id: 'q2_3', text: '2.3 Qual é a situação atual da sua escola em relação à confessionalidade cristã?', type: 'radio', options: ['Somos uma escola cristã confessional (já estruturada como confessional)', 'Estamos em transição para nos tornarmos uma escola cristã confessional', 'Temos interesse em avaliar essa possibilidade (ainda em estudo)', 'Não é uma direção considerada pela escola neste momento'] },
        { id: 'q2_4', text: '2.4 Sua escola oferece formação continuada para os docentes?', type: 'radio', options: ['Sim, de forma contínua e estruturada', 'Eventualmente', 'Não oferece'] }
      ]
    },
    {
      title: 'MODELO PEDAGÓGICO E MATURIDADE',
      motivation: 'A visão clássica é o nosso norte. Como está o alinhamento da sua escola?',
      questions: [
        { id: 'q3_1', text: '3.1 Avalie seu nível de concordância com a afirmação: “Nossa escola possui clareza e alinhamento institucional quanto à cosmovisão cristã aplicada ao currículo.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Nem concordo nem discordo', 'Concordo', 'Concordo totalmente'] },
        { id: 'q3_2', text: '3.2 Quais são hoje os principais desafios para a consolidação ou adoção da Educação Cristã Clássica em sua escola? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Formação da equipe docente', 'Alinhamento da liderança/mantenedora', 'Currículo e materiais didáticos adequados', 'Resistência de famílias ou comunidade', 'Custos e investimento financeiro', 'Adequação à BNCC e exigências legais', 'Infraestrutura e rotina escolar', 'Outro'] },
        { id: 'q3_3', text: '3.3 Em uma escala de 0 a 10, quão importante é o ensino bilíngue para sua escola?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'CRITÉRIOS DE ESCOLHA',
      motivation: 'O que mais pesa na hora de decidir pelo futuro pedagógico?',
      questions: [
        { id: 'q4_1', text: '4.1 Quais fatores mais influenciam a escolha de um sistema de ensino para sua escola? (Marque até 3 opções)', type: 'checkbox', options: ['Qualidade acadêmica', 'Coerência teológica / cosmovisão cristã', 'Material didático completo e integrado', 'Formação e suporte aos professores', 'Reputação da instituição fornecedora', 'Preço'] },
        { id: 'q4_2', text: '4.2 Ordene os três fatores mais importantes (1º, 2º e 3º):', type: 'ranking', options: ['Qualidade acadêmica', 'Coerência teológica / cosmovisão cristã', 'Material didático completo e integrado', 'Formação e suporte aos professores', 'Reputação da instituição fornecedora', 'Preço'] }
      ]
    },
    {
      title: 'INVESTIMENTO EM LIVROS E CURRÍCULOS',
      motivation: 'Transparência nos ajuda a criar soluções viáveis.',
      questions: [
        { id: 'q5_1', text: '5.1 Quanto sua escola investe atualmente, em média, por aluno ao ano, em livros e currículos do sistema de ensino adotado?', type: 'radio', options: ['Até R$ 500', 'Entre R$ 500 e R$ 1.000', 'Mais de R$ 1.000', 'Prefiro não responder'] },
        { id: 'q5_2', text: '5.2 Quanto sua escola estaria disposta a investir, por aluno ao ano, em materiais complementares ao currículo principal?', type: 'radio', options: ['Até R$ 500', 'Entre R$ 500 e R$ 1.250', 'Entre R$ 1.250 e R$ 2.000', 'Mais de R$ 2.000', 'Prefiro não responder'] }
      ]
    },
    {
      title: 'SATISFAÇÃO (CSI)',
      motivation: 'Sua voz importa muito na nossa evolução.',
      questions: [
        { id: 'q6_1', text: '6.1 Avalie sua satisfação geral com o sistema de ensino atualmente utilizado pela escola:', type: 'scale', options: ['Muito insatisfeito', 'Insatisfeito', 'Neutro', 'Satisfeito', 'Muito satisfeito'] }
      ]
    },
    {
      title: 'RECOMENDAÇÃO (NPS)',
      motivation: 'Indicações constroem nossa comunidade.',
      questions: [
        { id: 'q7_1', text: '7.1 Em uma escala de 0 a 10, o quanto você recomendaria o sistema de ensino atualmente utilizado por sua escola a outra instituição?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'INTERESSE E DECISÃO',
      motivation: 'Último passo! Vamos planejar o futuro?',
      questions: [
        { id: 'q8_1', text: '8.1 Qual é o seu nível de interesse em uma solução educacional que integre currículo cristão clássico, livros didáticos, formação docente, mentoria pedagógica e suporte contínuo?', type: 'radio', options: ['Muito interesse', 'Interesse moderado', 'Pouco interesse', 'Nenhum interesse'] },
        { id: 'q8_2', text: '8.2 Quem participa da decisão sobre adoção ou troca de sistema de ensino em sua escola? (Marque todas as opções)', type: 'checkbox', options: ['Mantenedor(a)', 'Direção', 'Coordenação pedagógica', 'Conselho/comitê', 'Professores', 'Outro'] },
        { id: 'q8_3', text: '8.3 Em quanto tempo sua escola poderia avaliar ou decidir uma possível mudança de sistema de ensino?', type: 'radio', options: ['Até 3 meses', '4 a 6 meses', '7 a 12 meses', 'Mais de 12 meses', 'Ainda não sabemos'] }
      ]
    }
  ];

  return <BaseSurvey steps={steps} onComplete={onComplete} themeColor="var(--primary)" />;
};

export default SchoolSurvey;
