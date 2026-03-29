import React from 'react';
import BaseSurvey from './BaseSurvey';

const ChurchSurvey = ({ onComplete, userType }) => {
  const steps = [
    {
      title: 'BLOCO 1 — PERFIL DO RESPONDENTE',
      motivation: 'Entender sua função ajuda a contextualizar o ensino.',
      questions: [
        // Omitir c1_1 se já foi selecionado anteriormente
        ...(userType && ['servo_kids', 'lider_infantil'].includes(userType.id) ? [] : [
          { id: 'c1_1', text: '1.1 Qual é sua principal função na igreja?', type: 'radio', options: ['Pastor / Presbítero', 'Líder de ministério', 'Coordenador(a) da Escola Bíblica', 'Professor(a) da Escola Bíblica', 'Voluntário(a) do ministério infantil', 'Outro'] }
        ]),
        { id: 'c1_2', text: '1.2 Sua igreja está localizada em:', type: 'radio', options: ['Capital', 'Região metropolitana', 'Interior'] },
        { id: 'c1_3', text: '1.3 Em média, quantas crianças participam regularmente das atividades bíblicas da igreja?', type: 'radio', options: ['Até 20', '21 a 50', '51 a 100', 'Mais de 100'] }
      ]
    },
    {
      title: 'BLOCO 2 — VISÃO DA IGREJA SOBRE A FORMAÇÃO DE CRIANÇAS',
      questions: [
        { id: 'c2_1', text: '2.1 Avalie seu nível de concordância com a afirmação: “A formação bíblica e teológica das crianças é parte essencial da missão da igreja.”', type: 'scale', options: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] },
        { id: 'c2_2', text: '2.2 Em sua percepção, a igreja entende que crianças podem aprender fundamentos teológicos adequados à sua idade?', type: 'radio', options: ['Sim, plenamente', 'Sim, em parte', 'Ainda há resistência', 'Não'] }
      ]
    },
    {
      title: 'BLOCO 3 — ORGANIZAÇÃO DO ENSINO BÍBLICO E TEOLÓGICO',
      questions: [
        { id: 'c3_1', text: '3.1 Como o ensino bíblico e teológico para crianças é organizado atualmente em sua igreja?', type: 'radio', options: ['Currículo estruturado e contínuo', 'Materiais diversos, sem progressão clara', 'Conteúdo definido por cada professor', 'Ensino pontual, sem planejamento contínuo', 'Não há organização definida'] },
        { id: 'c3_2', text: '3.2 Existe uma progressão de conteúdos conforme a idade das crianças?', type: 'radio', options: ['Sim, bíblica e teológica', 'Apenas bíblica', 'Parcial', 'Não'] }
      ]
    },
    {
      title: 'BLOCO 4 — CONTEÚDO BÍBLICO ENSINADO ÀS CRIANÇAS',
      questions: [
        { id: 'c4_1', text: '4.1 Quais conteúdos bíblicos são mais frequentemente ensinados às crianças? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Narrativas do Antigo Testamento', 'Narrativas do Novo Testamento', 'História da redenção', 'Personagens bíblicos', 'Evangelhos e vida de Cristo', 'Textos bíblicos para memorização'] },
        { id: 'c4_2', text: '4.2 Em sua avaliação, o conteúdo bíblico ensinado às crianças é:', type: 'radio', options: ['Profundo e bem conectado', 'Adequado, mas fragmentado', 'Superficial', 'Irregular'] }
      ]
    },
    {
      title: 'BLOCO 5 — CONTEÚDO TEOLÓGICO ENSINADO ÀS CRIANÇAS',
      questions: [
        { id: 'c5_1', text: '5.1 Sua igreja ensina conteúdos teológicos de forma intencional às crianças?', type: 'radio', options: ['Sim, de forma estruturada', 'Sim, de forma pontual', 'Muito pouco', 'Não'] },
        { id: 'c5_2', text: '5.2 Quais temas teológicos já são trabalhados com as crianças? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Quem é Deus (atributos de Deus)', 'Quem é Jesus Cristo', 'O Espírito Santo', 'Pecado e redenção', 'Vida cristã e obediência', 'Oração', 'Igreja e comunhão', 'Não trabalhamos conteúdos teológicos'] },
        { id: 'c5_3', text: '5.3 Em uma escala de 0 a 10, o quanto você considera importante que crianças aprendam fundamentos teológicos desde cedo?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 6 — MÉTODO, DIDÁTICA E LINGUAGEM',
      questions: [
        { id: 'c6_1', text: '6.1 Quais recursos são mais utilizados no ensino bíblico e teológico infantil? (Marque todas as opções aplicáveis)', type: 'checkbox', options: ['Leitura bíblica guiada', 'Aulas expositivas adaptadas', 'Catequese (perguntas e respostas)', 'Atividades lúdicas e jogos', 'Música e memorização', 'Artes e atividades manuais', 'Vídeos e recursos digitais'] },
        { id: 'c6_2', text: '6.2 Em sua percepção, a linguagem utilizada é adequada à compreensão das crianças?', type: 'radio', options: ['Sempre', 'Na maioria das vezes', 'Raramente', 'Não'] }
      ]
    },
    {
      title: 'BLOCO 7 — FORMAÇÃO DOS PROFESSORES E VOLUNTÁRIOS',
      questions: [
        { id: 'c7_1', text: '7.1 Os professores e voluntários recebem formação bíblica e teológica para ensinar crianças?', type: 'radio', options: ['Formação contínua', 'Formação ocasional', 'Apenas orientações básicas', 'Não recebem formação'] },
        { id: 'c7_2', text: '7.2 Em uma escala de 0 a 10, o quanto os professores se sentem preparados para ensinar conteúdos bíblicos e teológicos às crianças?', type: 'range', min: 0, max: 10 }
      ]
    },
    {
      title: 'BLOCO 8 — ACOMPANHAMENTO E FRUTOS DO ENSINO',
      questions: [
        { id: 'c8_1', text: '8.1 Sua igreja realiza algum tipo de acompanhamento do desenvolvimento bíblico e teológico das crianças?', type: 'radio', options: ['Sim, estruturado', 'Sim, informal', 'Não realizamos acompanhamento'] },
        { id: 'c8_2', text: '8.2 Quais sinais você percebe quando o ensino bíblico e teológico é bem-sucedido? (Marque até 3 opções)', type: 'checkbox', options: ['Interesse das crianças pela Bíblia', 'Capacidade de narrar histórias bíblicas', 'Compreensão de quem é Deus', 'Aplicação prática na vida diária', 'Envolvimento das famílias', 'Permanência das crianças na vida da igreja'] }
      ]
    },
    {
      title: 'BLOCO 9 — DESAFIOS DA IGREJA',
      questions: [
        { id: 'c9_1', text: '9.1 Quais são hoje os maiores desafios da sua igreja no ensino bíblico e teológico infantil? (Marque até 3 opções)', type: 'checkbox', options: ['Falta de currículo estruturado', 'Falta de formação teológica dos professores', 'Dificuldade de adaptar a linguagem para crianças', 'Rotatividade de voluntários', 'Pouco tempo para preparo', 'Falta de materiais adequados'] }
      ]
    },
    {
      title: 'BLOCO 10 — VALOR PERCEBIDO E ABERTURA',
      questions: [
        { id: 'c10_1', text: '10.1 Em uma escala de 0 a 10, o quanto você considera importante investir em materiais estruturados para o ensino bíblico e teológico de crianças?', type: 'range', min: 0, max: 10 },
        { id: 'c10_2', text: '10.2 Sua igreja estaria aberta a conhecer novas propostas de apoio à formação bíblica e teológica infantil?', type: 'radio', options: ['Sim', 'Talvez', 'Não'] }
      ]
    },
    {
      title: 'BLOCO 11 — RELACIONAMENTO',
      questions: [
        { id: 'c11_1', text: '11.1 Você gostaria de receber conteúdos, orientações ou convites relacionados à formação bíblica e teológica de crianças na igreja?', type: 'radio', options: ['Sim', 'Não'] }
      ]
    }
  ];

  return <BaseSurvey steps={steps} onComplete={onComplete} themeColor="#38A169" />;
};

export default ChurchSurvey;
