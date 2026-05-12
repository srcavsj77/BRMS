/**
 * Funções utilitárias para manipulação de regras de negócio.
 */

/**
 * Converte uma data no formato string (DD/MM/YYYY ou YYYY-MM-DD) para um objeto Date.
 * @param {string} dataStr - A data em formato string.
 * @returns {Date|null} Objeto Date ou null se inválido.
 */
export const converterParaData = (dataStr) => {
  if (!dataStr) return null;

  // Se já for YYYY-MM-DD (padrão de inputs date)
  if (dataStr.includes('-')) {
    return new Date(dataStr);
  }

  // Se for DD/MM/YYYY
  const [dia, mes, ano] = dataStr.split('/');
  return new Date(ano, mes - 1, dia);
};

/**
 * Verifica se uma regra está expirada com base na data de vigência fim.
 * @param {string} dataVigenciaFim - Data de fim da vigência.
 * @returns {boolean} Verdadeiro se a data atual for superior à data de fim.
 */
export const estaExpirada = (dataVigenciaFim) => {
  if (!dataVigenciaFim) return false;

  const dataFim = converterParaData(dataVigenciaFim);
  if (!dataFim) return false;

  const agora = new Date();
  agora.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias

  return agora > dataFim;
};

/**
 * Retorna o status atualizado de uma regra com base na expiração.
 * @param {Object} regra - Objeto da regra.
 * @returns {string} O novo status ou o atual se não houver mudança.
 */
export const calcularNovoStatus = (regra) => {
  if (regra.status === 'Excluída' || regra.status === 'Expirada') {
    return regra.status;
  }

  if (estaExpirada(regra.vigencia_fim)) {
    return 'Expirada';
  }

  return regra.status;
};
