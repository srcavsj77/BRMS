/**
 * Funções utilitárias para manipulação de regras de negócio.
 */

/**
 * Converte uma data no formato string (DD/MM/YYYY ou YYYY-MM-DD) para um objeto Date.
 * 
 * @param {string} dataStr - A data em formato string.
 * @returns {Date|null} Objeto Date correspondente ou null se a string for vazia/inválida.
 * 
 * @futuras-melhorias
 * - Utilizar uma biblioteca consagrada de tratamento de datas (como date-fns ou dayjs) para manipulação de diferentes formatos e fusos horários.
 * - Adicionar validação robusta para evitar objetos Date inválidos ("Invalid Date").
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
 * Verifica se uma regra está expirada com base na sua data de vigência fim.
 * 
 * Compara a data de fim com o momento atual (zerando as horas para ignorar o tempo).
 * 
 * @param {string} dataVigenciaFim - Data de fim de vigência da regra.
 * @returns {boolean} Verdadeiro se a data atual for superior à data limite de vigência.
 * 
 * @futuras-melhorias
 * - Adicionar suporte a fuso horário do servidor/brasília para evitar divergências de datas no cliente.
 * - Permitir agendamento com base em expiração por hora específica, não apenas por dia.
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
 * Calcula e retorna o status atualizado de uma regra de negócio considerando sua expiração.
 * 
 * Caso a regra já esteja excluída ou expirada, mantém o status atual. Do contrário,
 * se a data limite de vigência tiver passado, o status é alterado para "Expirada".
 * 
 * @param {Object} regra - Objeto contendo os dados da regra de negócio (como status e vigencia_fim).
 * @returns {string} O novo status calculado para a regra de negócio.
 * 
 * @futuras-melhorias
 * - Implementar transição automática de status via Worker periódico no backend (ex: cron job diário).
 * - Enviar notificações automáticas aos responsáveis funcionais X dias antes da expiração de uma regra.
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
