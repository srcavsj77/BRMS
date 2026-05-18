import React, { useState, useMemo } from 'react';
import { Database, Search, Edit2, Trash2, X, Save, AlertCircle, CheckCircle, Layers } from 'lucide-react';
import { checkPermission } from '../utils/permissions';
import Modal from '../components/Modal';

const EditSystem = ({
  systems,
  regras,
  onUpdateSystems,
  currentUser,
  onAddAuditEvent,
  onNavigate,
  onSelectSystemForModules,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSystem, setEditingSystem] = useState(null);
  const [showError, setShowError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  
  const canEditDelete = checkPermission(currentUser, 'Excluir sistema') || checkPermission(currentUser, 'Cadastrar sistema');

  // Filtra sistemas com base na busca
  const filteredSystems = useMemo(() => {
    return systems.filter(sys => 
      sys.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (sys.descricao && sys.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [systems, searchTerm]);

  // Contabiliza regras por sistema
  const rulesPerSystem = useMemo(() => {
    const counts = {};
    regras.forEach(r => {
      // Regra associada pode vir em r.sistema ou r.sistema_associado dependendo de como foi salvo
      const sysName = r.sistema || r.sistema_associado; 
      if (sysName) {
        counts[sysName] = (counts[sysName] || 0) + 1;
      }
    });
    return counts;
  }, [regras]);

  const handleDelete = (sys) => {
    if (!canEditDelete) {
      setShowError('Você não tem permissão para excluir sistemas.');
      return;
    }

    const count = rulesPerSystem[sys.nome] || 0;
    if (count > 0) {
      setShowError(`Não é possível excluir o sistema "${sys.nome}" pois ele possui ${count} regra(s) associada(s). Remova ou reatribua as regras antes de excluir o sistema.`);
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir permanentemente o sistema "${sys.nome}"?`)) {
      const updatedSystems = systems.filter(s => s.nome !== sys.nome);
      onUpdateSystems(updatedSystems);
      
      if (onAddAuditEvent) {
        onAddAuditEvent({
          usuario: currentUser.name,
          regra_id: 'SISTEMA',
          alteracao: `Sistema excluído do catálogo: ${sys.nome}`,
          status: 'Excluído',
        });
      }
      
      setShowSuccess(`Sistema "${sys.nome}" excluído com sucesso.`);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleEditClick = (sys) => {
    if (!canEditDelete) {
      setShowError('Você não tem permissão para editar sistemas.');
      return;
    }
    setEditingSystem({ ...sys, _originalName: sys.nome });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingSystem.nome.trim()) {
      setShowError("O nome do sistema é obrigatório.");
      return;
    }

    // Verificar se tentou mudar para um nome que já existe
    if (editingSystem.nome !== editingSystem._originalName && systems.some(s => s.nome.trim().toLowerCase() === editingSystem.nome.trim().toLowerCase())) {
      setShowError("Já existe outro sistema com este nome. Não é permitido duplicidade.");
      return;
    }

    const updatedSystems = systems.map(s => {
      if (s.nome === editingSystem._originalName) {
        return {
          nome: editingSystem.nome,
          descricao: editingSystem.descricao,
          versao: editingSystem.versao,
          status: editingSystem.status || 'Ativo'
        };
      }
      return s;
    });

    onUpdateSystems(updatedSystems);

    if (onAddAuditEvent) {
      onAddAuditEvent({
        usuario: currentUser.name,
        regra_id: 'SISTEMA',
        alteracao: `Sistema atualizado: ${editingSystem.nome}`,
        status: 'Ajuste',
      });
    }

    setShowSuccess(`Sistema "${editingSystem.nome}" atualizado com sucesso.`);
    setTimeout(() => setShowSuccess(''), 3000);
    setEditingSystem(null);
  };

  return (
    <div className="bg-white rounded-card shadow-card p-8 fade-in border border-gray-100 min-h-[600px] flex flex-col relative">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <Database size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-title tracking-tight text-primary">
              Consulta / Alteração de Sistemas
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Gerencie os sistemas corporativos e suas integrações.
            </p>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou descrição do sistema..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid de Sistemas */}
      <div className="flex-1 overflow-auto custom-scrollbar border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-widest">
              <th className="p-4 font-bold">Sistema / Versão</th>
              <th className="p-4 font-bold">Descrição</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-center">Regras Associadas</th>
              <th className="p-4 font-bold text-center">Módulos</th>
              <th className="p-4 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredSystems.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-400">
                  Nenhum sistema encontrado com esses critérios.
                </td>
              </tr>
            ) : (
              filteredSystems.map((sys, idx) => {
                const totalRules = rulesPerSystem[sys.nome] || 0;
                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4">
                      <p className="font-bold text-text-title text-sm">{sys.nome}</p>
                      <p className="text-xs text-gray-400 font-medium">{sys.versao || 'v1.0.0'}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600 max-w-[250px] truncate" title={sys.descricao}>
                      {sys.descricao || '-'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        sys.status === 'Ativo' || !sys.status ? 'bg-green-50 text-green-700 border-green-200' :
                        sys.status === 'Em analise' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {sys.status === 'Em analise' ? 'Em análise' : sys.status || 'Ativo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        totalRules > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {totalRules}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (sys.modulos && sys.modulos.split(',').filter(m => m.trim()).length > 0) ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {sys.modulos ? sys.modulos.split(',').filter(m => m.trim()).length : 0}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            if(onSelectSystemForModules) onSelectSystemForModules(sys.nome);
                            if(onNavigate) onNavigate('Associar Módulos');
                          }}
                          className={`p-2 rounded-lg transition-colors text-gray-400 hover:text-indigo-500 hover:bg-indigo-50`}
                          title="Gerenciar Módulos"
                        >
                          <Layers size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(sys)}
                          disabled={!canEditDelete}
                          className={`p-2 rounded-lg transition-colors ${canEditDelete ? 'text-gray-400 hover:text-secondary hover:bg-secondary/10' : 'text-gray-300 cursor-not-allowed'}`}
                          title="Editar sistema"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sys)}
                          disabled={!canEditDelete}
                          className={`p-2 rounded-lg transition-colors ${canEditDelete ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'}`}
                          title="Excluir sistema"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={!!editingSystem}
        onClose={() => setEditingSystem(null)}
        title="Editar Sistema"
      >
        {editingSystem && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome do Sistema</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                value={editingSystem.nome}
                onChange={(e) => setEditingSystem({ ...editingSystem, nome: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Versão</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                value={editingSystem.versao}
                onChange={(e) => setEditingSystem({ ...editingSystem, versao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
              <textarea
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none"
                value={editingSystem.descricao}
                onChange={(e) => setEditingSystem({ ...editingSystem, descricao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                value={editingSystem.status || 'Ativo'}
                onChange={(e) => setEditingSystem({ ...editingSystem, status: e.target.value })}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Em analise">Em análise</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={() => setEditingSystem(null)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark shadow-sm hover:shadow transition-all font-semibold text-sm"
              >
                <Save size={16} className="mr-2" />
                Salvar Alterações
              </button>
            </div>
          </form>
        )}
      </Modal>

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

      {/* Toast de Sucesso */}
      {showSuccess && (
        <div className="absolute bottom-4 right-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg border border-green-200 flex items-center shadow-lg animate-fade-in z-50">
          <CheckCircle size={20} className="mr-2" />
          <span className="text-sm font-bold">{showSuccess}</span>
          <button onClick={() => setShowSuccess('')} className="ml-4 text-green-500 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
};

export default EditSystem;
