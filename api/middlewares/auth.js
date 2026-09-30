const jwt = require('jsonwebtoken');
const JWT_SECRET = 'brms_fgv_super_secret_key_2026'; // Em prod, usar variável de ambiente

/**
 * Middleware para autenticação de tokens JWT.
 * 
 * Extrai o token do cabeçalho de autorização (Bearer Token), valida-o 
 * contra a chave secreta (JWT_SECRET) e anexa as informações decodificadas 
 * do usuário à requisição (req.user), permitindo que rotas protegidas acessem.
 * 
 * @param {Object} req - Objeto de requisição do Express contendo os headers.
 * @param {Object} res - Objeto de resposta do Express.
 * @param {Function} next - Função next para delegar a execução ao próximo middleware ou controller.
 * @returns {void}
 * 
 * @futuras-melhorias
 * - Integrar com um serviço centralizado de Identidade (como Keycloak, Active Directory ou AWS Cognito).
 * - Armazenar os segredos em variáveis de ambiente (`process.env.JWT_SECRET`) em vez de chave estática (hardcoded).
 * - Implementar uma blacklist para tokens revogados.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, JWT_SECRET };
