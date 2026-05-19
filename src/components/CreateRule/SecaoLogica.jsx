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
          <label className="text-sm font-bold text-text-title">Descrição Funcional *</label>
          <textarea
            name="descricao_funcional"
            value={dados.descricao_funcional}
            onChange={aoMudar}
            rows="3"
            placeholder="Descreva detalhadamente o objetivo funcional desta regra..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none min-h-[80px]"
          />
        </div>

      </div>
    </section>
  );
};

export default SecaoLogica;
