/**
 * Constantes globais do ciclo de vida e autorização dos membros.
 * Utilizado para manter consistência semântica e evitar hard-coding de strings espalhadas no código.
 */

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  BLOCKED: 'blocked',
  IMPORTED_WITHOUT_PASSWORD: 'imported_without_password',
  ONBOARDING_INCOMPLETE: 'onboarding_incomplete'
};

export const USER_ROLES = {
  CONGRESSISTA: 'congressista',
  PALESTRANTE: 'palestrante',
  PARCEIRO: 'parceiro',
  EXPOSITOR: 'expositor',
  STAFF: 'staff'
};
