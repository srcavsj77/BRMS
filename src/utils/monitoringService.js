/**
 * Detecta conflitos simples entre as regras de negócio carregadas.
 * 
 * Um conflito é definido pela colisão de chaves exclusivas, como regras com 
 * o mesmo nome ou com o mesmo identificador de regra (id_regra).
 * 
 * @param {Array} regras - Vetor contendo a lista de objetos das regras de negócio.
 * @returns {Array} Vetor contendo os conflitos identificados (regra_id, nome, motivo).
 * 
 * @futuras-melhorias
 * - Ampliar a detecção para analisar colisões semânticas (duas regras com nomes diferentes mas com mesma lógica expressa).
 * - Comparar faixas de vigência para identificar se o conflito ocorre simultaneamente no tempo.
 * - Gerar alertas proativos para a área de negócios quando um conflito for detectado.
 */
export const detectarConflitos = (regras) => {
  const conflitos = [];
  const nomesVistos = new Set();
  const idsVistos = new Set();

  regras.forEach((regra) => {
    if (nomesVistos.has(regra.nome) || idsVistos.has(regra.id_regra)) {
      conflitos.push({
        regra_id: regra.id_regra,
        nome: regra.nome,
        motivo: nomesVistos.has(regra.nome) ? 'Nome duplicado detectado' : 'ID de regra duplicado',
      });
    }
    nomesVistos.add(regra.nome);
    idsVistos.add(regra.id_regra);
  });

  return conflitos;
};

/**
 * Verifica se a regra de negócio está expirada em relação à data atual do sistema.
 * 
 * @param {Object} regra - Objeto contendo os dados da regra de negócio (especificamente vigencia_fim).
 * @returns {boolean} Retorna true se a data de fim for inferior à data atual (desconsiderando horas).
 * 
 * @futuras-melhorias
 * - Adicionar tolerância de expiração em dias (ex: regras que expirarão em menos de 5 dias).
 * - Enviar emails de alerta para a equipe de compliance quando a expiração for confirmada.
 */
export const verificarExpiracao = (regra) => {
  if (!regra.vigencia_fim) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataFim = new Date(regra.vigencia_fim);
  return dataFim < hoje;
};
