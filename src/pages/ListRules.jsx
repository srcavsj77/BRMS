import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCcw,
  Table as TableIcon,
  FileText,
  Filter,
  Edit,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { sanitizeSQL } from '../utils/security';
import { checkPermission } from '../utils/permissions';

const ListRules = ({ onEdit, regras = [], currentUser }) => {
  const [displayResults, setDisplayResults] = useState(regras);

  const canEdit = checkPermission(currentUser, 'Editar regra');

  // Atualiza displayResults quando as regras globais mudam (ex: após expiração na Auditoria)
  useEffect(() => {
    setDisplayResults(regras);
  }, [regras]);
  const [filters, setFilters] = useState({
    id_regra: '',
    nome_regra: '',
    vigencia_inicio: '',
    vigencia_fim: '',
    status: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Suggestions state
  const [idSuggestions, setIdSuggestions] = useState([]);
  const [nomeSuggestions, setNomeSuggestions] = useState([]);
  const [showIdDropdown, setShowIdDropdown] = useState(false);
  const [showNomeDropdown, setShowNomeDropdown] = useState(false);

  // Refs for outside click detection
  const idRef = useRef(null);
  const nomeRef = useRef(null);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (idRef.current && !idRef.current.contains(event.target)) setShowIdDropdown(false);
      if (nomeRef.current && !nomeRef.current.contains(event.target)) setShowNomeDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeSQL(value);

    if (sanitizedValue !== value) {
      console.warn(`[Segurança] SQL Injection bloqueado no campo: ${name}`);
    }

    setFilters((prev) => ({ ...prev, [name]: sanitizedValue }));
    setCurrentPage(1); // Resetar para primeira página ao filtrar

    // Autocomplete Logic
    if (name === 'id_regra') {
      if (sanitizedValue.length > 0) {
        const matches = regras
          .filter((item) => item.id_regra.toLowerCase().includes(sanitizedValue.toLowerCase()))
          .map((item) => item.id_regra);
        setIdSuggestions([...new Set(matches)]);
        setShowIdDropdown(true);
      } else {
        setShowIdDropdown(false);
      }
    }

    if (name === 'nome_regra') {
      if (sanitizedValue.length > 0) {
        const matches = regras
          .filter((item) => item.nome.toLowerCase().includes(sanitizedValue.toLowerCase()))
          .map((item) => item.nome);
        setNomeSuggestions([...new Set(matches)]);
        setShowNomeDropdown(true);
      } else {
        setShowNomeDropdown(false);
      }
    }
  };

  const handleSelectSuggestion = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (name === 'id_regra') setShowIdDropdown(false);
    if (name === 'nome_regra') setShowNomeDropdown(false);
  };

  // Handle Search Filtering
  const handleSearch = () => {
    let filtered = regras.filter((item) => {
      const matchId =
        !filters.id_regra || item.id_regra.toLowerCase().includes(filters.id_regra.toLowerCase());
      const matchNome =
        !filters.nome_regra || item.nome.toLowerCase().includes(filters.nome_regra.toLowerCase());

      // Date filtering logic (simplified for prototype)
      const parseDate = (d) => {
        if (!d) return null;
        const [day, month, year] = d.split('/');
        return new Date(year, month - 1, day).getTime();
      };

      const itemDate = parseDate(item.criacao);
      const start = filters.vigencia_inicio ? new Date(filters.vigencia_inicio).getTime() : null;
      const end = filters.vigencia_fim ? new Date(filters.vigencia_fim).getTime() : null;

      const matchStart = !start || (itemDate && itemDate >= start);
      const matchEnd = !end || (itemDate && itemDate <= end);
      const matchStatus = !filters.status || item.status === filters.status;

      return matchId && matchNome && matchStart && matchEnd && matchStatus;
    });

    setDisplayResults(filtered);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters({
      id_regra: '',
      nome_regra: '',
      vigencia_inicio: '',
      vigencia_fim: '',
      status: '',
    });
    setDisplayResults(regras);
    setCurrentPage(1);
    setShowIdDropdown(false);
    setShowNomeDropdown(false);
  };

  // Lógica de Paginação
  const totalPages = Math.ceil(displayResults.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayResults.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 fade-in pb-10">
      {/* Header da Tela */}
      <div className="flex items-center justify-between bg-white p-6 rounded-card shadow-sm border-l-4 border-primary">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <TableIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-title">Listar Regras de Negócio</h1>
            <p className="text-sm text-gray-500">
              Consulta e listagem das regras cadastradas no ecossistema.
            </p>
          </div>
        </div>
        {!canEdit && (
          <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 font-bold text-xs uppercase tracking-widest shadow-inner">
            <Lock size={14} className="text-gray-400" />
            <span>Modo de Leitura</span>
          </div>
        )}
      </div>

      {/* Seção de Filtros */}
      <div className="bg-white rounded-card shadow-card p-6 border border-gray-100">
        <div className="flex items-center space-x-2 mb-6 text-secondary border-b pb-4">
          <Filter size={18} />
          <h2 className="font-bold text-lg text-primary">Consulta/Alteração Valores Cadastrados</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* ID da Regra with Autocomplete */}
            <div className="space-y-2 relative" ref={idRef}>
              <label className="text-sm font-bold text-text-title flex items-center">
                ID da Regra{' '}
                <div
                  className="ml-1 text-gray-400 cursor-help"
                  title="Identificador único da regra"
                >
                  <RotateCcw size={12} className="rotate-180" />
                </div>
              </label>
              <input
                name="id_regra"
                value={filters.id_regra}
                onChange={handleChange}
                autoComplete="off"
                onFocus={() => filters.id_regra.length > 0 && setShowIdDropdown(true)}
                placeholder="Ex: RULE-1234"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-mono text-secondary bg-gray-50/50"
              />
              {showIdDropdown && idSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {idSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion('id_regra', suggestion)}
                      className="w-full text-left px-4 py-2 text-xs font-mono text-secondary hover:bg-secondary/5 hover:text-secondary transition-colors border-b last:border-0 border-gray-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nome da Regra with Autocomplete */}
            <div className="md:col-span-3 space-y-2 relative" ref={nomeRef}>
              <label className="text-sm font-bold text-text-title">Nome da Regra *</label>
              <input
                name="nome_regra"
                value={filters.nome_regra}
                onChange={handleChange}
                autoComplete="off"
                onFocus={() => filters.nome_regra.length > 0 && setShowNomeDropdown(true)}
                placeholder="Ex: Validação de Elegibilidade de Bolsista"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
              />
              {showNomeDropdown && nomeSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {nomeSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSuggestion('nome_regra', suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors border-b last:border-0 border-gray-50 font-medium"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end text-sm">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-text-title">Vigência (Período):</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  name="vigencia_inicio"
                  value={filters.vigencia_inicio}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600"
                />
                <span className="text-gray-400">até</span>
                <input
                  type="date"
                  name="vigencia_fim"
                  value={filters.vigencia_fim}
                  onChange={handleChange}
                  className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-title">Status:</label>
              <select
                name="status"
                value={filters.status || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 bg-white"
              >
                <option value="">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Pendente">Pendente</option>
                <option value="Excluída">Excluída</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleSearch}
                className="flex-1 flex items-center justify-center px-4 h-[30px] bg-secondary text-white rounded-lg font-black text-[12px] hover:bg-secondary/90 transition-all shadow-md shadow-secondary/10 active:scale-95 uppercase tracking-widest leading-none outline-none"
              >
                <Search size={16} className="mr-2" /> Consultar
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center px-4 h-[30px] border border-gray-300 text-gray-400 rounded-lg text-[12px] font-black hover:bg-gray-50 transition-all hover:border-gray-400 uppercase tracking-widest leading-none outline-none"
              >
                <RotateCcw size={16} className="mr-2" /> Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resultados */}
      <div className="bg-white rounded-card shadow-card overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50/50 border-b flex items-center justify-between text-secondary">
          <div className="flex items-center space-x-2">
            <FileText size={18} />
            <h2 className="font-bold text-lg">Resultado</h2>
          </div>
          <span className="text-xs bg-gray-200/50 text-gray-600 px-3 py-1 rounded-full font-medium">
            Total: {displayResults.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4 whitespace-nowrap">id</th>
                <th className="px-6 py-4">nome</th>
                <th className="px-6 py-4 whitespace-nowrap">Versão</th>
                <th className="px-6 py-4">descrição funcional</th>
                <th className="px-6 py-4 whitespace-nowrap">Sistema</th>
                <th className="px-6 py-4 whitespace-nowrap">Usuario</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Data de criação</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Data de modificação</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentItems.map((row, index) => (
                <tr key={index} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-secondary whitespace-nowrap">
                    {row.id_regra}
                  </td>
                  <td className="px-6 py-4 font-bold text-text-title min-w-[200px]">{row.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold border border-gray-200">
                      {row.versao}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs italic line-clamp-2 max-w-[250px]">
                    {row.descricao}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                    {row.sistema}
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.usuario}</td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs whitespace-nowrap">
                    {row.criacao}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs whitespace-nowrap">
                    {row.modificacao}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        row.status === 'Ativo'
                          ? 'bg-green-100 text-green-700'
                          : row.status === 'Excluída'
                            ? 'bg-red-100 text-red-700'
                            : row.status === 'Expirada'
                              ? 'bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider'
                              : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => onEdit && onEdit(row)}
                        disabled={row.status === 'Excluída' || !canEdit}
                        className={`flex items-center px-4 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm ${
                          row.status === 'Excluída' || !canEdit
                            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            : 'text-secondary hover:text-white hover:bg-secondary border-secondary/20'
                        }`}
                        title={!canEdit ? 'Você não tem permissão para editar regras.' : ''}
                      >
                        {!canEdit && <Lock size={12} className="mr-1.5" />}
                        <Edit size={14} className="mr-1.5" /> Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Navegador de Paginação */}
        <div className="p-4 bg-gray-50 border-t flex flex-col md:flex-row items-center justify-center relative space-y-4 md:space-y-0">
          <div className="md:absolute md:left-6 text-xs text-gray-500 font-medium">
            Exibindo{' '}
            <span className="font-bold">
              {displayResults.length > 0 ? indexOfFirstItem + 1 : 0}
            </span>{' '}
            a <span className="font-bold">{Math.min(indexOfLastItem, displayResults.length)}</span>{' '}
            de <span className="font-bold">{displayResults.length}</span> registros
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border border-gray-300 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'hover:bg-white hover:border-secondary text-secondary shadow-sm'}`}
            >
              <ChevronLeft size={16} />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-bold transition-all border ${
                  currentPage === i + 1
                    ? 'bg-secondary text-white border-secondary shadow-md shadow-secondary/20 scale-105'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-secondary hover:text-secondary'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border border-gray-300 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'hover:bg-white hover:border-secondary text-secondary shadow-sm'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListRules;
