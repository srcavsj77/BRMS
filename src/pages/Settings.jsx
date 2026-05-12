import {
  Play,
  Square,
  Settings as SettingsIcon,
  AlertCircle,
  Info,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import Card from '../components/Card';
import { checkPermission, ROLES } from '../utils/permissions';

const Settings = ({ isServiceRunning, setIsServiceRunning, currentUser }) => {
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const canControlService = isAdmin; // Only Admin can control the service based on new requirements

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Monitoramento do Sistema
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Gerencie os serviços e parâmetros globais do ecossistema BRMS.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Informações do robô */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Serviço de Avisos Automáticos" icon={ShieldCheck}>
            <div className="p-1">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-800">Robô de Monitoramento</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Este serviço analisa continuamente o repositório de regras para detectar
                    expirações, conflitos de lógica e novas implementações, alimentando o painel de
                    Auditoria.
                  </p>
                </div>
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isServiceRunning ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-red-100 text-red-700'}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${isServiceRunning ? 'bg-green-600' : 'bg-red-600'}`}
                  ></div>
                  <span>{isServiceRunning ? 'Em Execução' : 'Interrompido'}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[14px] font-bold text-gray-700 block mb-1">
                      Status do Serviço
                    </span>
                    <p className="text-[12px] text-gray-500">
                      {canControlService
                        ? 'Você tem permissão para iniciar ou parar o monitoramento.'
                        : 'Permissão restrita para administradores e editores. Somente visualização disponível.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => canControlService && setIsServiceRunning(true)}
                      disabled={!canControlService || isServiceRunning}
                      className={`flex items-center space-x-2 px-5 h-[30px] rounded-lg font-black transition-all text-[12px] leading-none uppercase tracking-widest active:scale-95 ${
                        isServiceRunning
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                          : canControlService
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 active:scale-95'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {!canControlService && <Lock size={14} />}
                      <Play size={16} fill="currentColor" />
                      <span>START</span>
                    </button>

                    <button
                      onClick={() => canControlService && setIsServiceRunning(false)}
                      disabled={!canControlService || !isServiceRunning}
                      className={`flex items-center space-x-2 px-5 h-[30px] rounded-lg font-black transition-all text-[12px] leading-none uppercase tracking-widest active:scale-95 ${
                        !isServiceRunning
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                          : canControlService
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-200 active:scale-95'
                            : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      {!canControlService && <Lock size={14} />}
                      <Square size={16} fill="currentColor" />
                      <span>STOP</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[14px] font-bold text-gray-700 flex items-center">
                  <Info size={16} className="mr-2 text-secondary" />
                  Itens Monitorados:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'Expirada', desc: 'Verifica vigência encerrada' },
                    { label: 'Alterado', desc: 'Monitora edições em regras' },
                    { label: 'Conflito', desc: 'Detecta duplicidades e erros' },
                    { label: 'Novo', desc: 'Registra novas criações' },
                    { label: 'Exclusão', desc: 'Detecta e registra itens excluídos' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col p-3 bg-white border border-gray-100 rounded-lg shadow-sm"
                    >
                      <span className="font-bold text-secondary uppercase text-[12px]">
                        {item.label}
                      </span>
                      <span className="text-gray-500 text-[11px]">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar de Configurações */}
        <div className="space-y-6">
          <Card title="Restrições" icon={AlertCircle}>
            <div className="space-y-4">
              <div className="p-3 bg-accent-light/10 rounded-lg border border-accent/20 text-accent">
                <span className="text-[12px] font-bold uppercase block mb-1">Perfil de Acesso</span>
                <p className="text-[13px] font-medium leading-relaxed">
                  O controle de estado do serviço é exclusivo para perfis com permissão de gestão de
                  sistemas.
                </p>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start space-x-2 italic text-[12px] text-blue-600">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p>
                  Consulte o registro de auditoria para visualizar o histórico de
                  ativação/desativação deste robô.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
