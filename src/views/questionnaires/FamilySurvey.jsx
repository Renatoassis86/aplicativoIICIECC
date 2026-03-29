import React from 'react';
import BaseSurvey from './BaseSurvey';

const FamilySurvey = ({ onComplete }) => {
  const steps = [
    {
      title: 'BLOCO 1 — PERFIL DO EDUCADOR FAMILIAR',
      motivation: 'Entender seu perfil ajuda a personalizar o suporte.',
      questions: [
        { id: 'f1_1', text: '1.1 Você se identifica principalmente como:', type: 'radio', options: ['Pai', 'Mãe', 'Responsável legal', 'Outro educador familiar'] },
        { id: 'f1_2', text: '1.2 Seu modelo principal de ensino domiciliar é:', type: 'radio', options: ['Homeschooling (educação domiciliar em tempo integral)', 'Afterschooling (educação domiciliar complementar)'] },
        { id: 'f1_3', text: '1.3 Há quanto tempo sua família pratica o ensino domiciliar?', type: 'radio', options: ['Estamos começando agora', 'Menos de 1 ano', 'Entre 1 e 3 anos', 'Mais de 3 anos'] }
      ]
    },
    {
      title: 'BLOCO 2 — PERFIL DAS CRIANÇAS ATENDIDAS',
      motivation: 'Queremos conhecer seus alunos.',
      questions: [
        { id: 'f2_1', text: '2.1 Quantos filhos você educa atualmente no contexto do ensino domiciliar?', type: 'radio', options: ['1', '2', '3', '4 ou mais'] },
        { id: 'f2_2', text: '2.2 Faixa etária das crianças sob sua responsabilidade educacional: (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['0 a 5 anos', '6 a 9 anos', 'Acima de 9 anos'] }
      ]
    },
    {
      title: 'BLOCO 3 — ORGANIZAÇÃO PEDAGÓGICA ATUAL',
      motivation: 'Como as aulas acontecem na sua casa?',
      questions: [
        { id: 'f3_1', text: '3.1 Como você organiza atualmente o processo de ensino das crianças?', type: 'radio', options: ['Seguimos um currículo estruturado, com progressão clara', 'Utilizamos materiais organizados, mas sem um currículo completo', 'Organizamos o ensino de forma autoral, a partir de diferentes fontes', 'Estamos em fase de estruturação do ensino domiciliar', 'Ainda não temos uma organização pedagógica definida'] },
        { id: 'f3_2', text: '3.2 Avalie seu nível de concordância com a afirmação: “Como educador familiar, considero essencial que o ensino seja planejado, progressivo e adequado ao desenvolvimento da criança.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] }
      ]
    },
    {
      title: 'BLOCO 4 — USO DE CURRÍCULO, MATERIAIS E MÉTODO',
      questions: [
        { id: 'f4_1', text: '4.1 Quais recursos pedagógicos você utiliza atualmente no ensino domiciliar? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Currículos completos organizados por faixa etária', 'Materiais estruturados por áreas do saber', 'Roteiros semanais ou planos de aula', 'Atividades práticas e manuais', 'Leituras dirigidas (linguagem, humanidades, ciências)', 'Vídeos ou aulas de apoio ao educador', 'Plataforma digital educacional', 'Registros próprios (cadernos, fichas, relatórios)', 'Outro(s)'] }
      ]
    },
    {
      title: 'BLOCO 5 — REGISTROS, ACOMPANHAMENTO E AVALIAÇÃO PEDAGÓGICA',
      questions: [
        { id: 'f5_1', text: '5.1 Você realiza algum tipo de registro das aulas ou atividades realizadas?', type: 'radio', options: ['Sim, de forma sistemática', 'Sim, de forma parcial', 'Apenas registros informais', 'Não realizamos registros'] },
        { id: 'f5_2', text: '5.2 Quais formas de acompanhamento do desenvolvimento da criança você utiliza? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Observação contínua do progresso', 'Registro de atividades realizadas', 'Avaliações pedagógicas periódicas', 'Portfólios de trabalhos', 'Conversas dirigidas e devolutivas', 'Não realizamos avaliações estruturadas'] },
        { id: 'f5_3', text: '5.3 Em uma escala de 0 a 10, quão seguro(a) você se sente em relação ao acompanhamento pedagógico do desenvolvimento da criança?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 6 — ÁREAS DO SABER E INTERDISCIPLINARIDADE',
      questions: [
        { id: 'f6_1_ling', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Linguagem e alfabetização]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_1_mat', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Matemática]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_1_hum', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Humanidades (História, cultura)]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_1_nat', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Ciências naturais]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_1_art', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Artes e música]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_1_car', text: '6.1 O quanto você considera importante que o currículo domiciliar contemple de forma integrada: [Formação do caráter e virtudes]', type: 'scale', options: ['Nada', 'Pouco', 'Neutro', 'Importante', 'Muito'] },
        { id: 'f6_2', text: '6.2 Avalie a afirmação: “A interdisciplinaridade favorece um aprendizado mais profundo, significativo e duradouro.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] }
      ]
    },
    {
      title: 'BLOCO 7 — COSMOVISÃO, MÉTODO CLÁSSICO E BILINGUISMO',
      questions: [
        { id: 'f7_1', text: '7.1 Em que medida faz sentido para você uma educação fundamentada em uma cosmovisão cristã integrada a todas as áreas do conhecimento?', type: 'range', min: 0, max: 10 },
        { id: 'f7_2', text: '7.2 O quanto o método clássico é relevante na educação dos seus filhos?', type: 'range', min: 0, max: 10 },
        { id: 'f7_3', text: '7.3 Qual a importância do ensino bilíngue no desenvolvimento intelectual da criança?', type: 'radio', options: ['Nada importante', 'Pouco importante', 'Moderadamente importante', 'Muito importante'] }
      ]
    },
    {
      title: 'BLOCO 8 — AVALIAÇÃO DO MATERIAL UTILIZADO ATUALMENTE (NPS)',
      questions: [
        { id: 'f8_1', text: '8.1 Em uma escala de 0 a 10, o quanto você recomendaria o material ou currículo educacional que sua família utiliza atualmente para outra família educadora?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 9 — DESAFIOS ATUAIS DO EDUCADOR FAMILIAR',
      questions: [
        { id: 'f9_1', text: '9.1 Quais são hoje seus principais desafios como educador familiar? (Marque até 3 opções)', type: 'checkbox', options: ['Estruturação de um currículo completo', 'Organização da rotina pedagógica', 'Acompanhamento do desenvolvimento da criança', 'Avaliação pedagógica adequada', 'Falta de tempo para planejamento', 'Insegurança metodológica', 'Outro'] }
      ]
    },
    {
      title: 'BLOCO 10 — INTERESSE E ADERÊNCIA A UM CURRÍCULO COMO O OIKOS',
      questions: [
        { id: 'f10_1', text: '10.1 Qual é seu nível de interesse em um currículo educacional completo, estruturado, cristão, clássico, bilíngue e integral para o ensino domiciliar?', type: 'radio', options: ['Muito interesse', 'Interesse moderado', 'Pouco interesse', 'Nenhum interesse'] },
        { id: 'f10_2', text: '10.2 Você gostaria de receber informações e orientações sobre propostas curriculares alinhadas a essa visão?', type: 'radio', options: ['Sim', 'Não'] }
      ]
    }
  ];

  return <BaseSurvey steps={steps} onComplete={onComplete} themeColor="#805AD5" />;
};

export default FamilySurvey;
