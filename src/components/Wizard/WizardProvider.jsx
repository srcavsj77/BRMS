import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const WizardContext = createContext();

export const useWizard = () => useContext(WizardContext);

export const WizardProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [targetRect, setTargetRect] = useState(null);

  const startWizard = (tourSteps) => {
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsOpen(true);
  };

  const stopWizard = () => {
    setIsOpen(false);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      stopWizard();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Update target rect when step changes or window resizes
  const updateRect = useCallback(() => {
    if (!isOpen || !steps[currentStepIndex]) return;
    
    const step = steps[currentStepIndex];
    const element = document.querySelector(step.target);
    
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        bottom: rect.bottom,
        right: rect.right
      });
      
      // Scroll to element smoothly if it's out of view
      if (
        rect.top < 0 ||
        rect.bottom > window.innerHeight
      ) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Recalculate after scroll
        setTimeout(() => {
          const newRect = element.getBoundingClientRect();
          setTargetRect({
            top: newRect.top, left: newRect.left,
            width: newRect.width, height: newRect.height,
            bottom: newRect.bottom, right: newRect.right
          });
        }, 400);
      }
    } else {
      // Se o elemento não existir, avança ou encerra pra não travar
      console.warn(`Elemento ${step.target} não encontrado no Wizard.`);
      setTargetRect(null);
    }
  }, [isOpen, currentStepIndex, steps]);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  const value = {
    isOpen,
    currentStepIndex,
    currentStep: steps[currentStepIndex],
    totalSteps: steps.length,
    targetRect,
    startWizard,
    stopWizard,
    nextStep,
    prevStep
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};
