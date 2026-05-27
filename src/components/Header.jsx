import { useState, useEffect, useRef } from 'react';
import { Bell, User, LogOut, Key, Users, ChevronDown, HelpCircle } from 'lucide-react';
import { useWizard } from './Wizard/WizardProvider';
import { tourSteps } from './Wizard/wizardSteps';

const Header = ({
  onNavigate,
  currentUser,
  onLogout,
  onChangePassword,
  onShowProfile,
  onToggleSidebar,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { startWizard } = useWizard();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-[80px] bg-primary flex items-center px-[30px] z-50 text-white shadow-md">
      <button
        data-tour="logo"
        onClick={() => onNavigate && onNavigate('Dashboard')}
        className="flex flex-col items-start min-w-[200px] hover:opacity-80 transition-opacity cursor-pointer group text-left outline-none"
      >
        <span className="text-[36px] font-bold italic tracking-tight leading-none group-hover:translate-x-1 transition-transform">
          BRMS
        </span>
        <span className="text-[12px] font-normal mt-1 leading-none opacity-90">
          Gerenciamento de Regras de Negócios
        </span>
      </button>

      <button
        onClick={onToggleSidebar}
        className="mx-8 p-3 hover:bg-white/10 rounded-xl transition-all active:scale-90 group outline-none"
        title="Ocultar/Exibir Menu Lateral"
      >
        <div className="flex flex-col space-y-[4px]">
          <div className="w-[30px] h-[2px] bg-white group-hover:bg-secondary transition-colors"></div>
          <div className="w-[30px] h-[2px] bg-white group-hover:bg-secondary transition-colors"></div>
          <div className="w-[30px] h-[2px] bg-white group-hover:bg-secondary transition-colors"></div>
        </div>
      </button>

      <div className="flex-1"></div>

      <div className="flex items-center space-x-6">
        <button
          onClick={() => startWizard(tourSteps)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          title="Tour Interativo (Ajuda)"
        >
          <HelpCircle size={24} />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            data-tour="perfil-usuario"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-4 hover:bg-white/5 p-2 rounded-xl transition-all group"
          >
            <div className="text-right">
              <p className="text-[16px] font-bold leading-none group-hover:text-secondary transition-colors">
                {currentUser?.name || 'Usuário'}
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-black mt-1.5 text-right">
                {currentUser?.role}
              </p>
            </div>
            <div
              className={`w-[48px] h-[48px] rounded-full flex items-center justify-center text-white border-2 border-white/20 overflow-hidden shadow-lg transition-all ${isDropdownOpen ? 'ring-4 ring-secondary/30 border-secondary' : 'group-hover:border-white/40'} ${currentUser?.role === 'admin' ? 'bg-secondary' : 'bg-blue-600'}`}
            >
              <User size={24} />
            </div>
            <ChevronDown
              size={16}
              className={`text-white/40 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-secondary' : ''}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl py-3 border border-gray-100 animate-slide-down z-[60]">
              <div className="px-4 py-3 border-b border-gray-50 mb-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Opções de Conta
                </p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onChangePassword && onChangePassword();
                }}
                className="w-full flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-secondary/5 hover:text-secondary transition-all text-left group"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-secondary/10 transition-colors">
                  <Key size={18} className="text-gray-400 group-hover:text-secondary" />
                </div>
                <span className="text-[14px] font-bold">Alterar senha</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onShowProfile && onShowProfile();
                }}
                className="w-full flex items-center space-x-3 px-5 py-3 text-gray-700 hover:bg-secondary/5 hover:text-secondary transition-all text-left group"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-secondary/10 transition-colors">
                  <Users size={18} className="text-gray-400 group-hover:text-secondary" />
                </div>
                <span className="text-[14px] font-bold">Sobre o perfil</span>
              </button>

              <div className="h-[1px] bg-gray-50 my-2 mx-4"></div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout && onLogout();
                }}
                className="w-full flex items-center space-x-3 px-5 py-4 text-red-500 hover:bg-red-50 transition-all text-left group"
              >
                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                  <LogOut size={18} />
                </div>
                <span className="text-[14px] font-black uppercase tracking-tight">
                  Sair do sistema
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
