/**
 * API Client para centralizar chamadas ao backend do BRMS-FGV.
 * Gerencia automaticamente a URL base e os Tokens de Autenticação.
 */

const getBaseUrl = () => {
  // Prioriza o hostname atual para permitir acesso via rede local (IP)
  const host = window.location.hostname || 'localhost';
  return `http://${host}:3333`;
};

const API_BASE_URL = getBaseUrl();

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

export const apiClient = {
  async get(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  },

  async post(endpoint, body, includeAuth = true, customHeaders = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(includeAuth, customHeaders),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  },

  async put(endpoint, body, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(includeAuth),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  },

  async delete(endpoint, includeAuth = true) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(includeAuth),
    });
    return this.handleResponse(response);
  },

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
