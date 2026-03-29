/**
 * CPF utility functions for formatting and validation
 */

// Limpa qualquer caracter que não seja número
export const stripCPF = (cpf) => {
  if (!cpf) return '';
  return cpf.toString().replace(/[^\d]/g, '');
};

// Formata o CPF para exibição: 000.000.000-00
export const formatCPF = (cpf) => {
  const clean = stripCPF(cpf);
  if (clean.length > 11) return clean; // Não tenta formatar se for maior
  
  return clean
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

// Verificação de CPF válido segundo o algoritmo oficial brasileiro
export const isValidCPF = (cpf) => {
  const strCPF = stripCPF(cpf);

  if (strCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais (caso especial que passa pelo algoritmo mas é inválido)
  if (/^(\d)\1{10}$/.test(strCPF)) return false;

  let sum;
  let rest;
  sum = 0;

  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
  }
  rest = (sum * 10) % 11;

  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
  }
  rest = (sum * 10) % 11;

  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(strCPF.substring(10, 11))) return false;

  return true;
};
