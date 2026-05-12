import { useState, useEffect, useRef } from 'react';
import { Bell, List, Plus, Trash2, Search, X, Pencil } from 'lucide-react';
import Card from './Card';
import Modal from './Modal';
import Pagination from './Pagination';

const NoticiasCard = ({ onAddEvent }) => {
  const [notices, setNotices] = useState([]);
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
    title: '',
    description: '',
    dateTime: new Date().toISOString().slice(0, 16),
    displayUntil: '',
    responsible: 'Usuário Atual',
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

  const fetchNotices = async () => {
    try {
      const response = await fetch('http://localhost:3333/notices');
      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      } else {
        throw new Error('Falha no fetch');
      }
    } catch (err) {
      console.warn('Backend indisponível, usando dados mockados locais.');
      setNotices([
        {
          id: 'mock-1',
          title: 'Regras de Negócio Atualizadas',
          description:
            'As novas regras para o cálculo de impostos de importação já estão ativas na versão 0.1.',
          dateTime: new Date().toISOString(),
          responsible: 'Sistema',
        },
        {
          id: 'mock-2',
          title: 'Manutenção Programada',
          description:
            'O ambiente de homologação passará por manutenção técnica às 23:00h de hoje.',
          dateTime: new Date().toISOString(),
          responsible: 'Infraestrutura',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Reset page when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 1) {
      const searchLower = value.toLowerCase();
      const newsuggestions = [];

      notices.forEach((notice) => {
        if (notice.title.toLowerCase().includes(searchLower))
          newsuggestions.push({ text: notice.title, category: 'Título' });
        if (notice.responsible.toLowerCase().includes(searchLower))
          newsuggestions.push({ text: notice.responsible, category: 'Responsável' });
        if (notice.description.toLowerCase().includes(searchLower)) {
          const idx = notice.description.toLowerCase().indexOf(searchLower);
          const snippet = notice.description.substring(
            Math.max(0, idx - 10),
            Math.min(notice.description.length, idx + 20)
          );
          newsuggestions.push({
            text: `...${snippet}...`,
            category: 'Conteúdo',
            fullText: notice.description,
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
    setSearchTerm(s.category === 'Conteúdo' ? s.fullText : s.text);
    setShowSuggestions(false);
  };

  const filteredNotices = notices.filter((notice) => {
    if (notice.displayUntil) {
      const now = new Date();
      if (now > new Date(notice.displayUntil)) return false;
    }

    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      notice.title.toLowerCase().includes(searchLower) ||
      notice.responsible.toLowerCase().includes(searchLower) ||
      notice.description.toLowerCase().includes(searchLower) ||
      new Date(notice.dateTime).toLocaleDateString('pt-BR').includes(searchTerm)
    );
  });

  const handleInclude = async (e) => {
    e.preventDefault();
    if (formData.description.length > 300) {
      alert('A descrição deve ter no máximo 300 caracteres.');
      return;
    }

    if (isEditing) {
      const updatedNotice = {
        ...formData,
        id: currentEditId,
        dateTime: new Date(formData.dateTime).toISOString(),
      };

      setNotices((prev) => prev.map((n) => (n.id === currentEditId ? updatedNotice : n)));

      if (onAddEvent) {
        onAddEvent({
          usuario: 'carlos.junior',
          regra_id: 'NOTÍCIA',
          alteracao: `Ajuste: Notícia '${updatedNotice.title}' atualizada.`,
          status: 'Ajuste',
        });
      }

      try {
        fetch(`http://localhost:3333/notices/${currentEditId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedNotice),
        }).catch(() => console.warn('Atualização persistida localmente.'));
      } catch (err) {
        console.error('Erro ao atualizar notícia:', err);
      }
    } else {
      const newNotice = {
        id: Date.now().toString(),
        ...formData,
        dateTime: new Date(formData.dateTime).toISOString(),
      };

      setNotices((prev) => [newNotice, ...prev]);

      if (onAddEvent) {
        onAddEvent({
          usuario: 'carlos.junior',
          regra_id: 'NOTÍCIA',
          alteracao: `Melhoria: Nova notícia '${newNotice.title}' publicada.`,
          status: 'Melhoria',
        });
      }

      try {
        fetch('http://localhost:3333/notices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNotice),
        }).catch(() => console.warn('Inclusão persistida localmente.'));
      } catch (err) {
        console.error('Erro ao incluir notícia:', err);
      }
    }

    closeModal();
  };

  const handleEdit = (notice) => {
    setFormData({
      title: notice.title,
      description: notice.description,
      dateTime: new Date(notice.dateTime).toISOString().slice(0, 16),
      displayUntil: notice.displayUntil
        ? new Date(notice.displayUntil).toISOString().slice(0, 16)
        : '',
      responsible: notice.responsible,
    });
    setCurrentEditId(notice.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentEditId(null);
    setFormData({
      title: '',
      description: '',
      dateTime: new Date().toISOString().slice(0, 16),
      displayUntil: '',
      responsible: 'Usuário Atual',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir esta notícia?')) return;

    try {
      setNotices((prev) => prev.filter((n) => n.id !== id));
      fetch(`http://localhost:3333/notices/${id}`, {
        method: 'DELETE',
      }).catch(() => console.warn('Exclusão persistida localmente.'));
    } catch (err) {
      console.error('Erro ao excluir notícia:', err);
    }
  };

  const paginatedNotices = filteredNotices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const searchUI = (
    <div className="relative mb-4" ref={searchRef}>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary transition-all">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Pesquisar notícias..."
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
      title="Notícias FGV"
      icon={Bell}
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
        ) : paginatedNotices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Search size={40} className="text-gray-200 mb-2" />
            <p className="text-center italic">
              {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhuma notícia encontrada.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-[15px]">
            {paginatedNotices.map((notice) => (
              <li
                key={notice.id}
                className="flex items-start space-x-3 group justify-between animate-fade-in"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <List
                    size={18}
                    className="text-notice-icon mt-1 group-hover:text-secondary transition-colors"
                  />
                  <div>
                    <h3 className="text-[16px] font-bold text-text-title group-hover:text-secondary transition-colors line-clamp-1">
                      {notice.title}
                    </h3>
                    <p className="text-[14px] text-gray-500">
                      {new Date(notice.dateTime).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-[13px] text-gray-400 mt-1 line-clamp-2 italic">
                      "{notice.description}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(notice)}
                    className="text-gray-300 hover:text-secondary transition-colors p-1"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredNotices.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Notícia' : 'Incluir Notícia'}
      >
        <form onSubmit={handleInclude} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora da Notícia
            </label>
            <input
              type="datetime-local"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.dateTime}
              onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exibir até:</label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.displayUntil}
              onChange={(e) => setFormData({ ...formData, displayUntil: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (máx 300 caracteres)
              <span
                className={`ml-2 text-xs ${formData.description.length > 300 ? 'text-red-500 font-bold' : 'text-gray-400'}`}
              >
                {formData.description.length}/300
              </span>
            </label>
            <textarea
              rows="4"
              required
              maxLength={320}
              className={`w-full px-3 py-2 border rounded-md outline-none focus:ring-secondary focus:border-secondary ${formData.description.length > 300 ? 'border-red-500' : 'border-gray-300'}`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
            <p className="text-[11px] text-gray-400 mt-1">
              Breve resumo da notícia para exibição rápida.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-secondary focus:border-secondary outline-none"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formData.description.length > 300}
              className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary-dark transition-colors disabled:opacity-50"
            >
              {isEditing ? 'Salvar Alterações' : 'Salvar Notícia'}
            </button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default NoticiasCard;
