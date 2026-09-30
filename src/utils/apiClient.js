/**
 * API Client para centralizar chamadas ao backend do BRMS-FGV.
 * Gerencia automaticamente a URL base e os Tokens de Autenticação.
 */

/**
 * Determina dinamicamente a URL base da API com base no ambiente do cliente.
 * 
 * Prioriza o hostname atual da janela para permitir o acesso ao sistema
 * via rede local/outros dispositivos conectados.
 * 
 * @returns {string} A URL base completa da API (ex: http://localhost:3333).
 * 
 * @futuras-melhorias
 * - Obter a URL de uma variável de ambiente do Vite (`import.meta.env.VITE_API_URL`) para ambientes de homologação/produção.
 */
const getBaseUrl = () => {
  // Prioriza o hostname atual para permitir acesso via rede local (IP)
  const host = window.location.hostname || 'localhost';
  return `http://${host}:3333`;
};

const API_BASE_URL = getBaseUrl();

/**
 * Monta os cabeçalhos (headers) HTTP padrão para as chamadas de API.
 * 
 * Injeta o cabeçalho Content-Type e insere opcionalmente o token de autorização JWT
 * recuperado do localStorage para as rotas autenticadas do backend.
 * 
 * @param {boolean} [includeAuth=true] - Define se o token JWT deve ser anexado ao cabeçalho.
 * @param {Object} [customHeaders={}] - Outros cabeçalhos específicos a serem fundidos.
 * @returns {Object} O objeto de cabeçalhos configurados.
 * 
 * @futuras-melhorias
 * - Implementar reautenticação automática injetando cabeçalhos de confirmação (Sudo Mode) de forma controlada.
 */
const getHeaders = (includeAuth = true, customHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (includeAuth) {
    const token = localStorage.getItem('brms_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Cliente de requisição HTTP (HTTP Client) baseado em Fetch API.
 * 
 * Abstrai e encapsula chamadas assíncronas aos verbos GET, POST, PUT, DELETE,
 * automatizando o mapeamento da URL base e o tratamento unificado das respostas.
 */
export const apiClient = {
  /**
   * Realiza requisições do tipo GET.
   * 
   * @param {string} endpoint - O endpoint da API (ex: /api/data).
   * @param {boolean} [includeAuth=true] - Indica se o token JWT deve ser incluído.
   * @returns {Promise<any>} Dados decodificados da resposta.
   */
  async get(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  },

  /**
   * Realiza requisições do tipo POST.
   * 
   * @param {string} endpoint - O endpoint da API (ex: /api/save).
   * @param {Object} body - O corpo da requisição que será serializado em JSON.
   * @param {boolean} [includeAuth=true] - Indica se o token JWT deve ser incluído.
   * @param {Object} [customHeaders={}] - Cabeçalhos extras (ex: x-admin-confirm-password).
   * @returns {Promise<any>} Dados decodificados da resposta.
   */
  async post(endpoint, body, includeAuth = true, customHeaders = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(includeAuth, customHeaders),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  },

  /**
   * Realiza requisições do tipo PUT para atualização.
   * 
   * @param {string} endpoint - O endpoint da API.
   * @param {Object} body - O corpo de alteração serializado em JSON.
   * @param {boolean} [includeAuth=true] - Indica se o token JWT deve ser incluído.
   * @returns {Promise<any>} Dados decodificados da resposta.
   */
  async put(endpoint, body, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  },

  /**
   * Realiza requisições do tipo DELETE para exclusão.
   * 
   * @param {string} endpoint - O endpoint da API.
   * @param {boolean} [includeAuth=true] - Indica se o token JWT deve ser incluído.
   * @returns {Promise<any>} Dados decodificados da resposta.
   */
  async delete(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  },

  /**
   * Trata as respostas HTTP, convertendo o corpo para JSON e verificando erros HTTP.
   * 
   * Caso a resposta não seja positiva (status fora do range 2xx), lança uma exceção
   * contendo o código de status e a mensagem de erro retornada pelo backend.
   * 
   * @param {Response} response - A resposta nativa retornada pela Fetch API.
   * @returns {Promise<any>} Os dados decodificados ou um objeto vazio.
   * @throws {Object} Objeto de erro contendo status e mensagem em caso de falha.
   * 
   * @futuras-melhorias
   * - Substituir a Fetch API pela biblioteca Axios para obter suporte nativo a interceptadores globais de requisição e resposta.
   * - Adicionar detecção automática de token expirado (status 401 ou 403) para deslogar o usuário ou tentar refresh token.
   * - Implementar controle de retentativas automáticas (retry) em caso de falhas de conexão de rede ou erros 503.
   */
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // Se o erro for de autenticação, podemos disparar um evento global ou retornar erro específico
      const error = data.error || 'Erro na requisição ao servidor';
      throw { status: response.status, message: error };
    }
    
    return data;
  }
};
