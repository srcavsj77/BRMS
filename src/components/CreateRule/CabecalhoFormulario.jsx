import React from 'react';
import { Save, X, FileText, Lock, RefreshCw } from 'lucide-react';
import { checkPermission } from '../../utils/permissions';

/**
 * Componente de cabeçalho do formulário com título e botões de ação.
 */
const CabecalhoFormulario = ({ ehEdicao, aoSalvar, aoCancelar, aoAtualizar, currentUser }) => {
  const canSave = ehEdicao
    ? checkPermission(currentUser, 'Editar regra')
    : checkPermission(currentUser, 'Criar regra');

  return (
    <div className="flex items-center justify-between mb-8 border-b pb-4">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <FileText size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-title tracking-tight">
            {ehEdicao ? 'Editar Regra de Negócio' : 'Nova Regra de Negócio'}
          </h2>
          <p className="text-sm text-gray-500">
            {!canSave
              ? 'Visualização em modo de leitura. Alterações não são permitidas para seu perfil.'
              : ehEdicao
                ? 'Altere os dados da regra selecionada abaixo.'
                : 'Preencha os dados abaixo para cadastrar uma nova regra no sistema.'}
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        {ehEdicao && (
          <button
            onClick={aoAtualizar}
            type="button"
            className="flex items-center px-4 py-2 text-sm font-medium border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" /> Atualizar
          </button>
        )}
        <button
          onClick={aoCancelar}
          type="button"
          className="flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={16} className="mr-2" /> Cancelar
        </button>
        <button
          onClick={() => canSave && aoSalvar()}
          disabled={!canSave}
          type="button"
          className={`flex items-center px-6 py-2 text-sm font-bold rounded-lg transition-all shadow-lg ${
            canSave
              ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20'
              : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
          }`}
          title={!canSave ? 'Você não possui permissão para salvar alterações.' : ''}
        >
          {canSave ? <Save size={16} className="mr-2" /> : <Lock size={16} className="mr-2" />}
          Salvar Regra
        </button>
      </div>
    </div>
  );
};

export default CabecalhoFormulario;
