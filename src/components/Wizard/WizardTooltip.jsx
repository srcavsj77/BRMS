import React from 'react';
import { useWizard } from './WizardProvider';
import { X, ChevronRight, ChevronLeft, Flag } from 'lucide-react';

const PADDING = 8; // Espaçamento ao redor do elemento de destaque
const TOOLTIP_GAP = 16; // Distância entre o tooltip e o elemento destacado

export const WizardTooltip = () => {
  const { 
    isOpen, 
    currentStep, 
    currentStepIndex, 
    totalSteps, 
    targetRect, 
    nextStep, 
    prevStep, 
    stopWizard 
  } = useWizard();

  if (!isOpen || !currentStep) return null;

  // Calculando as posições se tivermos um alvo válido
  let overlayStyle = {};
  let tooltipStyle = {};

  if (targetRect) {
    // Recorte do overlay usando box-shadow
    overlayStyle = {
      position: 'fixed',
      top: targetRect.top - PADDING,
      left: targetRect.left - PADDING,
      width: targetRect.width + PADDING * 2,
      height: targetRect.height + PADDING * 2,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
      borderRadius: '8px',
      pointerEvents: 'none', // Permite clique no overlay shadow, mas vazado no centro
      zIndex: 9999,
      transition: 'all 0.4s ease-in-out',
    };

    // Posição do Tooltip (preferencialmente embaixo, mas se não couber, em cima ou do lado)
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    
    // Simplificando: sempre em baixo se couber, senão em cima
    if (spaceBelow > 200) {
      tooltipStyle = {
        top: targetRect.bottom + PADDING + TOOLTIP_GAP,
        left: targetRect.left,
      };
    } else if (spaceAbove > 200) {
      tooltipStyle = {
        bottom: window.innerHeight - targetRect.top + PADDING + TOOLTIP_GAP,
        left: targetRect.left,
      };
    } else {
      // Fallback: centraliza na tela
      tooltipStyle = {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }
  } else {
    // Modal centralizado caso não haja target específico
    overlayStyle = {
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      zIndex: 9999,
    };
    tooltipStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <>
      {/* O fundo escuro com o "furo" transparente */}
      <div style={overlayStyle} className="pointer-events-auto"></div>

      {/* O Card do Assistente */}
      <div 
        style={tooltipStyle} 
        className="fixed z-[10000] w-80 bg-white rounded-xl shadow-2xl p-6 animate-fade-in border border-gray-100 flex flex-col"
      >
        <button 
          onClick={stopWizard}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Pular tutorial"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-text-title mb-2 pr-6">
          {currentStep.title}
        </h3>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          {currentStep.content}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs font-semibold text-gray-400">
            Passo {currentStepIndex + 1} de {totalSteps}
          </div>

          <div className="flex space-x-2">
            {currentStepIndex > 0 && (
              <button 
                onClick={prevStep}
                className="flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            
            <button 
              onClick={nextStep}
              className="flex items-center px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              {isLastStep ? (
                <>
                  <Flag size={16} className="mr-2" /> Concluir
                </>
              ) : (
                <>
                  Próximo <ChevronRight size={16} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
