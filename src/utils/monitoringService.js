/**
 * Detecta conflitos simples entre as regras.
 * Neste protótipo, um conflito é definido por regras com o mesmo nome ou ID.
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
 * Verifica se a regra expirou com base na data atual.
 */
export const verificarExpiracao = (regra) => {
  if (!regra.vigencia_fim) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataFim = new Date(regra.vigencia_fim);
  return dataFim < hoje;
};
