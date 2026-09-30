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
    'Cadastrar',
    'Listar / Editar',
    'Associar Módulos',
    'Excluir sistema',
    'Conformidade',
    'Documentos',
    'Projetos documentados',
    'Listar/Projetos',
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
    'Cadastrar',
    'Listar / Editar',
    'Associar Módulos',
    'Conformidade',
    'Documentos',
    'Projetos documentados',
    'Listar/Projetos',
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
    'Projetos documentados',
    'Listar/Projetos',
    'Configurações',
    'Monitoramento',
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
  'Cadastrar',
  'Listar / Editar',
  'Associar Módulos',
  'Excluir sistema',
  'Conformidade',
  'Documentos',
  'Projetos documentados',
  'Listar/Projetos',
  'Configurações',
  'Monitoramento',
  'Usuários',
  'Manutenção de perfil',
  'Sobre o sistema',
];

/**
 * Verifica se um usuário possui permissão para acessar determinado recurso do sistema.
 * 
 * A validação é feita checando se o usuário está ativo (não bloqueado), 
 * liberando itens de acesso global ("Home" e "Sobre o sistema"), e consultando as
 * permissões dinâmicas definidas no perfil (profilesList) ou as permissões padrão.
 * 
 * @param {Object} user - Dados do usuário atual logado (contendo status e role).
 * @param {string} itemLabel - Identificador do menu ou ação que se deseja acessar.
 * @param {Array} [profilesList=null] - Lista opcional de perfis dinâmicos carregados da API.
 * @returns {boolean} Retorna true se o usuário tiver permissão e false caso contrário.
 * 
 * @futuras-melhorias
 * - Implementar cache local das permissões avaliadas para otimizar renderizações repetidas no React.
 * - Integrar com sistema de controle baseado em hierarquia (ABAC - Attribute-Based Access Control) se necessário.
 * - Adicionar logs das auditorias de tentativas de acesso negado na interface.
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
