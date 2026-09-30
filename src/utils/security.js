/**
 * Utilitários de Segurança para o BRMS
 * Padrão obrigatório para todos os inputs do sistema
 */

/**
 * Sanitiza textos contra injeções SQL (SQL Injection) no lado do cliente.
 * 
 * Remove caracteres de comentários (--, /*, *\/) e expressões SQL comuns
 * (SELECT, DROP, DELETE, etc.) do texto digitado pelo usuário.
 * 
 * @param {string} text - O texto inserido no input.
 * @returns {string} O texto limpo de padrões de injeção SQL.
 * 
 * @futuras-melhorias
 * - Adicionar sanitização de tags HTML/XSS (Cross-Site Scripting) usando biblioteca especializada como DOMPurify.
 * - Tornar a detecção configurável por tipo de campo (ex: permitir palavras-chave SQL em campos de código e bloquear em campos de texto simples).
 */
export const sanitizeSQL = (text) => {
  if (typeof text !== 'string') return text;

  // Lista de padrões proibidos (SQL Injection)
  const forbiddenPatterns = [
    /--/g, // Comentários SQL
    /;/g, // Excedentes de comando
    /\/\*/g, // Início de comentário bloco
    /\*\//g, // Fim de comentário bloco
    /\b(SELECT|DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER|EXEC|UNION|FROM|WHERE|HAVING|GRANT|REVOKE)\b/gi, // Palavras-chave SQL
    /\b(OR|AND)\b\s+(\d+|\w+)\s*=\s*(\d+|\w+)/gi, // Bypass lógico sem aspas (ex: OR 1=1)
    /(\'|\")\s*(OR|AND)\s*(\'|\")?\s*(\d+|\w+)\s*=\s*(\d+|\w+)/gi, // Bypass lógico com aspas
  ];

  let sanitized = text;
  forbiddenPatterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

/**
 * Helper para lidar com mudanças em inputs do React de forma segura.
 * 
 * Intercepta o evento de alteração do formulário, higieniza o valor do input contra
 * SQL Injection usando `sanitizeSQL` e atualiza o estado correspondente do formulário.
 * Emite um aviso no console caso um padrão de ataque seja bloqueado.
 * 
 * @param {Event} e - Evento de mudança do elemento input.
 * @param {Function} setFormData - Função de atualização de estado do componente React.
 * @returns {void}
 * 
 * @futuras-melhorias
 * - Exibir alerta visual amigável (Toast/Tooltip) na tela quando um caractere malicioso for removido.
 * - Integrar com validação de schemas do Zod ou Yup no nível do formulário para centralizar a segurança.
 */
export const handleSafeChange = (e, setFormData) => {
  const { name, value } = e.target;
  const sanitizedValue = sanitizeSQL(value);

  if (sanitizedValue !== value) {
    console.warn(`[Segurança] Tentativa de SQL Injection bloqueada no campo: ${name}`);
  }

  setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
};
