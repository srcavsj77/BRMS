import { useState } from 'react';
import {
  Shield,
  ShieldPlus,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  Check,
  X,
  Search,
  Info,
  AlertCircle,
} from 'lucide-react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { ALL_SYSTEM_MENUS, ROLES } from '../utils/permissions';

const ProfileMaintenance = ({ profilesList, onUpdateProfiles, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    description: '',
    status: 'Ativo',
    permissions: [],
  });

  const isAdmin = currentUser?.role === ROLES.ADMIN;

  const handleOpenModal = (profile = null) => {
    if (!isAdmin) return;
    if (profile) {
      setSelectedProfile(profile);
      setFormData({ ...profile });
    } else {
      setSelectedProfile(null);
      setFormData({
        name: '',
        id: '',
        description: '',
        status: 'Ativo',
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (selectedProfile) {
      onUpdateProfiles((prev) => prev.map((p) => (p.id === selectedProfile.id ? formData : p)));
    } else {
      onUpdateProfiles((prev) => [...prev, formData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!isAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir este perfil definitivamente?')) {
      onUpdateProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const toggleStatus = (id) => {
    if (!isAdmin) return;
    onUpdateProfiles((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, status: p.status === 'Ativo' ? 'Inativo' : 'Ativo' };
        }
        return p;
      })
    );
  };

  const togglePermission = (menu) => {
    setFormData((prev) => {
      const perms = prev.permissions.includes(menu)
        ? prev.permissions.filter((p) => p !== menu)
        : [...prev.permissions, menu];
      return { ...prev, permissions: perms };
    });
  };

  const filteredProfiles = profilesList.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-6 animate-fade-in text-left">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">Manutenção de Perfil</h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
              Gestão dinâmica de papéis e permissões do sistema
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-secondary hover:bg-secondary-dark text-white px-4 h-[30px] rounded-lg font-black flex items-center space-x-2 shadow-md shadow-secondary/20 transition-all active:scale-95 text-[12px] uppercase tracking-widest leading-none outline-none"
          >
            <ShieldPlus size={16} />
            <span>Novo Perfil</span>
          </button>
        )}
      </div>

      <Card title="Perfis Cadastrados" icon={Shield}>
        <div className="p-1">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou chave do perfil..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 italic text-gray-400 text-xs uppercase tracking-widest text-left">
                  <th className="pb-4 pl-4 whitespace-nowrap">Perfil</th>
                  <th className="pb-4 whitespace-nowrap">Chave (ID)</th>
                  <th className="pb-4">Descrição</th>
                  <th className="pb-4 whitespace-nowrap">Status</th>
                  <th className="pb-4 pr-4 text-right whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProfiles.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pl-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${p.status === 'Ativo' ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-700">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-xs text-secondary font-bold uppercase whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="py-4 text-sm text-gray-500 max-w-[300px] truncate">
                      {p.description}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          p.status === 'Ativo'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar Perfil"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => toggleStatus(p.id)}
                          className={`p-2 transition-all rounded-lg ${p.status === 'Ativo' ? 'text-gray-400 hover:text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                          title={p.status === 'Ativo' ? 'Inativar (Bloquear)' : 'Reativar'}
                        >
                          {p.status === 'Ativo' ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir Definitivamente"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProfile ? 'Editar Perfil' : 'Novo Perfil'}
        icon={Shield}
      >
        <div className="space-y-6 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Nome do Perfil
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Auditor Externo"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Chave (ID único)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-mono"
                value={formData.id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  })
                }
                placeholder="ex: auditor_ext"
                disabled={!!selectedProfile}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Descrição Funcional
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/20 outline-none transition-all min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as responsabilidades deste perfil..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Permissões de Acesso (Menus)
              </label>
              <span className="text-[10px] text-gray-400 font-medium italic">
                Selecione os itens que estarão visíveis na barra lateral
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[250px] overflow-y-auto grid grid-cols-2 gap-2 custom-scrollbar">
              {ALL_SYSTEM_MENUS.map((menu) => (
                <button
                  key={menu}
                  type="button"
                  onClick={() => togglePermission(menu)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border ${
                    formData.permissions.includes(menu)
                      ? 'bg-secondary text-white border-secondary'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-secondary/30'
                  }`}
                >
                  <span>{menu}</span>
                  {formData.permissions.includes(menu) ? (
                    <Check size={14} />
                  ) : (
                    <X size={14} className="opacity-30" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[12px] text-blue-700 leading-relaxed italic">
              Este perfil estará disponível imediatamente para associação na tela de Gestão de
              Usuários. Perfis inativos não permitem o login de seus usuários.
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 h-[30px] border border-gray-200 text-gray-400 rounded-lg font-black hover:bg-gray-50 transition-all active:scale-95 text-[12px] uppercase tracking-widest leading-none outline-none"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name || !formData.id}
              className={`flex-1 px-6 h-[30px] rounded-lg font-black transition-all active:scale-95 shadow-md text-[12px] uppercase tracking-widest leading-none outline-none ${
                formData.name && formData.id
                  ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary-dark'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileMaintenance;
