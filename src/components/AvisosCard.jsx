import { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  BellRing,
  Terminal,
  Cpu,
  Hammer,
  Search,
  X,
  Pencil,
} from 'lucide-react';
import Card from './Card';
import Modal from './Modal';
import Pagination from './Pagination';

const AvisosCard = ({ auditData = [] }) => {
  const [localAuditData, setLocalAuditData] = useState(auditData);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const searchRef = useRef(null);

  const [formData, setFormData] = useState({
    regra_id: '',
    usuario: '',
    status: '',
    alteracao: '',
  });

  useEffect(() => {
    setLocalAuditData(auditData);
  }, [auditData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getEventIcon = (status) => {
    switch (status) {
      case 'Versão':
        return <Terminal size={16} />;
      case 'Melhoria':
        return <Hammer size={16} />;
      case 'Ajuste':
        return <Cpu size={16} />;
      case 'Conflito':
        return <ShieldCheck size={16} />;
      case 'Expirada':
        return <ShieldCheck size={16} />;
      default:
        return <ShieldCheck size={16} />;
    }
  };

  const getIconColor = (status) => {
    switch (status) {
      case 'Versão':
        return 'bg-purple-50 text-purple-600';
      case 'Melhoria':
        return 'bg-green-50 text-green-600';
      case 'Ajuste':
        return 'bg-blue-50 text-blue-600';
      case 'Conflito':
        return 'bg-red-50 text-red-500';
      case 'Expirada':
        return 'bg-orange-50 text-orange-500';
      default:
        return 'bg-blue-50 text-secondary';
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const searchLower = value.toLowerCase();
      const newsuggestions = [];

      localAuditData.forEach((item) => {
        if (item.regra_id.toLowerCase().includes(searchLower))
          newsuggestions.push({ text: item.regra_id, category: 'Título/ID' });
        if (item.usuario.toLowerCase().includes(searchLower))
          newsuggestions.push({ text: item.usuario, category: 'Usuário' });
        if (item.data.includes(value)) newsuggestions.push({ text: item.data, category: 'Data' });
        if (item.alteracao.toLowerCase().includes(searchLower)) {
          const idx = item.alteracao.toLowerCase().indexOf(searchLower);
          const snippet = item.alteracao.substring(
            Math.max(0, idx - 10),
            Math.min(item.alteracao.length, idx + 20)
          );
          newsuggestions.push({
            text: `...${snippet}...`,
            category: 'Detalhamento',
            fullText: item.alteracao,
          });
        }
      });

      const uniqueSuggestions = Array.from(new Set(newsuggestions.map((s) => s.text)))
        .map((text) => newsuggestions.find((s) => s.text === text))
        .slice(0, 5);

      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (s) => {
    setSearchTerm(s.category === 'Detalhamento' ? s.fullText : s.text);
    setShowSuggestions(false);
  };

  const filteredAvisos = localAuditData.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.regra_id.toLowerCase().includes(searchLower) ||
      item.usuario.toLowerCase().includes(searchLower) ||
      item.data.includes(searchTerm) ||
      item.alteracao.toLowerCase().includes(searchLower) ||
      item.status.toLowerCase().includes(searchLower)
    );
  });

  const paginatedAvisos = filteredAvisos.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEdit = (aviso, e) => {
    e.stopPropagation();
    setFormData({
      regra_id: aviso.regra_id,
      usuario: aviso.usuario,
      status: aviso.status,
      alteracao: aviso.alteracao,
    });
    setCurrentEditId(aviso.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setLocalAuditData((prev) =>
      prev.map((a) => (a.id === currentEditId ? { ...a, ...formData } : a))
    );
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({ regra_id: '', usuario: '', status: '', alteracao: '' });
  };

  const searchAction = (
    <div className="relative mb-4" ref={searchRef}>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary transition-all">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Pesquisar avisos..."
          className="bg-transparent border-none outline-none text-[14px] w-full"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => searchTerm.length > 1 && setShowSuggestions(true)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="ml-1 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-100 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="py-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex flex-col transition-colors border-b border-gray-50 last:border-none"
                onClick={() => selectSuggestion(s)}
              >
                <span className="text-[14px] text-gray-700 truncate">{s.text}</span>
                <span className="text-[11px] text-secondary font-semibold uppercase tracking-wider">
                  Em {s.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card title="Avisos Automáticos" icon={BellRing} className="bg-accent-light/10">
      {searchAction}
      <div className="min-h-[350px]">
        {paginatedAvisos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Search size={40} className="text-gray-200 mb-2" />
            <p className="text-gray-500 text-center italic">Nenhum resultado para "{searchTerm}"</p>
          </div>
        ) : (
          <ul className="space-y-[15px]">
            {paginatedAvisos.map((aviso) => {
              const isExpanded = expandedId === aviso.id;

              return (
                <li
                  key={aviso.id}
                  className={`border border-gray-100 rounded-[8px] p-3 transition-all duration-200 cursor-pointer relative group animate-fade-in ${
                    isExpanded
                      ? 'bg-white shadow-sm ring-1 ring-secondary/20 border-secondary/30'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleExpand(aviso.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 p-1.5 rounded-full ${getIconColor(aviso.status)}`}>
                        {getEventIcon(aviso.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[14px] font-bold text-text-title">
                          {aviso.regra_id} - {aviso.status}
                        </h4>
                        <p className="text-[12px] text-gray-500">
                          {aviso.data} • {aviso.hora}
                        </p>

                        {!isExpanded && (
                          <p className="text-[13px] text-gray-400 mt-1 truncate max-w-[200px]">
                            {aviso.alteracao}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleEdit(aviso, e)}
                        className="text-gray-300 hover:text-secondary opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Editar Aviso"
                      >
                        <Pencil size={16} />
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                      <div className="grid grid-cols-2 gap-4 text-[13px] mb-3">
                        <div>
                          <span className="font-semibold text-gray-600 block">Usuário:</span>
                          <span className="text-gray-700 capitalize">{aviso.usuario}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-600 block">
                            Tipo de Alteração:
                          </span>
                          <span className="text-gray-700">{aviso.status}</span>
                        </div>
                      </div>
                      <div className="text-[13px]">
                        <span className="font-semibold text-gray-600 block mb-1">
                          Detalhamento:
                        </span>
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-2 rounded">
                          {aviso.alteracao}
                        </p>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredAvisos.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Aviso Automático' : 'Visualizar Aviso'}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Regra ID / Título
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.regra_id}
              onChange={(e) => setFormData({ ...formData, regra_id: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.usuario}
              onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo/Status</label>
            <select
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Melhoria">Melhoria</option>
              <option value="Ajuste">Ajuste</option>
              <option value="Versão">Versão</option>
              <option value="Conflito">Conflito</option>
              <option value="Expirada">Expirada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhamento da Alteração
            </label>
            <textarea
              rows="4"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.alteracao}
              onChange={(e) => setFormData({ ...formData, alteracao: e.target.value })}
            ></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors font-bold"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default AvisosCard;
