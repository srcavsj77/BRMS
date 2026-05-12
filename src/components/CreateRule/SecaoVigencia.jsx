import React from 'react';
import { Calendar, User } from 'lucide-react';

/**
 * Seção de vigência, status e responsabilidade.
 */
const SecaoVigencia = ({ dados, aoMudar }) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4 text-primary border-t pt-8">
        <Calendar size={18} />
        <h3 className="font-bold text-lg">Vigência e Responsabilidade</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Vigência Início</label>
          <input
            name="vigencia_inicio"
            value={dados.vigencia_inicio}
            onChange={aoMudar}
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Vigência Fim</label>
          <input
            name="vigencia_fim"
            value={dados.vigencia_fim}
            onChange={aoMudar}
            type="date"
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Status</label>
          <select
            name="status"
            value={dados.status}
            onChange={aoMudar}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          >
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Em revisão">Em revisão</option>
            <option value="Excluido">Excluido</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Responsável Funcional</label>
          <div className="relative">
            <input
              name="responsavel_funcional"
              value={dados.responsavel_funcional}
              onChange={aoMudar}
              placeholder="Nome ou Matrícula"
              className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            />
            <User size={16} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecaoVigencia;
