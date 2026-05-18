import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Search, Save, AlertCircle, CheckCircle, Database, Trash2 } from 'lucide-react';
import { checkPermission } from '../utils/permissions';

const AssociateModules = ({ systems = [], regras = [], onUpdateSystems, currentUser, onAddAuditEvent, initialSystem }) => {
  const [selectedSystem, setSelectedSystem] = useState(initialSystem || '');

  useEffect(() => {
    if (initialSystem) {
      setSelectedSystem(initialSystem);
    }
  }, [initialSystem]);
  const [modulesInput, setModulesInput] = useState('');
  const [showError, setShowError] = useState('');
  const [showSuccess, setShowSuccess] = useState('');
  const [editingModule, setEditingModule] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);

  const canEdit = checkPermission(currentUser, 'Associar Módulos');

  const selectedSysObj = useMemo(() => {
    return systems.find((s) => s.nome === selectedSystem) || null;
  }, [systems, selectedSystem]);

  const countLinkedRules = (moduleName) => {
    return regras.filter(r => 
      (r.sistema === selectedSystem || r.sistema_associado === selectedSystem) && 
      (r.modulo === moduleName || (r.onde_estou && r.onde_estou.includes(moduleName)))
    ).length;
  };

  const regrasDoModulo = useMemo(() => {
    if (!editingModule || !selectedSystem) return 0;
    return countLinkedRules(editingModule);
  }, [editingModule, selectedSystem, regras]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!canEdit) {
      setShowError('Você não tem permissão para associar módulos.');
      return;
    }
    if (!selectedSystem) {
      setShowError('Por favor, selecione um sistema.');
      return;
    }
    if (!modulesInput.trim()) {
      setShowError('Por favor, insira o nome de pelo menos um módulo.');
      return;
    }

    // Pega os módulos atuais
    const currentModulesStr = selectedSysObj.modulos || '';
    const currentModulesArray = currentModulesStr.split(',').map(m => m.trim()).filter(m => m);
    
    const newModule = modulesInput.trim();
    
    if (currentModulesArray.includes(newModule)) {
      setShowError('Este módulo já está cadastrado neste sistema.');
      return;
    }

    // Adiciona o novo módulo
    const uniqueModules = [...currentModulesArray, newModule];
    const newModulesStr = uniqueModules.join(', ');

    const updatedSystems = systems.map((sys) => {
      if (sys.nome === selectedSystem) {
        return { ...sys, modulos: newModulesStr };
      }
      return sys;
    });

    onUpdateSystems(updatedSystems);

    if (onAddAuditEvent) {
      onAddAuditEvent({
        usuario: currentUser.name,
        regra_id: 'SISTEMA',
        alteracao: `Novo módulo cadastrado no sistema ${selectedSystem}: ${newModule}`,
        status: 'Ajuste',
      });
    }

    setShowSuccess('Módulo cadastrado e associado com sucesso!');
    setModulesInput('');
    setEditingModule(null);
    setIsAddingNew(false);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleEditSelect = (m) => {
    if (!canEdit) return;
    setModulesInput(m);
    setEditingModule(m);
    setIsAddingNew(false);
    setIsEditUnlocked(false);
  };

  const handleClear = () => {
    setModulesInput('');
    setEditingModule(null);
    setIsAddingNew(false);
    setIsEditUnlocked(false);
    setSelectedSystem('');
  };

  const handleCancelEdit = (e) => {
    if (e) e.preventDefault();
    setModulesInput('');
    setEditingModule(null);
    setIsAddingNew(false);
    setIsEditUnlocked(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!canEdit) return;
    if (!modulesInput.trim()) return;

    const currentModulesStr = selectedSysObj.modulos || '';
    let currentModulesArray = currentModulesStr.split(',').map(m => m.trim()).filter(m => m);
    
    const newModule = modulesInput.trim();
    
    if (newModule !== editingModule && currentModulesArray.includes(newModule)) {
      setShowError('Este módulo já está cadastrado neste sistema.');
      return;
    }

    const index = currentModulesArray.indexOf(editingModule);
    if (index !== -1) {
      currentModulesArray[index] = newModule;
    }

    const newModulesStr = currentModulesArray.join(', ');

    const updatedSystems = systems.map((sys) => {
      if (sys.nome === selectedSystem) {
        return { ...sys, modulos: newModulesStr };
      }
      return sys;
    });

    onUpdateSystems(updatedSystems);

    if (onAddAuditEvent) {
      onAddAuditEvent({
        usuario: currentUser.name,
        regra_id: 'SISTEMA',
        alteracao: `Módulo editado no sistema ${selectedSystem}: de "${editingModule}" para "${newModule}"`,
        status: 'Ajuste',
      });
    }

    setShowSuccess('Módulo atualizado com sucesso!');
    setModulesInput('');
    setEditingModule(null);
    setIsAddingNew(false);
    setIsEditUnlocked(false);
    setTimeout(() => setShowSuccess(''), 3000);
  };

  const handleExcluir = (e) => {
    e.preventDefault();
    if (!canEdit || !editingModule) return;

    if (regrasDoModulo > 0) {
      setShowError('Não é possível excluir este módulo pois existem regras associadas e vinculadas a ele.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o módulo "${editingModule}"?`)) {
      const currentModulesArray = (selectedSysObj.modulos || '').split(',').map(m => m.trim()).filter(m => m);
      const filteredModules = currentModulesArray.filter(m => m !== editingModule);
      const newModulesStr = filteredModules.join(', ');

      const updatedSystems = systems.map((sys) => {
        if (sys.nome === selectedSystem) {
          return { ...sys, modulos: newModulesStr };
        }
        return sys;
      });

      onUpdateSystems(updatedSystems);

      if (onAddAuditEvent) {
        onAddAuditEvent({
          usuario: currentUser.name,
          regra_id: 'SISTEMA',
          alteracao: `Módulo removido do sistema ${selectedSystem}: ${editingModule}`,
          status: 'Excluído',
        });
      }

      setShowSuccess(`Módulo "${editingModule}" excluído com sucesso.`);
      setModulesInput('');
      setEditingModule(null);
      setIsAddingNew(false);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  const handleRemoveModule = (moduleToRemove) => {
    if (!canEdit) return;

    if (countLinkedRules(moduleToRemove) > 0) {
      setShowError('Não é possível excluir este módulo pois existem regras associadas e vinculadas a ele.');
      return;
    }

    if (window.confirm(`Tem certeza que deseja remover o módulo "${moduleToRemove}" do sistema "${selectedSystem}"?`)) {
      const currentModulesArray = (selectedSysObj.modulos || '').split(',').map(m => m.trim()).filter(m => m);
      const filteredModules = currentModulesArray.filter(m => m !== moduleToRemove);
      const newModulesStr = filteredModules.join(', ');

      const updatedSystems = systems.map((sys) => {
        if (sys.nome === selectedSystem) {
          return { ...sys, modulos: newModulesStr };
        }
        return sys;
      });

      onUpdateSystems(updatedSystems);

      if (onAddAuditEvent) {
        onAddAuditEvent({
          usuario: currentUser.name,
          regra_id: 'SISTEMA',
          alteracao: `Módulo removido do sistema ${selectedSystem}: ${moduleToRemove}`,
          status: 'Excluído',
        });
      }

      setShowSuccess(`Módulo "${moduleToRemove}" removido com sucesso.`);
      setTimeout(() => setShowSuccess(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-card shadow-card p-8 fade-in border border-gray-100 min-h-[600px] flex flex-col relative">
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-secondary/10 p-3 rounded-xl text-secondary">
            <Layers size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-title tracking-tight text-secondary">
              Cadastro de Módulos do Sistema
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Cadastre um novo módulo individual e associe a um sistema.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Painel de Associação */}
        <div className="md:col-span-1 space-y-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <Database size={16} className="mr-2 text-primary" />
              Sistema Alvo *
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => {
                setSelectedSystem(e.target.value);
                setModulesInput('');
                setEditingModule(null);
                setIsAddingNew(false);
                setIsEditUnlocked(false);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all bg-white"
            >
              <option value="">Selecione um sistema...</option>
              {systems.map((sys, idx) => (
                <option key={idx} value={sys.nome}>
                  {sys.nome} {sys.status !== 'Ativo' ? `(${sys.status})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-title flex items-center">
              <Layers size={16} className="mr-2 text-primary" />
              Módulo do sistema
            </label>
            <input
              type="text"
              value={modulesInput}
              onChange={(e) => setModulesInput(e.target.value)}
              disabled={!canEdit || (!isAddingNew && !isEditUnlocked)}
              placeholder={isAddingNew ? "Ex: Portal do Aluno" : editingModule && !isEditUnlocked ? "Clique em 'Editar' para desbloquear" : "Clique em 'Novo' para iniciar"}
              className={`w-full border rounded-lg p-3 text-sm outline-none transition-all ${
                canEdit && (isAddingNew || isEditUnlocked)
                  ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 bg-white'
                  : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            />
          </div>

          {editingModule && (
            <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
              <span className="font-bold flex items-center">
                <Database size={14} className="mr-1.5 text-blue-500" />
                Regras associadas
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                regrasDoModulo > 0 ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-200 text-gray-500 border border-gray-300'
              }`}>
                {regrasDoModulo}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleSave}
              disabled={!selectedSystem || !canEdit || !modulesInput.trim() || editingModule}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg transition-all font-bold shadow-lg ${
                selectedSystem && canEdit && modulesInput.trim() && !editingModule
                  ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20 active:scale-95'
                  : 'bg-gray-200 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
              }`}
            >
              <Save size={18} className="mr-2" />
              Salvar
            </button>
            <div className="flex space-x-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEditingModule(null);
                  setModulesInput('');
                  setIsAddingNew(true);
                  setIsEditUnlocked(false);
                }}
                disabled={!selectedSystem || isAddingNew || !!editingModule}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-bold shadow-md text-sm transition-all ${
                  selectedSystem && !isAddingNew && !editingModule
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20 active:scale-95'
                    : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed'
                }`}
              >
                Novo
              </button>
              {editingModule ? (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all active:scale-95 text-sm shadow-sm"
                >
                  Cancelar
                </button>
              ) : (
                <button
                  onClick={handleClear}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 text-gray-500 rounded-lg font-bold hover:bg-gray-50 transition-all active:scale-95 text-sm"
                >
                  Limpar
                </button>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (!isEditUnlocked) {
                    setIsEditUnlocked(true);
                  } else {
                    handleSaveEdit(e);
                  }
                }}
                disabled={!editingModule || (isEditUnlocked && !modulesInput.trim())}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-bold shadow-md text-sm transition-all ${
                  editingModule && (!isEditUnlocked || modulesInput.trim())
                    ? 'bg-primary text-white hover:bg-primary-dark shadow-primary/20 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isEditUnlocked ? 'Confirmar' : 'Editar'}
              </button>
              <button
                onClick={handleExcluir}
                disabled={!editingModule}
                className={`flex-1 flex items-center justify-center px-2 py-2 rounded-lg font-bold shadow-md text-sm transition-all ${
                  editingModule
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-95'
                    : 'bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed'
                }`}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Módulos Atuais */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-lg font-bold text-text-title">
              Módulos Integrados {selectedSystem ? `(${selectedSystem})` : ''}
            </h3>
          </div>
          
          <div className="flex-1 bg-white border border-gray-100 rounded-xl p-6 custom-scrollbar overflow-y-auto max-h-[400px]">
            {!selectedSystem ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                <Search size={32} className="opacity-50" />
                <p>Selecione um sistema ao lado para ver seus módulos.</p>
              </div>
            ) : selectedSysObj && selectedSysObj.modulos ? (
              <div className="flex flex-wrap gap-3">
                {selectedSysObj.modulos.split(',').map((mod, idx) => {
                  const m = mod.trim();
                  if (!m) return null;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => handleEditSelect(m)}
                      className="flex items-center px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg font-medium text-sm shadow-sm group cursor-pointer hover:bg-blue-100 transition-colors"
                      title="Clique para editar este módulo"
                    >
                      <span className="mr-2">{m}</span>
                      {canEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveModule(m);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-red-500 transition-all p-0.5 rounded-full hover:bg-white"
                          title="Remover módulo"
                        >
                          <AlertCircle size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Este sistema ainda não possui módulos associados.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Erro */}
      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Atenção</h3>
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
        <div className="absolute bottom-4 right-4 bg-green-50 text-green-700 px-6 py-4 rounded-xl border border-green-200 flex items-center shadow-2xl animate-fade-in z-50">
          <CheckCircle size={24} className="mr-3 text-green-500" />
          <span className="font-bold">{showSuccess}</span>
        </div>
      )}
    </div>
  );
};

export default AssociateModules;
