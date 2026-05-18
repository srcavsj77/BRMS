import { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateRule from './pages/CreateRule';
import ListRules from './pages/ListRules';
import AuditChanges from './pages/AuditChanges';
import AuditReports from './pages/AuditReports';
import CreateSystem from './pages/CreateSystem';
import ComplianceDocuments from './pages/ComplianceDocuments';
import Settings from './pages/Settings';
import UsersManagement from './pages/UsersManagement';
import EditSystem from './pages/EditSystem';
import AboutSystem from './pages/AboutSystem';
import Login from './components/Login';
import { calcularNovoStatus } from './utils/regraUtils';
import { detectarConflitos, verificarExpiracao } from './utils/monitoringService';
import {
  checkPermission,
  ROLES,
  DEFAULT_PERMISSIONS,
  ROLE_DESCRIPTIONS,
} from './utils/permissions';
import { Key, Shield, Check, Info } from 'lucide-react';
import Modal from './components/Modal';

import ProfileMaintenance from './pages/ProfileMaintenance';
import { apiClient } from './utils/apiClient';

// Constantes locais removidas (Os dados agora residem e são obtidos do servidor central)

function App() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [editingRule, setEditingRule] = useState(null);
  const [regras, setRegras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventosAuditoria, setEventosAuditoria] = useState([]);
  const [systems, setSystems] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [notices, setNotices] = useState([]);

  const [isServiceRunning, setIsServiceRunning] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('brms_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('brms_token') || null;
  });

  // Persistir sessão e token localmente
  useEffect(() => {
    if (currentUser && authToken) {
      localStorage.setItem('brms_session', JSON.stringify(currentUser));
      localStorage.setItem('brms_token', authToken);
    } else {
      localStorage.removeItem('brms_session');
      localStorage.removeItem('brms_token');
    }
  }, [currentUser, authToken]);

  // Carregar todos os dados da rede (do backend)
  useEffect(() => {
    const fetchData = async () => {
      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.get('/api/data');
        setRegras(data.regras || []);
        setEventosAuditoria(data.eventosAuditoria || []);
        setSystems(data.systems || []);
        setProfilesList(data.profilesList || []);
        setUsersList(data.usersList || []);
        setNotices(data.notices || []);
      } catch (err) {
        console.error('Erro ao buscar dados do servidor central:', err);
        if (err.status === 401 || err.status === 403) {
          if (err.message && err.message.includes('injeção')) {
            alert(err.message);
          } else {
            handleLogout();
          }
        }
      } finally {
        setIsLoaded(true);
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken]);

  // Sincronizar alterações com a rede (backend)
  useEffect(() => {
    if (!isLoaded || !authToken) return;

    const saveData = async () => {
      try {
        await apiClient.post('/api/save', {
          regras,
          eventosAuditoria,
          systems,
          profilesList,
          usersList,
          notices,
        });
      } catch (err) {
        console.error('Erro ao sincronizar dados com o servidor:', err);
        if (err.status === 401 || err.status === 403) {
          if (err.message && err.message.includes('injeção')) {
            alert('Erro ao salvar: ' + err.message);
          } else {
            handleLogout();
          }
        }
      }
    };

    saveData();
  }, [regras, eventosAuditoria, systems, profilesList, usersList, notices, isLoaded, authToken]);

  const handleLogin = (data) => {
    const { user, token } = data;
    setAuthToken(token);
    setCurrentUser(user);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentPage('Home');
    setRegras([]); // Limpar os dados da memória por segurança
    setEventosAuditoria([]);
    setSystems([]);
    setProfilesList([]);
    setUsersList([]);
    setIsLoaded(false);
  };

  const addSystem = (newSystem) => {
    setSystems((prev) => [...prev, newSystem]);
  };

  const handleSaveNewPassword = () => {
    if (!newPassword) return;
    setUsersList((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, password: newPassword } : u))
    );
    alert('Senha alterada com sucesso!');
    setIsPasswordModalOpen(false);
    setNewPassword('');

    addEventoAuditoria({
      usuario: currentUser.name,
      regra_id: 'SISTEMA',
      alteracao: 'Usuário alterou sua senha de acesso.',
      status: 'Ajuste',
    });
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setCurrentPage('Editar regra');
  };

  const handleSaveRule = (novaRegra, isEdit) => {
    const regraFormatada = {
      id_regra: novaRegra.id,
      nome: novaRegra.nome,
      versao: novaRegra.versao,
      descricao: novaRegra.descricao_funcional,
      sistema: novaRegra.sistema_associado,
      usuario: currentUser.name,
      criacao: novaRegra.data_criacao,
      modificacao: isEdit
        ? (function () {
            const d = new Date();
            return (
              d.getFullYear() +
              '-' +
              String(d.getMonth() + 1).padStart(2, '0') +
              '-' +
              String(d.getDate()).padStart(2, '0') +
              ' ' +
              String(d.getHours()).padStart(2, '0') +
              ':' +
              String(d.getMinutes()).padStart(2, '0')
            );
          })()
        : novaRegra.data_atualizacao,
      status: novaRegra.status,
      vigencia_inicio: novaRegra.vigencia_inicio,
      vigencia_fim: novaRegra.vigencia_fim,
      expressao: novaRegra.expressao_logica,
    };

    if (isEdit) {
      setRegras((prev) =>
        prev.map((r) => (r.id_regra === regraFormatada.id_regra ? regraFormatada : r))
      );
      addEventoAuditoria({
        usuario: currentUser.name,
        regra_id: regraFormatada.id_regra,
        alteracao: novaRegra.justificativa_alteracao || `Regra "${regraFormatada.nome}" editada.`,
        status: 'Alterado',
      });
    } else {
      setRegras((prev) => [...prev, regraFormatada]);
      addEventoAuditoria({
        usuario: currentUser.name,
        regra_id: regraFormatada.id_regra,
        alteracao: `Nova regra "${regraFormatada.nome}" criada no sistema.`,
        status: 'Novo',
      });
    }
  };

  const sincronizarRegrasEAuditoria = () => {
    let alteradasCount = 0;
    const novosEventos = [];

    const novasRegras = regras.map((regra) => {
      const novoStatus = calcularNovoStatus(regra);
      const statusMudou = novoStatus !== regra.status;

      if (statusMudou) {
        alteradasCount++;
      }

      if (novoStatus === 'Expirada') {
        const jaTemEvento = eventosAuditoria.some(
          (e) => e.regra_id === regra.id_regra && e.status === 'Expirada'
        );
        if (!jaTemEvento) {
          novosEventos.push({
            id: `exp-${regra.id_regra}-${Date.now()}-${Math.random()}`,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            usuario: 'sistema',
            regra_id: regra.id_regra,
            alteracao: `Vigência encerrada (Fim: ${regra.vigencia_fim}). Status da regra ajustado automaticamente para Expirada.`,
            status: 'Expirada',
          });
        }
      }

      return statusMudou
        ? { ...regra, status: novoStatus, modificacao: new Date().toLocaleDateString('pt-BR') }
        : regra;
    });

    if (alteradasCount > 0) {
      setRegras(novasRegras);
    }

    if (novosEventos.length > 0) {
      setEventosAuditoria((prev) => [...novosEventos, ...prev]);
    }

    return { alteradasCount, novosEventosCount: novosEventos.length };
  };

  const addEventoAuditoria = (evento) => {
    const novoEvento = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...evento,
    };
    setEventosAuditoria((prev) => [novoEvento, ...prev]);
  };

  useEffect(() => {
    if (!isServiceRunning) return;

    const interval = setInterval(() => {
      console.log('Robô de Monitoramento: Verificando regras...');

      const exps = regras.filter((r) => r.status !== 'Expirada' && verificarExpiracao(r));
      if (exps.length > 0) {
        exps.forEach((r) => {
          addEventoAuditoria({
            usuario: 'sistema',
            regra_id: r.id_regra,
            alteracao: `Monitoramento Automático: Regra expirada (Fim: ${r.vigencia_fim}).`,
            status: 'Expirada',
          });
          setRegras((prev) =>
            prev.map((item) =>
              item.id_regra === r.id_regra ? { ...item, status: 'Expirada' } : item
            )
          );
        });
      }

      const conflitos = detectarConflitos(regras);
      conflitos.forEach((c) => {
        const jaAlertado = eventosAuditoria.some(
          (e) =>
            e.regra_id === c.regra_id &&
            e.status === 'Conflito' &&
            e.data === new Date().toLocaleDateString('pt-BR')
        );
        if (!jaAlertado) {
          addEventoAuditoria({
            usuario: 'sistema',
            regra_id: c.regra_id,
            alteracao: `Monitoramento Automático Detectou: ${c.motivo}.`,
            status: 'Conflito',
          });
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [isServiceRunning, regras, eventosAuditoria]);

  // Se não estiver logado, mostra tela de Login
  if (!currentUser) {
    return <Login users={usersList} onLogin={handleLogin} />;
  }

  return (
    <Layout
      onNavigate={(page) => {
        if (page !== 'Editar regra') setEditingRule(null);
        setCurrentPage(page);
      }}
      currentPage={currentPage}
      currentUser={currentUser}
      onLogout={handleLogout}
      profilesList={profilesList}
      onChangePassword={() => setIsPasswordModalOpen(true)}
      onShowProfile={() => setIsProfileDetailOpen(true)}
    >
      {currentPage === 'Home' && (
        <Dashboard
          auditData={eventosAuditoria}
          onAddAuditEvent={addEventoAuditoria}
          systems={systems}
          setSystems={setSystems}
          notices={notices}
          setNotices={setNotices}
        />
      )}
      {currentPage === 'Criar regra' && (
        <CreateRule
          regras={regras}
          systems={systems}
          currentUser={currentUser}
          onSave={handleSaveRule}
        />
      )}
      {currentPage === 'Listar / Editar regras' && (
        <ListRules regras={regras} systems={systems} onEdit={handleEditRule} currentUser={currentUser} />
      )}
      {currentPage === 'Alterações realizadas' && (
        <AuditChanges
          regras={regras}
          auditData={eventosAuditoria}
          onEdit={handleEditRule}
          triggerExpiracao={sincronizarRegrasEAuditoria}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'Dashboard' && <AuditReports regras={regras} />}
      {currentPage === 'Cadastrar sistema' && (
        <CreateSystem systems={systems} onAdd={addSystem} onNavigate={setCurrentPage} currentUser={currentUser} />
      )}
      {currentPage === 'Documentos' && <ComplianceDocuments />}
      {currentPage === 'Monitoramento' && (
        <Settings
          isServiceRunning={isServiceRunning}
          setIsServiceRunning={setIsServiceRunning}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'Usuários' && (
        <UsersManagement
          usersList={usersList}
          onUpdateUsers={setUsersList}
          currentUser={currentUser}
          profilesList={profilesList}
        />
      )}
      {currentPage === 'Manutenção de perfil' && (
        <ProfileMaintenance
          profilesList={profilesList}
          onUpdateProfiles={setProfilesList}
          currentUser={currentUser}
        />
      )}
      {currentPage === 'Sobre o sistema' && <AboutSystem />}
      {currentPage === 'Editar regra' &&
        (editingRule ? (
          <CreateRule
            regras={regras}
            initialData={editingRule}
            isEdit={true}
            systems={systems}
            currentUser={currentUser}
            onSave={handleSaveRule}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <h2 className="text-xl text-gray-500">Selecione uma regra na listagem para editar.</h2>
          </div>
        ))}
      {currentPage === 'Editar sistema' && (
        <EditSystem
          systems={systems}
          regras={regras}
          onUpdateSystems={setSystems}
          currentUser={currentUser}
          onAddAuditEvent={addEventoAuditoria}
        />
      )}
      {currentPage !== 'Dashboard' &&
        currentPage !== 'Criar regra' &&
        currentPage !== 'Listar / Editar regras' &&
        currentPage !== 'Editar regra' &&
        currentPage !== 'Alterações realizadas' &&
        currentPage !== 'Cadastrar sistema' &&
        currentPage !== 'Editar sistema' &&
        currentPage !== 'Documentos' &&
        currentPage !== 'Monitoramento' &&
        currentPage !== 'Sobre o sistema' &&
        currentPage !== 'Home' && (
          <div className="flex items-center justify-center min-h-[400px]">
            <h2 className="text-xl text-gray-500">Página em desenvolvimento: {currentPage}</h2>
          </div>
        )}
      {/* Modal de Alteração de Senha */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Alterar Senha de Acesso"
      >
        <div className="space-y-6 text-left">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start space-x-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Key size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-700">Privacidade e Segurança</p>
              <p className="text-[11px] text-gray-500 italic">
                Sua nova senha deve conter caracteres seguros para proteger o acesso ao BRMS-FGV.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Nova Senha
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Digite sua nova senha..."
              autoFocus
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNewPassword}
              disabled={!newPassword}
              className={`w-[50%] mx-auto block px-6 h-[30px] rounded-lg font-black transition-all active:scale-95 shadow-md text-[13px] uppercase tracking-widest leading-none ${
                newPassword
                  ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Salvar Nova Senha
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Sobre o Perfil (Read-only) */}
      <Modal
        isOpen={isProfileDetailOpen}
        onClose={() => setIsProfileDetailOpen(false)}
        title="Informações do Perfil"
        icon={Shield}
      >
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nome do Perfil
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 font-bold">
                {profilesList.find((p) => p.id === currentUser?.role)?.name ||
                  'Perfil Personalizado'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Chave (ID único)
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-mono text-secondary font-bold uppercase">
                {currentUser?.role}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Descrição Funcional
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl min-h-[80px] text-gray-600 italic leading-relaxed">
              {profilesList.find((p) => p.id === currentUser?.role)?.description ||
                'Este perfil possui permissões personalizadas pelo administrador.'}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Permissões de Acesso (Menus)
              </label>
              <span className="text-[10px] text-gray-400 font-medium italic">
                Itens visíveis na barra lateral
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[200px] overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
              {(profilesList.find((p) => p.id === currentUser?.role)?.permissions || []).map(
                (menu) => (
                  <div
                    key={menu}
                    className="flex items-center justify-between p-2 rounded-lg text-xs font-bold bg-secondary text-white border border-secondary"
                  >
                    <span>{menu}</span>
                    <Check size={14} />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[12px] text-blue-700 leading-relaxed italic">
              Este perfil está ativo e suas permissões são gerenciadas pelo administrador do sistema
              no módulo de Controle de Acesso.
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setIsProfileDetailOpen(false)}
              className="w-[50%] mx-auto block px-6 h-[30px] bg-primary text-white rounded-lg font-black hover:bg-primary-dark transition-all active:scale-95 shadow-md shadow-primary/20 text-[13px] uppercase tracking-widest leading-none outline-none"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
