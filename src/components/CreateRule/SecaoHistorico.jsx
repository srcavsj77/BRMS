import React from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Seção de histórico, justificativa e auditoria.
 */
const SecaoHistorico = ({ dados, aoMudar }) => {
  return (
    <section>
      <div className="flex items-center space-x-2 mb-4 text-primary border-t pt-8">
        <CheckCircle2 size={18} />
        <h3 className="font-bold text-lg">Histórico e Justificativa</h3>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-text-title">
            Justificativa da Alteração/Criação
          </label>
          <textarea
            name="justificativa_alteracao"
            value={dados.justificativa_alteracao}
            onChange={aoMudar}
            rows="2"
            placeholder="Informe o motivo desta alteração ou criação..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-secondary/10 rounded-xl border border-secondary/20 shadow-inner">
          <div className="flex flex-col space-y-1">
            <span className="text-secondary font-bold uppercase tracking-widest text-[10px]">
              Data de Criação
            </span>
            <span className="text-primary font-mono font-bold text-sm">{dados.data_criacao}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-secondary font-bold uppercase tracking-widest text-[10px]">
              Última Atualização
            </span>
            <span className="text-primary font-mono font-bold text-sm">
              {dados.data_atualizacao}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecaoHistorico;
