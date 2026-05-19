import React, { useState } from 'react';
import { useFormularioRegra } from '../hooks/useFormularioRegra';
import CabecalhoFormulario from '../components/CreateRule/CabecalhoFormulario';
import SecaoIdentificacao from '../components/CreateRule/SecaoIdentificacao';
import SecaoLogica from '../components/CreateRule/SecaoLogica';
import SecaoVigencia from '../components/CreateRule/SecaoVigencia';
import SecaoHistorico from '../components/CreateRule/SecaoHistorico';
import { CheckCircle, XCircle, Check, ChevronLeft, ChevronRight, Save, Lock, AlertTriangle, X } from 'lucide-react';
import { checkPermission } from '../utils/permissions';

/**
 * Página de Criação/Edição de Regras de Negócio.
 * Refatorada para utilizar um Stepper/Wizard para melhor usabilidade lógica.
 */
const CreateRuleForm = ({
  regras = [],
  initialData,
  isEdit,
  systems = [],
  currentUser,
  onSave,
  onNavigate,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [highestStep, setHighestStep] = useState(isEdit ? 4 : 1);
  const [hasSaved, setHasSaved] = useState(false);
  
  const canSave = isEdit
    ? checkPermission(currentUser, 'Editar regra')
    : checkPermission(currentUser, 'Criar regra');

  const {
    dadosFormulario,
    categorias,
    lidarComMudanca,
    resetarFormulario,
    recarregarDados,
    setDadosFormulario,
  } = useFormularioRegra(initialData, isEdit, systems);

  const handleAtualizarComBackend = async () => {
    try {
      const token = localStorage.getItem('brms_token');
      const response = await fetch(`http://${window.location.hostname}:3333/api/data`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const latestRegras = data.regras || [];
        const currentRule = latestRegras.find((r) => r.id_regra === initialData.id_regra);

        if (currentRule) {
          recarregarDados(currentRule);
          setTimeout(() => alert('Dados atualizados com a versão mais recente do sistema.'), 100);
        } else {
          alert('Esta regra não foi encontrada no banco de dados. Ela pode ter sido excluída.');
        }
      } else {
        alert('Não foi possível obter os dados mais recentes do servidor.');
      }
    } catch (err) {
      console.error('Erro ao buscar regra:', err);
      alert('Erro de conexão ao tentar atualizar os dados.');
    }
  };

  const handleSalvar = () => {
    const nome = dadosFormulario.nome?.trim();
    const sistema = dadosFormulario.sistema_associado;
    const modulo = dadosFormulario.categoria;
    const descricao = dadosFormulario.descricao_funcional?.trim();

    if (!nome || !sistema || !modulo || !descricao) {
      alert('Um ou mais itens encontram-se sem preenchimento.');
      return;
    }

    const nomeNormalizado = nome.toLowerCase();

    const isDuplicate = regras.some(
      (r) => r.nome.trim().toLowerCase() === nomeNormalizado && r.id_regra !== dadosFormulario.id_regra
    );

    if (isDuplicate) {
      setShowError(
        `Já existe uma regra cadastrada com o nome "${dadosFormulario.nome}". O sistema não permite nomes duplicados.`
      );
      return;
    }

    const d = new Date();
    const dataHoraSalvamento =
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0') +
      ' ' +
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0');

    setDadosFormulario((prev) => ({ ...prev, data_atualizacao: dataHoraSalvamento }));

    if (onSave) {
      onSave({ ...dadosFormulario, data_atualizacao: dataHoraSalvamento }, isEdit);
    }

    setHasSaved(true);
    setShowSuccess(true);
  };

  const handleCancelar = () => {
    setShowCancelConfirm(true);
  };

  const steps = [
    { id: 1, title: 'Contexto' },
    { id: 2, title: 'Lógica' },
    { id: 3, title: 'Vigência' },
    { id: 4, title: 'Governança' }
  ];

  const isStepComplete = (id) => {
    switch (id) {
      case 1:
        return !!(dadosFormulario.nome?.trim() && dadosFormulario.sistema_associado && dadosFormulario.categoria);
      case 2:
        return !!dadosFormulario.descricao_funcional?.trim();
      case 3:
        return !!dadosFormulario.vigencia_inicio;
      case 4:
        return hasSaved;
      default:
        return true;
    }
  };

  const getStepColor = (id) => {
    const isReachable = id <= highestStep;
    if (!isReachable) return 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'; // Cinza

    const isComplete = isStepComplete(id);
    const isActive = currentStep === id;

    if (!isComplete) {
      // Amarela (incompleta)
      return isActive 
        ? 'bg-yellow-500 text-white ring-4 ring-yellow-500/20 scale-110 cursor-pointer shadow-md shadow-yellow-500/30' 
        : 'bg-yellow-500 text-white cursor-pointer hover:bg-yellow-600';
    }

    // Azul (completa)
    return isActive 
      ? 'bg-secondary text-white ring-4 ring-secondary/20 scale-110 cursor-pointer shadow-md shadow-secondary/30' 
      : 'bg-secondary text-white cursor-pointer hover:bg-secondary/90';
  };

  return (
    <div className="bg-white rounded-card shadow-card p-8 fade-in mb-10 relative">
      <CabecalhoFormulario
        ehEdicao={isEdit}
        aoSalvar={handleSalvar}
        aoCancelar={handleCancelar}
        aoAtualizar={handleAtualizarComBackend}
        currentUser={currentUser}
      />

      {/* Stepper Visual e Navegável */}
      <div className="flex items-center justify-between mb-12 mt-6 max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isReachable = step.id <= highestStep;
          return (
            <div key={step.id} className="flex flex-col items-center flex-1 relative">
               {index !== steps.length - 1 && (
                  <div className={`absolute top-4 left-1/2 w-full h-[2px] ${step.id < highestStep ? 'bg-secondary' : 'bg-gray-200'}`} />
               )}
               <div 
                  onClick={() => isReachable && setCurrentStep(step.id)}
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${getStepColor(step.id)}`}
               >
                  {isStepComplete(step.id) && step.id !== currentStep ? <Check size={16} strokeWidth={3} /> : step.id}
               </div>
               <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider ${currentStep === step.id ? 'text-secondary' : 'text-gray-400'}`}>
                  {step.title}
               </span>
            </div>
          );
        })}
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <div className="min-h-[300px] animate-fade-in">
          {currentStep === 1 && (
            <SecaoIdentificacao
              dados={dadosFormulario}
              categorias={categorias}
              sistemas={systems}
              aoMudar={lidarComMudanca}
            />
          )}

          {currentStep === 2 && (
            <SecaoLogica dados={dadosFormulario} aoMudar={lidarComMudanca} />
          )}

          {currentStep === 3 && (
            <SecaoVigencia dados={dadosFormulario} aoMudar={lidarComMudanca} />
          )}

          {currentStep === 4 && (
            <SecaoHistorico dados={dadosFormulario} aoMudar={lidarComMudanca} />
          )}
        </div>

        {/* Stepper Navigation */}
        <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${currentStep === 1 ? 'opacity-0 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <ChevronLeft size={16} className="mr-2" /> Anterior
          </button>
          
          <div className="flex space-x-3">
             <button
               type="button"
               onClick={handleCancelar}
               className="flex items-center px-4 py-2.5 text-sm font-bold border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 transition-all active:scale-95"
             >
               <X size={16} className="mr-2" /> Cancelar
             </button>
             {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={() => {
                    const nextStep = Math.min(steps.length, currentStep + 1);
                    setCurrentStep(nextStep);
                    setHighestStep(prev => Math.max(prev, nextStep));
                  }}
                  className="flex items-center px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20 active:scale-95"
                >
                  Próximo <ChevronRight size={16} className="ml-2" />
                </button>
             ) : (
                <button
                  onClick={() => canSave && handleSalvar()}
                  disabled={!canSave}
                  type="button"
                  className={`flex items-center px-8 py-2.5 text-sm font-bold rounded-lg transition-all shadow-lg active:scale-95 ${
                    canSave
                      ? 'bg-secondary text-white hover:bg-secondary/90 shadow-secondary/20'
                      : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none cursor-not-allowed'
                  }`}
                  title={!canSave ? 'Você não possui permissão para salvar alterações.' : ''}
                >
                  {canSave ? <Save size={16} className="mr-2" /> : <Lock size={16} className="mr-2" />}
                  Finalizar e Salvar
                </button>
             )}
          </div>
        </div>
      </form>

      {/* Modal de Sucesso Customizado */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-green-500">
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Sucesso!</h3>
            <p className="text-gray-600 mb-8">
              Registro Salvo com sucesso no ecossistema de regras.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                setHasSaved(false);
                if (!isEdit) resetarFormulario();
                setCurrentStep(1);
                setHighestStep(isEdit ? 4 : 1);
              }}
              className="w-[50%] mx-auto block h-[30px] bg-secondary text-white rounded-lg font-black hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              Ok
            </button>
          </div>
        </div>
      )}

      {/* Modal de Erro/Impedimento Customizado */}
      {showError && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-red-500">
              <XCircle size={64} strokeWidth={1.5} />
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

      {/* Modal de Confirmação de Cancelamento Customizado */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 animate-scale-up text-center border border-gray-100">
            <div className="flex justify-center mb-4 text-orange-500">
              <AlertTriangle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-text-title mb-2">Atenção</h3>
            <p className="text-gray-600 mb-8">Tem certeza que deseja cancelar? Alterações não salvas serão perdidas.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 h-[40px] bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm outline-none"
              >
                Voltar
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  resetarFormulario();
                  setCurrentStep(1);
                }}
                className="flex-1 h-[40px] bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20 text-sm outline-none"
              >
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRuleForm;
