/**
 * Utilitários de Segurança para o BRMS
 * Padrão obrigatório para todos os inputs do sistema
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
 * Hook ou Helper para lidar com mudanças de input com segurança
 */
export const handleSafeChange = (e, setFormData) => {
  const { name, value } = e.target;
  const sanitizedValue = sanitizeSQL(value);

  if (sanitizedValue !== value) {
    console.warn(`[Segurança] Tentativa de SQL Injection bloqueada no campo: ${name}`);
  }

  setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
};
