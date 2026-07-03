import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Settings2,
  Eye,
  Download,
  FileSpreadsheet,
  FileText as PdfIcon,
  Trash2,
  History,
  X,
  Clock,
  CornerUpLeft,
} from 'lucide-react';
import { sanitizeSQL } from '../utils/security';
import { checkPermission } from '../utils/permissions';

const ListRules = ({
  onEdit,
  onDelete,
  regras = [],
  systems = [],
  currentUser,
  historicoRegras = [],
  onRollback,
}) => {
  const [displayResults, setDisplayResults] = useState(regras);
  const [selectedRuleForHistory, setSelectedRuleForHistory] = useState(null);

  const canEdit = checkPermission(currentUser, 'Editar regra');
  const canDelete = checkPermission(currentUser, 'Excluir regra');

  // Atualiza displayResults quando as regras globais mudam (ex: após expiração na Auditoria)
  useEffect(() => {
    setDisplayResults(regras);
  }, [regras]);

  const prefsKey = `brms_columns_prefs_${currentUser?.name}`;
  
  const allColumns = [
    { id: 'id', label: 'ID' },
    { id: 'nome', label: 'Nome da Regra' },
    { id: 'versao', label: 'Versão' },
    { id: 'descricao', label: 'Descrição Funcional' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'categoria', label: 'Módulo do Sistema' },
    { id: 'usuario', label: 'Usuário' },
    { id: 'criacao', label: 'Data de Criação' },
    { id: 'modificacao', label: 'Data de Modificação' },
    { id: 'status', label: 'Status' },
    { id: 'acoes', label: 'Ações' },
  ];

  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(prefsKey);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return allColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {});
  });

  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const columnDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(prefsKey, JSON.stringify(visibleColumns));
  }, [visibleColumns, prefsKey]);

  const [filters, setFilters] = useState({
    id_regra: '',
    nome_regra: '',
    vigencia_inicio: '',
    vigencia_fim: '',
    status: '',
    sistema: '',
    categoria: '',
  });

  const modulosDisponiveis = useMemo(() => {
    if (!filters.sistema) return [];
    const sys = systems.find(s => s.nome === filters.sistema);
    if (!sys || !sys.modulos) return [];
    return sys.modulos.split(',').map(m => m.trim()).filter(Boolean);
  }, [filters.sistema, systems]);

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
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) setShowColumnDropdown(false);
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) setShowExportDropdown(false);
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

    // Se mudar o sistema, limpa o módulo selecionado
    if (name === 'sistema') {
      setFilters((prev) => ({ ...prev, sistema: sanitizedValue, categoria: '' }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: sanitizedValue }));
    }
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
      const matchSistema = !filters.sistema || item.sistema === filters.sistema;
      const matchCategoria = !filters.categoria || item.categoria === filters.categoria;

      return matchId && matchNome && matchStart && matchEnd && matchStatus && matchSistema && matchCategoria;
    });

    setDisplayResults(filtered);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    const exportColumns = allColumns.filter(c => visibleColumns[c.id] && c.id !== 'acoes');
    
    // Configurando as linhas de cabeçalho do relatório (metadados)
    const reportTitle = '"Relatório de Regras de Negócio - BRMS"';
    const reportTotal = `"Total de registros: ${displayResults.length}"`;
    const reportDate = `"Gerado em: ${new Date().toLocaleString('pt-BR')}"`;
    const blankLine = '""';

    const headers = exportColumns.map(c => `"${c.label}"`).join(';');
    const rows = displayResults.map(row => {
      return exportColumns.map(c => {
        let val = row[c.id === 'id' ? 'id_regra' : c.id];
        val = val ? String(val).replace(/"/g, '""') : '';
        return `"${val}"`;
      }).join(';');
    });
    
    // Montando o conteúdo final combinando cabeçalho, colunas e dados
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      reportTitle + "\n" + 
      reportTotal + "\n" + 
      reportDate + "\n" + 
      blankLine + "\n" + 
      headers + "\n" + 
      rows.join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "brms_relatorio_regras.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportPDF = () => {
    // Show a loading indicator if needed (optional, keeping it simple)
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    
    script.onload = () => {
      const exportColumns = allColumns.filter(c => visibleColumns[c.id] && c.id !== 'acoes');
      const headers = exportColumns.map(c => `<th style="border-bottom: 2px solid #ddd; padding: 10px; text-align: left; background-color: #f4f6f8; color: #333; font-size: 11px; font-family: sans-serif;">${c.label}</th>`).join('');
      
      const rows = displayResults.map(row => {
        return `<tr>` + exportColumns.map(c => {
          let val = row[c.id === 'id' ? 'id_regra' : c.id] || '';
          return `<td style="border-bottom: 1px solid #eee; padding: 10px; text-align: left; font-size: 10px; font-family: sans-serif; color: #555;">${val}</td>`;
        }).join('') + `</tr>`;
      }).join('');

      const content = `
        <div style="padding: 20px;">
          <h1 style="color: #1a365d; font-size: 18px; font-family: sans-serif; margin-bottom: 5px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">Relatório de Regras de Negócio - BRMS</h1>
          <div style="color: #666; font-size: 10px; font-family: sans-serif; margin-bottom: 20px;">
            <p style="margin: 2px 0;"><strong>Total de registros:</strong> ${displayResults.length}</p>
            <p style="margin: 2px 0;"><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;

      const tempElement = document.createElement('div');
      tempElement.innerHTML = content;

      const opt = {
        margin:       10,
        filename:     'brms_relatorio_regras.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      // Generate PDF blob and open in new tab (native browser PDF viewer)
      window.html2pdf().set(opt).from(tempElement).outputPdf('blob').then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
    };
    
    document.body.appendChild(script);
    setShowExportDropdown(false);
  };

  const allColumnsVisible = allColumns.every(col => visibleColumns[col.id]);

  const toggleAllColumns = () => {
    const newValue = !allColumnsVisible;
    const newState = {};
    allColumns.forEach(col => {
      newState[col.id] = newValue;
    });
    setVisibleColumns(newState);
  };

  const handleClear = () => {
    setFilters({
      id_regra: '',
      nome_regra: '',
      vigencia_inicio: '',
      vigencia_fim: '',
      status: '',
      sistema: '',
      categoria: '',
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
          <div className="flex flex-wrap items-start gap-6">
            {/* ID da Regra with Autocomplete */}
            <div className="w-36 space-y-2 relative" ref={idRef}>
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
            <div className="w-[350px] space-y-2 relative" ref={nomeRef}>
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

            <div className="w-48 space-y-2">
              <label className="text-sm font-bold text-text-title">Sistema:</label>
              <select
                name="sistema"
                value={filters.sistema || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 bg-white"
              >
                <option value="">Todos</option>
                {systems.map((sys, idx) => (
                  <option key={idx} value={sys.nome}>{sys.nome}</option>
                ))}
              </select>
            </div>

            {/* Módulo do Sistema */}
            <div className="w-48 space-y-2">
              <label className="text-sm font-bold text-text-title">Módulo:</label>
              <select
                name="categoria"
                value={filters.categoria || ''}
                onChange={handleChange}
                disabled={!filters.sistema}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all ${
                  filters.sistema 
                    ? 'border-gray-300 focus:ring-2 focus:ring-secondary/20 bg-white text-gray-600' 
                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <option value="">{filters.sistema ? 'Todos' : 'Selecione o Sistema...'}</option>
                {modulosDisponiveis.map((mod, idx) => (
                  <option key={idx} value={mod}>{mod}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-6 text-sm">
            <div className="space-y-2">
              <label className="text-sm font-bold text-text-title">Vigência (Período):</label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  name="vigencia_inicio"
                  value={filters.vigencia_inicio}
                  onChange={handleChange}
                  className="w-36 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600"
                />
                <span className="text-gray-400">até</span>
                <input
                  type="date"
                  name="vigencia_fim"
                  value={filters.vigencia_fim}
                  onChange={handleChange}
                  className="w-36 border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600"
                />
              </div>
            </div>

            <div className="w-72 space-y-2">
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

            <div className="flex space-x-3 lg:ml-8">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center px-6 h-[42px] bg-secondary text-white rounded-lg font-black text-[12px] hover:bg-secondary/90 transition-all shadow-md shadow-secondary/10 active:scale-95 uppercase tracking-widest leading-none outline-none"
              >
                <Search size={16} className="mr-2" /> Consultar
              </button>
              <button
                onClick={handleClear}
                className="flex items-center justify-center px-6 h-[42px] border border-gray-300 text-gray-400 rounded-lg text-[12px] font-black hover:bg-gray-50 transition-all hover:border-gray-400 uppercase tracking-widest leading-none outline-none"
              >
                <RotateCcw size={16} className="mr-2" /> Limpar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Resultados */}
      <div className="bg-white rounded-card shadow-card overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50/50 border-b flex items-center justify-between text-secondary relative">
          <div className="flex items-center space-x-2">
            <FileText size={18} />
            <h2 className="font-bold text-lg">Resultado</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <div className="relative" ref={exportDropdownRef}>
              <button 
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center text-xs font-bold bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <Download size={14} className="mr-1.5 text-gray-400" /> Exportar
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center px-2 py-2 mb-1 border-b border-gray-100">
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Opções de Exportação</h3>
                  </div>
                  <button 
                    onClick={exportCSV}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet size={16} className="mr-2 text-green-600" /> Excel (CSV)
                  </button>
                  <button 
                    onClick={exportPDF}
                    className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mt-1"
                  >
                    <PdfIcon size={16} className="mr-2 text-red-600" /> Documento PDF
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={columnDropdownRef}>
              <button 
                onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                className="flex items-center text-xs font-bold bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
              >
                <Settings2 size={14} className="mr-1.5 text-gray-400" /> Colunas
              </button>
              {showColumnDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center px-2 py-2 mb-2 border-b border-gray-100">
                    <Eye size={14} className="text-gray-400 mr-2" />
                    <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Personalizar Exibição</h3>
                  </div>
                  
                  <label className="flex items-center px-2 py-2 mb-1 border-b border-gray-100 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                    <input 
                      type="checkbox" 
                      checked={allColumnsVisible}
                      onChange={toggleAllColumns}
                      className="mr-3 w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary/20"
                    />
                    <span className={`text-sm font-bold transition-colors ${allColumnsVisible ? 'text-gray-700' : 'text-gray-400'}`}>Todos</span>
                  </label>

                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {allColumns.map(col => (
                      <label key={col.id} className="flex items-center px-2 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={visibleColumns[col.id]}
                          onChange={(e) => setVisibleColumns(prev => ({...prev, [col.id]: e.target.checked}))}
                          className="mr-3 w-4 h-4 text-secondary bg-gray-100 border-gray-300 rounded focus:ring-secondary/20"
                        />
                        <span className={`text-sm font-bold transition-colors ${visibleColumns[col.id] ? 'text-gray-700' : 'text-gray-400'}`}>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <span className="text-xs bg-gray-200/50 text-gray-600 px-3 py-1 rounded-full font-medium">
              Total: {displayResults.length} registros
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/80 text-gray-600 text-[11px] uppercase tracking-wider font-bold">
                {visibleColumns.id && <th className="px-6 py-4 whitespace-nowrap">id</th>}
                {visibleColumns.nome && <th className="px-6 py-4">nome da regra</th>}
                {visibleColumns.versao && <th className="px-6 py-4 whitespace-nowrap">Versão</th>}
                {visibleColumns.descricao && <th className="px-6 py-4">descrição funcional</th>}
                {visibleColumns.sistema && <th className="px-6 py-4 whitespace-nowrap">Sistema</th>}
                {visibleColumns.categoria && <th className="px-6 py-4 whitespace-nowrap">Módulo</th>}
                {visibleColumns.usuario && <th className="px-6 py-4 whitespace-nowrap">Usuario</th>}
                {visibleColumns.criacao && <th className="px-6 py-4 text-center whitespace-nowrap">Data de criação</th>}
                {visibleColumns.modificacao && <th className="px-6 py-4 text-center whitespace-nowrap">Data de modificação</th>}
                {visibleColumns.status && <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>}
                {visibleColumns.acoes && <th className="px-6 py-4 text-center whitespace-nowrap">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentItems.map((row, index) => (
                <tr key={index} className="hover:bg-primary/5 transition-colors group">
                  {visibleColumns.id && <td className="px-6 py-4 font-mono text-xs font-bold text-secondary whitespace-nowrap">
                    {row.id_regra}
                  </td>}
                  {visibleColumns.nome && <td className="px-6 py-4 font-bold text-text-title min-w-[200px]">{row.nome}</td>}
                  {visibleColumns.versao && <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-bold border border-gray-200">
                      {row.versao}
                    </span>
                  </td>}
                  {visibleColumns.descricao && <td className="px-6 py-4 text-gray-500 text-xs italic line-clamp-2 max-w-[250px]">
                    {row.descricao}
                  </td>}
                  {visibleColumns.sistema && <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                    {row.sistema}
                  </td>}
                  {visibleColumns.categoria && <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                    {row.categoria || '-'}
                  </td>}
                  {visibleColumns.usuario && <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{row.usuario}</td>}
                  {visibleColumns.criacao && <td className="px-6 py-4 text-center text-gray-500 text-xs whitespace-nowrap">
                    {row.criacao}
                  </td>}
                  {visibleColumns.modificacao && <td className="px-6 py-4 text-center text-gray-500 text-xs whitespace-nowrap">
                    {row.modificacao}
                  </td>}
                  {visibleColumns.status && <td className="px-6 py-4 text-center whitespace-nowrap">
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
                  </td>}
                  {visibleColumns.acoes && <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setSelectedRuleForHistory(row)}
                        className="flex items-center px-3 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm text-primary hover:text-white hover:bg-primary border-primary/20 hover:border-primary"
                        title="Ver histórico de alterações e versionamento"
                      >
                        <History size={14} className="mr-1.5" /> Histórico
                      </button>

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

                      {row.status !== 'Excluída' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente marcar a regra "${row.nome}" como excluída? Esta ação precisa de aprovação na Auditoria.`)) {
                              onDelete && onDelete(row);
                            }
                          }}
                          disabled={!canDelete}
                          className={`flex items-center px-4 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm ${
                            !canDelete
                              ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                              : 'text-red-600 hover:text-white hover:bg-red-600 border-red-200 hover:border-red-600'
                          }`}
                          title={!canDelete ? 'Você não tem permissão para excluir regras.' : 'Marcar regra para exclusão'}
                        >
                          {!canDelete && <Lock size={12} className="mr-1.5" />}
                          <Trash2 size={14} className="mr-1.5" /> Excluir
                        </button>
                      )}
                    </div>
                  </td>}
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

      {/* Modal de Histórico de Versões */}
      {selectedRuleForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-100 flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">Histórico de Alterações</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Visualizando versões de <span className="font-mono text-secondary font-bold">{selectedRuleForHistory.id_regra}</span> — {selectedRuleForHistory.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRuleForHistory(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              {(() => {
                const historyList = historicoRegras
                  .filter((h) => h.id_regra === selectedRuleForHistory.id_regra)
                  .sort((a, b) => new Date(b.data_alteracao) - new Date(a.data_alteracao));

                if (historyList.length === 0) {
                  return (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <History size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-400">Nenhum histórico registrado para esta regra</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Novos registros de histórico serão criados automaticamente a partir do momento em que esta regra for editada ou recriada.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="relative border-l-2 border-gray-200 ml-4 pl-6 space-y-6 py-2">
                    {historyList.map((item, index) => (
                      <div key={item.id_historico} className="relative group">
                        {/* Timeline node */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white bg-secondary ring-4 ring-secondary/15 transition-all group-hover:scale-125 shadow-sm" />

                        {/* Card */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-secondary text-white text-[10px] font-black uppercase tracking-wider rounded border border-secondary shadow-sm shadow-secondary/10">
                                v{item.versao}
                              </span>
                              <span className="text-[11px] text-gray-400 font-bold">
                                {item.data_alteracao}
                              </span>
                              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                Alterado por: {item.usuario}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                item.criticidade === 'Alta'
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : item.criticidade === 'Média'
                                    ? 'bg-orange-50 text-orange-700 border border-orange-100'
                                    : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                                Criticidade: {item.criticidade || 'Média'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Expressão Lógica
                              </p>
                              <pre className="p-3 bg-gray-50 border border-gray-100 rounded-lg font-mono text-[11px] text-secondary font-bold overflow-x-auto">
                                {item.expressao}
                              </pre>
                            </div>

                            {item.descricao && (
                              <div className="text-xs text-gray-500 font-medium">
                                <span className="font-bold text-gray-700">Descrição: </span>
                                {item.descricao}
                              </div>
                            )}

                            {item.justificativa && (
                              <div className="bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100 italic text-xs text-gray-500">
                                <strong>Justificativa: </strong>"{item.justificativa}"
                              </div>
                            )}
                          </div>

                          {/* Rollback button */}
                          {canEdit && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja restaurar a regra para a versão ${item.versao}? Esta ação criará uma nova versão contendo estes mesmos parâmetros.`)) {
                                  onRollback && onRollback(item);
                                  setSelectedRuleForHistory(null);
                                }
                              }}
                              className="md:self-start flex items-center justify-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-md shadow-orange-500/10 uppercase tracking-widest outline-none gap-1.5 shrink-0"
                            >
                              <CornerUpLeft size={14} strokeWidth={2.5} /> Restaurar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setSelectedRuleForHistory(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-200 transition-all uppercase tracking-widest outline-none active:scale-95 border border-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListRules;
