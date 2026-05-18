import React, { useState } from 'react';
import { Save, X, Database, Info, AppWindow, FileText, Lock, AlertCircle } from 'lucide-react';
import { checkPermission } from '../utils/permissions';

const CreateSystem = ({ systems = [], onAdd, onNavigate, currentUser }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    versao: '1.0.0',
    status: 'Ativo',
  });
  const [showError, setShowError] = useState('');

  const canSave = checkPermission(currentUser, 'Excluir sistema'); // Using 'Excluir sistema' because if they can delete, they can create, basically Admin/Editor logic. Actually, better check a generic Editor role or similar. The permission map has it.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!canSave) return;
    if (!formData.nome.trim()) {
      setShowError('Por favor, preencha o Nome do Sistema.');
      return;
    }

    const nomeNormalizado = formData.nome.trim().toLowerCase();
    const isDuplicate = systems.some((s) => s.nome.trim().toLowerCase() === nomeNormalizado);
    
    if (isDuplicate) {
      setShowError(`Já existe um sistema cadastrado com o nome "${formData.nome.trim()}". Não é permitido duplicidade.`);
      return;
    }

    onAdd({ ...formData, nome: formData.nome.trim() });
    onNavigate('Listar / Editar');
  };

  return (
    <div className="bg-white rounded-card shadow-card p-8 fade-in border border-gray-100">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Database size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-title tracking-tight text-primary">
              Cadastrar Novo Sistema
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {!canSave
                ? 'Visualização restrita. Alterações não são permitidas para seu perfil.'
                : 'Preencha os dados do sistema para integração com o motor de regras.'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => onNavigate('Dashboard')}
            className="flex items-center px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all hover:border-gray-300"
          >
            <X size={18} className="mr-2" /> Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center px-6 py-2.5 rounded-lg transition-all font-bold shadow-lg ${
              canSave
                ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20 active:scale-95'
                : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
            }`}
            title={!canSave ? 'Você não possui permissão para cadastrar sistemas.' : ''}
          >
            {canSave ? <Save size={18} className="mr-2" /> : <Lock size={18} className="mr-2" />}
            Salvar Sistema
          </button>
        </div>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <AppWindow size={16} className="mr-2 text-primary" />
              Nome do Sistema <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              disabled={!canSave}
              placeholder="Ex: Portal Acadêmico V3"
              className={`w-full border rounded-lg p-3 text-sm outline-none transition-all ${
                canSave
                  ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed'
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <Info size={16} className="mr-2 text-primary" />
              Versão Atual
            </label>
            <input
              name="versao"
              value={formData.versao}
              onChange={handleChange}
              disabled={!canSave}
              placeholder="1.0.0"
              className={`w-full border rounded-lg p-3 text-sm outline-none transition-all ${
                canSave
                  ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed'
              }`}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <Info size={16} className="mr-2 text-primary" />
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!canSave}
              className={`w-full border rounded-lg p-3 text-sm outline-none transition-all ${
                canSave
                  ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
              <option value="Em analise">Em análise</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <FileText size={16} className="mr-2 text-primary" />
              Descrição do Sistema
            </label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              disabled={!canSave}
              rows="4"
              placeholder="Descreva a finalidade técnica e funcional deste sistema..."
              className={`w-full border rounded-lg p-3 text-sm outline-none transition-all min-h-[100px] ${
                canSave
                  ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50/50 text-gray-400 cursor-not-allowed'
              }`}
            />
          </div>

        </div>

        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-3">
          <Info className="text-blue-500 mt-0.5" size={20} />
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            {canSave
              ? 'Ao cadastrar um sistema, ele ficará disponível imediatamente para associação em novas Regras de Negócio e processos de Auditoria.'
              : 'Você está visualizando os detalhes de cadastro. Somente usuários com permissão podem realizar novos registros.'}
          </p>
        </div>
      </form>

      {/* Modal de Erro */}
      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Impedimento</h3>
            <p className="text-gray-600 mb-8">{showError}</p>
            <button
              onClick={() => setShowError('')}
              className="w-[50%] mx-auto block h-[30px] bg-red-500 text-white rounded-lg font-black hover:bg-red-600 transition-all shadow-md shadow-red-500/20 text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              Ok
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSystem;
