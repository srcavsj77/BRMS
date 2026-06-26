import { useState } from 'react';
import {
  UserPlus,
  Users,
  ShieldCheck,
  UserMinus,
  UserX,
  Search,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Key,
  Info,
} from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { ROLE_DESCRIPTIONS, DEFAULT_PERMISSIONS, ROLES } from '../utils/permissions';

const UsersManagement = ({ usersList, onUpdateUsers, currentUser, profilesList = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    status: 'Ativo',
    password: '',
    funcao: '',
  });

  const [isSudoOpen, setIsSudoOpen] = useState(false);
  const [sudoPassword, setSudoPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [sudoError, setSudoError] = useState('');

  const isAdmin = currentUser?.role === ROLES.ADMIN;

  // Encontrar dados do perfil selecionado na lista dinâmica
  const currentProfileData = profilesList.find((p) => p.id === formData.role) ||
    profilesList.find((p) => p.id === 'viewer') || {
      name: 'Indefinido',
      description: 'Perfil não configurado.',
      permissions: [],
    };

  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user = null) => {
    if (!isAdmin) return;
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        password: user.password || '••••••••',
        funcao: user.funcao || '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        status: 'Ativo',
        password: '',
        funcao: '',
      });
    }
    setIsModalOpen(true);
  };

  const isLastAdmin = (id) => {
    const admins = usersList.filter((u) => u.role === ROLES.ADMIN && u.status === 'Ativo');
    return admins.length === 1 && admins[0].id === id;
  };

  const handleSudoConfirm = async (e) => {
    e.preventDefault();
    setSudoError('');
    try {
      const success = await pendingAction(sudoPassword);
      if (success) {
        setIsSudoOpen(false);
        setSudoPassword('');
        setPendingAction(null);
      }
    } catch (err) {
      setSudoError(err.message || 'Erro ao validar confirmação de senha.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    let newUsersList;
    if (selectedUser) {
      if (isLastAdmin(selectedUser.id) && formData.role !== ROLES.ADMIN) {
        alert(
          'Este é o único administrador ativo do sistema. Você não pode alterar o cargo para manter pelo menos um administrador.'
        );
        return;
      }
      newUsersList = usersList.map((u) => (u.id === selectedUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser = {
        id: Date.now(),
        ...formData,
      };
      newUsersList = [...usersList, newUser];
    }

    setPendingAction(() => async (pwd) => {
      const success = await onUpdateUsers(newUsersList, pwd);
      if (success) {
        setIsModalOpen(false);
      }
      return success;
    });
    setIsSudoOpen(true);
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    if (isLastAdmin(id)) {
      alert('Não é possível excluir o último administrador ativo do sistema.');
      return;
    }
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const newUsersList = usersList.filter((u) => u.id !== id);
      setPendingAction(() => async (pwd) => {
        return await onUpdateUsers(newUsersList, pwd);
      });
      setIsSudoOpen(true);
    }
  };

  const toggleBlock = (user) => {
    if (!isAdmin) return;
    if (user.status === 'Ativo' && isLastAdmin(user.id)) {
      alert('Não é possível bloquear o último administrador ativo do sistema.');
      return;
    }
    const newStatus = user.status === 'Ativo' ? 'Bloqueado' : 'Ativo';
    const newUsersList = usersList.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u));
    setPendingAction(() => async (pwd) => {
      return await onUpdateUsers(newUsersList, pwd);
    });
    setIsSudoOpen(true);
  };

  return (
    <div className="py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Gestão de Identidade</h1>
            <p className="text-gray-500 text-sm font-medium">
              Controle de acessos, perfis e segurança da plataforma.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90 text-white px-4 h-[30px] rounded-lg font-black transition-all shadow-md active:scale-95 shadow-secondary/20 text-[12px] uppercase tracking-widest leading-none outline-none"
          >
            <UserPlus size={16} />
            <span>Novo Usuário</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Usuários do Sistema" icon={ShieldCheck}>
          <div className="mb-6 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Pesquisar por nome ou e-mail..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all hover:border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div
              className={`text-[12px] font-bold uppercase tracking-widest ${isAdmin ? 'text-green-600' : 'text-amber-500'}`}
            >
              {isAdmin
                ? 'Painel Administrativo: Acesso Total'
                : 'Painel de Consulta: Somente Leitura'}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-700 uppercase text-[11px] font-bold tracking-wider">
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4 whitespace-nowrap">Função (Cargo)</th>
                  <th className="px-6 py-4 whitespace-nowrap">Perfil / Role</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right whitespace-nowrap">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.role === 'admin' ? 'bg-primary' : 'bg-gray-400'}`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-[14px] font-bold text-gray-800">{user.name}</div>
                          <div className="text-[12px] text-gray-400 flex items-center">
                            <Mail size={12} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[13px] font-medium text-gray-600">
                        {user.funcao || <span className="italic opacity-50">Não informada</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'editor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <Shield size={10} className="mr-1" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.status === 'Ativo' ? (
                          <div className="flex items-center text-green-600 text-[13px] font-medium">
                            <CheckCircle size={14} className="mr-1" /> Ativo
                          </div>
                        ) : (
                          <div className="flex items-center text-red-500 text-[13px] font-medium">
                            <XCircle size={14} className="mr-1" /> Bloqueado
                          </div>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                            title="Editar Usuário"
                          >
                            <Users size={18} />
                          </button>
                          <button
                            onClick={() => toggleBlock(user)}
                            className={`p-2 rounded-lg transition-all ${
                              user.status === 'Ativo'
                                ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-red-500 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={
                              user.status === 'Ativo' ? 'Bloquear Usuário' : 'Desbloquear Usuário'
                            }
                          >
                            {user.status === 'Ativo' ? (
                              <UserX size={18} />
                            ) : (
                              <CheckCircle size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={`p-2 rounded-lg transition-all ${user.id === currentUser.id ? 'opacity-30 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                            title="Excluir Usuário"
                            disabled={user.id === currentUser.id}
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="py-20 text-center text-gray-400 italic">
                Nenhum usuário encontrado para "{searchTerm}".
              </div>
            )}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Configurar Perfil de Usuário' : 'Cadastrar Novo Integrante'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">E-mail Corporativo</label>
              <input
                type="email"
                required
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">
              Função Corporativa (Cargo)
            </label>
            <input
              type="text"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
              value={formData.funcao}
              onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
              placeholder="Ex: Analista de Negócios, Gerente de TI..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Senha de Acesso</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  required={!selectedUser}
                  placeholder={selectedUser ? '•••••••• (Manter atual)' : 'Criar senha inicial'}
                  className="w-full pl-10 border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                  value={formData.password === '••••••••' ? '' : formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Status da Conta</label>
              <select
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Ativo">Ativo</option>
                <option value="Bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>

          <div className="pt-2 text-left">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Perfil e Permissões
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {profilesList
                .filter((p) => p.status === 'Ativo')
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setFormData({ ...formData, role: p.id })}
                    className={`p-4 rounded-xl border-2 transition-all text-left relative flex items-center justify-between ${
                      formData.role === p.id
                        ? 'border-secondary bg-secondary/5 ring-1 ring-secondary/10'
                        : 'border-gray-50 bg-gray-50/50 hover:border-gray-200 cursor-pointer'
                    } ${!isAdmin && formData.role !== p.id ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                  >
                    <div className="flex flex-col">
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${formData.role === p.id ? 'text-secondary' : 'text-gray-400'}`}
                      >
                        Perfil
                      </p>
                      <p
                        className={`text-sm font-black uppercase ${formData.role === p.id ? 'text-secondary' : 'text-gray-700'}`}
                      >
                        {p.name}
                      </p>
                    </div>
                    {formData.role === p.id && (
                      <div className="bg-green-500 text-white p-1 rounded-full shadow-sm animate-scale-up">
                        <CheckCircle size={16} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
            </div>

            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 flex space-x-4 text-left">
              <div className="bg-blue-500/10 p-2 rounded-lg self-start">
                <Info size={20} className="text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-blue-800 text-[13px] font-bold mb-1 uppercase tracking-tight">
                  Escopo do Perfil: {currentProfileData.name}
                </p>
                <p className="text-blue-700/80 text-[12px] leading-relaxed mb-3 italic">
                  {currentProfileData.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentProfileData.permissions.slice(0, 10).map((p) => (
                    <span
                      key={p}
                      className="bg-white/80 text-blue-600 px-2.5 py-1 rounded border border-blue-100 text-[9px] font-extrabold uppercase tracking-widest"
                    >
                      {p}
                    </span>
                  ))}
                  {currentProfileData.permissions.length > 10 && (
                    <span className="text-blue-400 text-[10px] font-bold self-center">
                      +{currentProfileData.permissions.length - 10} adicionais
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t flex justify-center items-center space-x-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="min-w-[160px] h-[36px] px-6 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-all font-black text-[12px] uppercase tracking-widest leading-none shadow-sm active:scale-95 outline-none"
            >
              {isAdmin ? 'Cancelar' : 'Fechar'}
            </button>
            {isAdmin && (
              <button
                type="submit"
                className="min-w-[160px] h-[36px] px-6 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all font-black shadow-md shadow-secondary/20 active:scale-95 text-[12px] uppercase tracking-widest leading-none outline-none"
              >
                {selectedUser ? 'Salvar Perfil' : 'Criar Usuário'}
              </button>
            )}
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação Sudo (Reautenticação) */}
      <Modal
        isOpen={isSudoOpen}
        onClose={() => {
          setIsSudoOpen(false);
          setSudoPassword('');
          setSudoError('');
          setPendingAction(null);
        }}
        title="Confirmação de Segurança"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSudoConfirm} className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Esta operação requer privilégios elevados. Para continuar, insira a sua senha de <strong>Administrador</strong> para confirmar a sua identidade.
          </p>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Senha do Administrador *</label>
            <input
              type="password"
              required
              placeholder="Digite sua senha de acesso"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
              value={sudoPassword}
              onChange={(e) => setSudoPassword(e.target.value)}
            />
          </div>

          {sudoError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 font-medium">
              {sudoError}
            </div>
          )}

          <div className="pt-4 border-t flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsSudoOpen(false);
                setSudoPassword('');
                setSudoError('');
                setPendingAction(null);
              }}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-all font-black text-[12px] uppercase tracking-widest leading-none shadow-sm active:scale-95 outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-black shadow-md active:scale-95 text-[12px] uppercase tracking-widest leading-none outline-none"
            >
              Confirmar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersManagement;
