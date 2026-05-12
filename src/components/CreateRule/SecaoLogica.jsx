import React from 'react';
import { Code } from 'lucide-react';

/**
 * Seção de definição da lógica e descrição funcional.
 */
const SecaoLogica = ({ dados, aoMudar }) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4 text-primary border-t pt-8">
        <Code size={18} />
        <h3 className="font-bold text-lg">Lógica e Definição</h3>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">Descrição Funcional</label>
          <textarea
            name="descricao_funcional"
            value={dados.descricao_funcional}
            onChange={aoMudar}
            rows="3"
            placeholder="Descreva detalhadamente o objetivo funcional desta regra..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title flex items-center justify-between">
            Expressão Lógica (DMN / Code)
            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 uppercase tracking-widest">
              Editor Avançado
            </span>
          </label>
          <div className="relative">
            <textarea
              name="expressao_logica"
              value={dados.expressao_logica}
              onChange={aoMudar}
              rows="5"
              placeholder="IF (aluno.nota > 7) AND (aluno.frequencia >= 0.75) THEN elegance = true"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm font-mono text-emerald-400 focus:ring-2 focus:ring-emerald-500/20 outline-none min-h-[120px]"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecaoLogica;
