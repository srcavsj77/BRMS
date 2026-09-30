const logger = require('../../config/logger');

const sqlInjectionPattern = /(\b(UPDATE|DELETE|INSERT|DROP|TRUNCATE)\b\s+.*|(\bOR\b\s+\d+\s*=\s*\d+))/i;

/**
 * Middleware para prevenção de injeção de código SQL (SQL Injection).
 * 
 * Executa uma verificação recursiva varrendo o corpo da requisição (req.body)
 * em busca de termos reservados e padrões típicos usados em ataques de SQL Injection,
 * bloqueando a requisição e retornando status 403 em caso positivo.
 * 
 * @param {Object} req - Objeto de requisição do Express contendo o corpo a ser sanitizado.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Próxima função de execução.
 * @returns {void}
 * 
 * @futuras-melhorias
 * - Utilizar bibliotecas robustas e testadas pelo mercado (como dompurify, validator ou express-mongo-sanitize) em vez de regex local customizada.
 * - Registrar os logs de bloqueio em um serviço centralizado SIEM para controle de tentativas de intrusão.
 * - Bloquear temporariamente (rate-limiting ou ban automático) o IP de origem após múltiplas tentativas detectadas.
 */
const preventInjection = (req, res, next) => {
  const detectInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (sqlInjectionPattern.test(obj[key])) return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (detectInjection(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body && detectInjection(req.body)) {
    logger.warn(`[Segurança] Bloqueada tentativa de injeção do IP: ${req.ip}`);
    return res.status(403).json({ error: '🚨 Acesso Negado: Tentativa de injeção de código ou caracteres maliciosos detectada.' });
  }
  next();
};

module.exports = { preventInjection };
