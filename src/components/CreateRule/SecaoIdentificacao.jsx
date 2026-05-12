import React from 'react';
import { Tag, Info } from 'lucide-react';

/**
 * Seção de identificação básica da regra.
 */
const SecaoIdentificacao = ({ dados, categorias, sistemas, aoMudar }) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4 text-primary">
        <Tag size={18} />
        <h3 className="font-bold text-lg">Identificação e Contexto</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title flex items-center">
            ID da Regra <Info size={14} className="ml-1 text-gray-400" />
          </label>
          <input
            name="id"
            value={dados.id}
            readOnly
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-mono text-secondary outline-none"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-text-title">Nome da Regra *</label>
          <input
            name="nome"
            value={dados.nome}
            onChange={aoMudar}
            placeholder="Ex: Validação de Elegibilidade de Bolsista"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-text-title">Categoria</label>
          <select
            name="categoria"
            value={dados.categoria}
            onChange={aoMudar}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          >
            <option value="">Selecione uma categoria...</option>
            {categorias.map((categoria, index) => (
              <option key={index} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Versão</label>
          <input
            name="versao"
            value={dados.versao}
            onChange={aoMudar}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-bold text-text-title">Sistema associado à regra</label>
          <select
            name="sistema_associado"
            value={dados.sistema_associado}
            onChange={aoMudar}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          >
            <option value="">Selecione o sistema...</option>
            {sistemas.map((sistema, index) => (
              <option key={index} value={sistema.nome}>
                {sistema.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Onde Estou:</label>
          <input
            name="onde_estou"
            value={dados.onde_estou}
            onChange={aoMudar}
            type="text"
            maxLength={100}
            placeholder="Ex: Módulo de Autenticação / Tela de Login"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
          />
        </div>
      </div>
    </section>
  );
};

export default SecaoIdentificacao;
