import { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ArrowRight, Plus, Trash2, Search, X, Pencil } from 'lucide-react';
import Card from './Card';
import Modal from './Modal';
import Pagination from './Pagination';

const SystemCard = ({ onAddEvent }) => {
  const [systems, setSystems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const searchRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
  });

  // Fecha as sugestões ao clicar fora
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

  const fetchSystems = async () => {
    try {
      const response = await fetch('http://localhost:3333/systems');
      if (response.ok) {
        const data = await response.json();
        setSystems(data);
      } else {
        throw new Error('Falha no fetch');
      }
    } catch (err) {
      console.warn('Backend indisponível, usando dados mockados locais para sistemas.');
      setSystems([
        {
          id: 'sys-1',
          name: 'SGC',
          description: 'Sistema de Gestão de Candidatos',
          version: '1.2.0',
        },
        {
          id: 'sys-2',
          name: 'Financeiro',
          description: 'Gestão Financeira Central',
          version: '2.0.5',
        },
        {
          id: 'sys-3',
          name: 'Portal Aluno',
          description: 'Interface do Estudante',
          version: '3.1.0',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const searchLower = value.toLowerCase();
      const newsuggestions = [];

      systems.forEach((sys) => {
        if (sys.name.toLowerCase().includes(searchLower))
          newsuggestions.push({ text: sys.name, category: 'Nome' });
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
    setSearchTerm(s.text);
    setShowSuggestions(false);
  };

  const filteredSystems = systems.filter((sys) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return sys.name.toLowerCase().includes(searchLower);
  });

  const paginatedSystems = filteredSystems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInclude = async (e) => {
    e.preventDefault();

    if (isEditing) {
      const updatedSystem = { ...formData, id: currentEditId };
      setSystems((prev) => prev.map((s) => (s.id === currentEditId ? updatedSystem : s)));

      if (onAddEvent) {
        onAddEvent({
          usuario: 'carlos.junior',
          regra_id: 'SISTEMA',
          alteracao: `Ajuste: Sistema '${updatedSystem.name}' (v${updatedSystem.version}) atualizado no catálogo.`,
          status: 'Ajuste',
        });
      }

      try {
        fetch(`http://localhost:3333/systems/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSystem),
        }).catch(() => console.warn('Atualização persistida localmente.'));
      } catch (err) {
        console.error('Erro ao editar sistema:', err);
      }
    } else {
      const newSystem = { ...formData, id: Date.now().toString() };
      setSystems((prev) => [newSystem, ...prev]);

      if (onAddEvent) {
        onAddEvent({
          usuario: 'carlos.junior',
          regra_id: 'SISTEMA',
          alteracao: `Melhoria: Novo sistema '${newSystem.name}' (v${newSystem.version}) implementado no dashboard.`,
          status: 'Melhoria',
        });
      }

      try {
        fetch('http://localhost:3333/systems', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSystem),
        }).catch(() => console.warn('Inclusão persistida localmente.'));
      } catch (err) {
        console.error('Erro ao incluir sistema:', err);
      }
    }

    closeModal();
  };

  const handleEdit = (system) => {
    setFormData({
      name: system.name,
      description: system.description || '',
      version: system.version || '',
    });
    setCurrentEditId(system.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({ name: '', description: '', version: '' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este sistema da lista?')) return;

    try {
      setSystems((prev) => prev.filter((s) => s.id !== id));
      fetch(`http://localhost:3333/systems/${id}`, {
        method: 'DELETE',
      }).catch(() => console.warn('Exclusora persistida localmente.'));
    } catch (err) {
      console.error('Erro ao excluir sistema:', err);
    }
  };

  const searchUI = (
    <div className="relative mb-4" ref={searchRef}>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary transition-all">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Pesquisar sistemas..."
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
    <Card
      title="Sistemas"
      icon={ThumbsUp}
      action={
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1 text-secondary hover:text-secondary-dark font-semibold text-sm transition-colors"
        >
          <Plus size={16} />
          <span>Incluir</span>
        </button>
      }
    >
      {searchUI}
      <div className="min-h-[350px]">
        {loading ? (
          <p className="text-gray-500 text-center py-10">Carregando...</p>
        ) : paginatedSystems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Search size={40} className="text-gray-200 mb-2" />
            <p className="text-center italic">
              {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum sistema cadastrado.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-[12px]">
            {paginatedSystems.map((sys) => (
              <li
                key={sys.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-100 animate-fade-in"
              >
                <div className="flex-1 pr-4">
                  <h3 className="text-[15px] text-text-title group-hover:text-secondary transition-colors font-bold mb-0.5">
                    {sys.name}
                  </h3>
                  <div className="space-y-0.5">
                    <p className="text-[13px] text-gray-500 leading-tight line-clamp-1">
                      <span className="font-semibold text-gray-600">Descrição:</span>{' '}
                      {sys.description || 'N/A'}
                    </p>
                    <p className="text-[13px] text-gray-500">
                      <span className="font-semibold text-gray-600">Versão:</span>{' '}
                      {sys.version || 'v1.0.0'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(sys);
                    }}
                    className="text-gray-300 hover:text-secondary transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(sys.id);
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 opacity-0 group-hover:opacity-100"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                  <ArrowRight
                    size={18}
                    className="text-gray-300 group-hover:text-secondary transition-colors ml-1"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredSystems.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Sistema' : 'Cadastrar Sistema'}
      >
        <form onSubmit={handleInclude} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Sistema</label>
            <input
              type="text"
              required
              placeholder="Ex: SGC, Financeiro..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              rows="2"
              placeholder="Descreva brevemente o propósito do sistema"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Versão</label>
            <input
              type="text"
              placeholder="Ex: 1.2.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-all font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark shadow-sm hover:shadow transition-all font-semibold text-sm"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Sistema'}
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default SystemCard;
