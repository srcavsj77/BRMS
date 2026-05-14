const logger = require('../../config/logger');

const sqlInjectionPattern = /(\b(UPDATE|DELETE|INSERT|DROP|TRUNCATE)\b\s+.*|(\bOR\b\s+\d+\s*=\s*\d+))/i;

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
