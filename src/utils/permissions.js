/**
 * Mapeamento de permissões do sistema.
 * Define quais menus cada papel (role) ou usuário específico pode acessar.
 */
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  BLOCKED: 'blocked',
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Acesso total e irrestrito ao sistema, gestão de identidade e segurança.',
  [ROLES.EDITOR]:
    'Pode criar e editar regras e sistemas. Acesso administrativo apenas para consulta.',
  [ROLES.VIEWER]: 'Acesso apenas para leitura (Auditoria, Regras e Documentos).',
  [ROLES.BLOCKED]: 'Sem acesso ao sistema.',
};

export const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: [
    'Home',
    'Regras de Negócio',
    'Listar / Editar regras',
    'Criar regra',
    'Editar regra',
    'Excluir regra',
    'Auditoria',
    'Alterações realizadas',
    'Dashboard',
    'Sistemas',
    'Cadastrar sistema',
    'Editar sistema',
    'Excluir sistema',
    'Conformidade',
    'Documentos',
    'Configurações',
    'Monitoramento',
    'Controle de Acesso',
    'Usuários',
    'Manutenção de perfil',
    'Sobre o sistema',
  ],
  [ROLES.EDITOR]: [
    'Home',
    'Regras de Negócio',
    'Listar / Editar regras',
    'Criar regra',
    'Editar regra',
    'Auditoria',
    'Alterações realizadas',
    'Dashboard',
    'Sistemas',
    'Cadastrar sistema',
    'Editar sistema',
    'Conformidade',
    'Documentos',
    'Configurações',
    'Monitoramento',
    'Controle de Acesso',
    'Usuários',
    'Manutenção de perfil',
    'Sobre o sistema',
  ],
  [ROLES.VIEWER]: [
    'Home',
    'Regras de Negócio',
    'Listar / Editar regras',
    'Auditoria',
    'Alterações realizadas',
    'Dashboard',
    'Conformidade',
    'Documentos',
    'Configurações',
    'Monitoramento',
    'Controle de Acesso',
    'Usuários',
    'Sobre o sistema',
  ],
  [ROLES.BLOCKED]: [],
};

/**
 * Lista completa de menus para seleção na manutenção de perfis.
 */
export const ALL_SYSTEM_MENUS = [
  'Home',
  'Regras de Negócio',
  'Listar / Editar regras',
  'Criar regra',
  'Editar regra',
  'Excluir regra',
  'Auditoria',
  'Alterações realizadas',
  'Dashboard',
  'Sistemas',
  'Cadastrar sistema',
  'Editar sistema',
  'Excluir sistema',
  'Conformidade',
  'Documentos',
  'Configurações',
  'Monitoramento',
  'Controle de Acesso',
  'Usuários',
  'Manutenção de perfil',
  'Sobre o sistema',
];

/**
 * Verifica se um usuário tem permissão para acessar um item.
 */
export const checkPermission = (user, itemLabel, profilesList = null) => {
  if (!user || user.status === 'Bloqueado') return false;
  
  // Menus globais liberados para qualquer usuário logado ativo
  if (itemLabel === 'Home' || itemLabel === 'Sobre o sistema') return true;

  // Se houver uma lista de perfis dinâmicos, tenta buscar por lá primeiro
  if (profilesList && Array.isArray(profilesList)) {
    const dynamicProfile = profilesList.find((p) => p.id === user.role);
    if (dynamicProfile) {
      if (dynamicProfile.status === 'Inativo') return false;
      return dynamicProfile.permissions.includes(itemLabel);
    }
  }

  const permissions = DEFAULT_PERMISSIONS[user.role] || [];
  return permissions.includes(itemLabel);
};
