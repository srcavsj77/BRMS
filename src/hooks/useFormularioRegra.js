import { useState, useEffect } from 'react';
import { sanitizeSQL } from '../utils/security';

/**
 * Hook customizado para gerenciar o estado e a lógica do formulário de criação/edição de regras.
 *
 * @param {Object} dadosIniciais - Dados iniciais para preencher o formulário (em caso de edição).
 * @param {boolean} ehEdicao - Define se o formulário está em modo de edição.
 * @param {Array} sistemas - Lista de sistemas disponíveis para associação.
 * @returns {Object} Estado e funções de manipulação do formulário.
 */
export const useFormularioRegra = (dadosIniciais, ehEdicao, sistemas = []) => {
  const obterDataHoraAtual = () => {
    const d = new Date();
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' ' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0')
    );
  };

  const criarEstadoInicial = () => ({
    id: 'RULE-' + Math.floor(Math.random() * 10000),
    nome: '',
    descricao_funcional: '',
    categoria: '',
    expressao_logica: '',
    versao: '1.0.0',
    status: 'Ativo',
    vigencia_inicio: '',
    vigencia_fim: '',
    responsavel_funcional: '',
    justificativa_alteracao: '',
    sistema_associado: '',
    onde_estou: '',
    data_criacao: obterDataHoraAtual(),
    data_atualizacao: obterDataHoraAtual(),
  });

  const [dadosFormulario, setDadosFormulario] = useState(criarEstadoInicial());

  const resetarFormulario = () => setDadosFormulario(criarEstadoInicial());

  const [categorias, setCategorias] = useState([
    'Financeiro',
    'Acadêmico',
    'Compliance',
    'Recursos Humanos',
  ]);

  // Efeito para sincronizar categorias e versão baseando-se no sistema selecionado
  useEffect(() => {
    const sistemaSelecionado = sistemas.find((s) => s.nome === dadosFormulario.sistema_associado);

    if (sistemaSelecionado) {
      const modulos = sistemaSelecionado.modulos
        .split(',')
        .map((m) => m.trim())
        .filter((m) => m);

      if (modulos.length > 0) {
        setCategorias(modulos);

        // Se a categoria atual não estiver na nova lista, reseta para a primeira disponível
        if (!modulos.includes(dadosFormulario.categoria)) {
          setDadosFormulario((prev) => ({ ...prev, categoria: modulos[0] }));
        }
      }

      // Sugerir versão se não estiver em modo edição ou se a versão for a padrão
      if (!ehEdicao && (dadosFormulario.versao === '1.0.0' || !dadosFormulario.versao)) {
        setDadosFormulario((prev) => ({ ...prev, versao: sistemaSelecionado.versao }));
      }
    }
  }, [dadosFormulario.sistema_associado, sistemas, ehEdicao]);

  const recarregarDados = (novosDados = null) => {
    const dados = novosDados || dadosIniciais;
    if (ehEdicao && dados) {
      setDadosFormulario({
        id: dados.id_regra || '',
        nome: dados.nome || '',
        descricao_funcional: dados.descricao || '',
        categoria: dados.sistema || '', // Mapeado para sistema no protótipo
        expressao_logica: dados.expressao || '/* Carregando lógica... */',
        versao: dados.versao || '1.0.0',
        status: dados.status || 'Rascunho',
        vigencia_inicio: dados.vigencia_inicio || '',
        vigencia_fim: dados.vigencia_fim || '',
        responsavel_funcional: dados.usuario || '',
        justificativa_alteracao: '',
        sistema_associado: dados.sistema || '',
        onde_estou: 'Lista de Regras / Edição',
        data_criacao: dados.criacao || obterDataHoraAtual(),
        data_atualizacao: dados.modificacao || obterDataHoraAtual(),
      });
    }
  };

  // Efeito para carregar dados iniciais em modo de edição
  useEffect(() => {
    recarregarDados();
  }, [ehEdicao, dadosIniciais]);

  /**
   * Lida com as mudanças nos campos de input, aplicando sanitização.
   * @param {Event} evento - Evento de mudança do input.
   */
  const lidarComMudanca = (evento) => {
    const { name, value } = evento.target;

    // Aplica sanitização contra injeção de código
    const valorSanitizado = sanitizeSQL(value);

    if (valorSanitizado !== value) {
      console.warn(`[Segurança] Tentativa de código malicioso detectada no campo: ${name}`);
    }

    setDadosFormulario((prev) => ({ ...prev, [name]: valorSanitizado }));
  };

  return {
    dadosFormulario,
    categorias,
    lidarComMudanca,
    setDadosFormulario,
    resetarFormulario,
    recarregarDados,
  };
};
