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
  Settings2,
  Eye,
  Download,
  FileSpreadsheet,
  FileText as PdfIcon,
  Trash2,
  X,
  Database,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Folder,
  History,
  Upload,
  AlertTriangle,
  Lock,
  CornerUpLeft,
} from 'lucide-react';
import Modal from '../components/Modal';
import { checkPermission } from '../utils/permissions';

const ListProjects = ({
  projetos = [],
  setProjetos,
  regras = [],
  systems = [],
  currentUser,
  historicoProjetos = [],
  setHistoricoProjetos,
  profilesList,
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [displayResults, setDisplayResults] = useState(projetos);

  // Permissões de Acesso (RBAC)
  const canEdit = checkPermission(currentUser, 'Cadastrar', profilesList);
  const canDelete = checkPermission(currentUser, 'Excluir sistema', profilesList);

  // Filtros
  const [filters, setFilters] = useState({
    nome: '',
    sistema: '',
    status: '',
    responsavel: '',
  });

  // Modal de Edição de Projetos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    sistema: '',
    responsavel: '',
    status: 'Em Andamento',
    regras: [],
    justificativa: '',
  });

  // Modal de Especificação do Projeto
  const [selectedProjectForSpec, setSelectedProjectForSpec] = useState(null);
  const [specTab, setSpecTab] = useState('preview'); // 'preview' ou 'markdown'

  // Modal de Histórico de Alterações do Projeto
  const [selectedProjectForHistory, setSelectedProjectForHistory] = useState(null);

  // Modal de Importação de Projetos
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedProjects, setImportedProjects] = useState([]);
  const [importFeedback, setImportFeedback] = useState({ total: 0, valid: 0, conflicts: 0, errors: 0 });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState('');

  // Dropdowns de exportação e colunas
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const exportDropdownRef = useRef(null);
  const columnDropdownRef = useRef(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const prefsKey = `brms_project_columns_prefs_${currentUser?.name}`;

  // Controle de colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem(prefsKey);
    return saved ? JSON.parse(saved) : {
      id: true,
      nome: true,
      sistema: true,
      responsavel: true,
      status: true,
      regras: true,
      documentos: true,
      acoes: true,
    };
  });

  useEffect(() => {
    localStorage.setItem(prefsKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const allColumns = [
    { id: 'id', label: 'ID' },
    { id: 'nome', label: 'Nome do Projeto' },
    { id: 'sistema', label: 'Sistema' },
    { id: 'responsavel', label: 'Responsável' },
    { id: 'status', label: 'Status' },
    { id: 'regras', label: 'Regras Vinculadas' },
    { id: 'documentos', label: 'Documentos' },
    { id: 'acoes', label: 'Ações' },
  ];

  const allColumnsVisible = Object.values(visibleColumns).every(v => v);

  const toggleAllColumns = () => {
    const nextState = !allColumnsVisible;
    setVisibleColumns({
      id: nextState,
      nome: nextState,
      sistema: nextState,
      responsavel: nextState,
      status: nextState,
      regras: nextState,
      documentos: nextState,
      acoes: nextState,
    });
  };

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
      if (columnDropdownRef.current && !columnDropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sincronizar listagem quando a lista de projetos global muda
  useEffect(() => {
    setDisplayResults(projetos);
  }, [projetos]);

  // Aplicar filtros
  const handleSearch = () => {
    const filtered = projetos.filter((proj) => {
      const matchNome = !filters.nome || proj.nome.toLowerCase().includes(filters.nome.toLowerCase()) || (proj.descricao || '').toLowerCase().includes(filters.nome.toLowerCase());
      const matchSistema = !filters.sistema || proj.sistema === filters.sistema;
      const matchStatus = !filters.status || proj.status === filters.status;
      const matchResponsavel = !filters.responsavel || (proj.responsavel || '').toLowerCase().includes(filters.responsavel.toLowerCase());
      return matchNome && matchSistema && matchStatus && matchResponsavel;
    });
    setDisplayResults(filtered);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilters({ nome: '', sistema: '', status: '', responsavel: '' });
    setDisplayResults(projetos);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Modal handlers
  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setFormData({
      nome: proj.nome,
      descricao: proj.descricao || '',
      sistema: proj.sistema || systems[0]?.nome || '',
      responsavel: proj.responsavel || '',
      status: proj.status || 'Em Andamento',
      regras: proj.regras || [],
      justificativa: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!formData.nome.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }
    if (!formData.justificativa.trim()) {
      alert('A justificativa da alteração de auditoria é obrigatória.');
      return;
    }

    // Calcula a nova versão para o histórico
    const historicosDoProj = historicoProjetos.filter(h => h.id_projeto === editingProject.id);
    const proximaVersao = historicosDoProj.length > 0 
      ? `1.${historicosDoProj.length}.0` 
      : '1.0.0';

    // Cria entrada de auditoria
    const novaAuditoria = {
      id_historico: `hist-proj-${Date.now()}`,
      id_projeto: editingProject.id,
      nome: formData.nome,
      descricao: formData.descricao,
      sistema: formData.sistema,
      responsavel: formData.responsavel,
      status: formData.status,
      regras: formData.regras,
      justificativa: formData.justificativa,
      versao: proximaVersao,
      usuario: currentUser?.name || 'Administrador',
      data_alteracao: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setHistoricoProjetos(prev => [novaAuditoria, ...prev]);

    setProjetos(prev =>
      prev.map(p => (p.id === editingProject.id ? { ...p, ...formData, versao: proximaVersao } : p))
    );
    setIsModalOpen(false);
  };

  const handleDeleteProject = (proj) => {
    if (window.confirm(`Deseja realmente excluir o projeto "${proj.nome}"?`)) {
      setProjetos(prev => prev.filter(p => p.id !== proj.id));
      // Remove do histórico associado
      setHistoricoProjetos(prev => prev.filter(h => h.id_projeto !== proj.id));
    }
  };

  const handleToggleRule = (ruleId) => {
    setFormData(prev => {
      const isAssociated = prev.regras.includes(ruleId);
      const newRegras = isAssociated
        ? prev.regras.filter(r => r !== ruleId)
        : [...prev.regras, ruleId];
      return { ...prev, regras: newRegras };
    });
  };

  // Paginação cálculos
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayResults.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Status badges
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle2 size={12} className="text-green-700 inline mr-1" />;
      case 'Revisão':
        return <AlertCircle size={12} className="text-amber-700 inline mr-1" />;
      default:
        return <Clock size={12} className="text-blue-700 inline mr-1" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-700';
      case 'Revisão':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  // Exportadores
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      'ID;Nome;Sistema;Responsavel;Status;Regras;Documentos\n';
    
    displayResults.forEach((p) => {
      const regrasStr = (p.regras || []).join(', ');
      const docsStr = (p.documentos || []).map(d => d.name).join(', ');
      csvContent += `"${p.id}";"${p.nome}";"${p.sistema}";"${p.responsavel || ''}";"${p.status}";"${regrasStr}";"${docsStr}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'brms_listagem_projetos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportDropdown(false);
  };

  const exportPDF = () => {
    alert('Relatório PDF Gerado: A exportação detalhada do acervo de projetos foi enviada para o serviço de impressão local.');
    setShowExportDropdown(false);
  };

  // Gerador de especificação do projeto (Markdown)
  const generateProjectSpec = (proj) => {
    if (!proj) return '';
    const vigentes = proj.regras || [];
    return `# ESPECIFICAÇÃO TÉCNICA DO PROJETO: ${proj.nome.toUpperCase()}
**ID Projeto:** ${proj.id}
**Sistema Base:** ${proj.sistema}
**Coordenador/Responsável:** ${proj.responsavel || 'Não Definido'}
**Status Executivo:** ${proj.status}
**Data Geração:** ${new Date().toLocaleDateString('pt-BR')}

---

## 1. Descrição do Projeto
${proj.descricao || 'Sem descrição cadastrada para este projeto.'}

## 2. Regras de Negócio Associadas (${vigentes.length})
Abaixo estão detalhadas todas as expressões de regras vinculadas ao escopo deste projeto no BRMS-FGV:

${vigentes.length > 0 ? vigentes.map(rId => {
  const rObj = regras.find(r => r.id_regra === rId);
  return `### Regra ${rId}: ${rObj?.nome || 'Regra de negócio'}
- **Descrição:** ${rObj?.descricao || 'N/A'}
- **Versão:** v${rObj?.versao || '1.0.0'}
- **Expressão Lógica Computável:**
\`\`\`javascript
${rObj?.expressao || '/* Lógica não implementada */'}
\`\`\`
- **Criticidade:** ${rObj?.criticidade || 'Média'}
`;
}).join('\n') : '*Nenhuma regra de negócio associada a este projeto.*'}

## 3. Documentos e Artefatos do Acervo
Lista de referências documentais anexadas:
${proj.documentos && proj.documentos.length > 0 ? proj.documentos.map((doc, idx) => {
  return `${idx + 1}. **${doc.name}** [${doc.type.toUpperCase()}] - _${doc.description}_ ${doc.url ? `([Acessar Link](${doc.url}))` : ''}`;
}).join('\n') : '*Nenhum documento anexado.*'}
`;
  };

  const downloadProjectSpecFile = (proj) => {
    if (!proj) return;
    const content = generateProjectSpec(proj);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `brms_especificacao_projeto_${proj.id.toLowerCase()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Lógica de importação
  const parseCSV = (text, separator = ';') => {
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const projects = [];

    // Mapeamento headers esperados
    const headerMapping = {
      'nome': 'nome',
      'descricao': 'descricao',
      'sistema': 'sistema',
      'responsavel': 'responsavel',
      'status': 'status',
    };

    const mappedHeaders = headers.map(h => headerMapping[h] || h);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      let cells = [];
      let insideQuotes = false;
      let currentCell = '';
      
      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"' || char === "'") {
          insideQuotes = !insideQuotes;
        } else if (char === separator && !insideQuotes) {
          cells.push(currentCell.trim());
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      cells.push(currentCell.trim());
      
      const proj = {};
      mappedHeaders.forEach((header, idx) => {
        let val = cells[idx] ? cells[idx].replace(/^["']|["']$/g, '').trim() : '';
        proj[header] = val;
      });
      projects.push(proj);
    }
    return projects;
  };

  const validateProjects = (rawProjects) => {
    let validCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    const validated = rawProjects.map((p) => {
      const errors = [];
      let isConflict = false;

      // 1. Validar campos requeridos
      if (!p.nome) errors.push('Nome do projeto é obrigatório.');
      if (!p.sistema) errors.push('Sistema associado é obrigatório.');

      // 2. Validar sistema cadastrado no BRMS
      if (p.sistema) {
        const sysExists = systems.some(s => s.nome.toLowerCase() === p.sistema.toLowerCase());
        if (!sysExists) {
          errors.push(`Sistema "${p.sistema}" não cadastrado no BRMS.`);
        } else {
          const sysObj = systems.find(s => s.nome.toLowerCase() === p.sistema.toLowerCase());
          p.sistema = sysObj.nome; // padroniza case
        }
      }

      // 3. Status padrão
      if (!p.status) p.status = 'Em Andamento';

      // 4. Verificar duplicidade de nome
      if (p.nome) {
        const exists = projetos.some(
          ex => ex.nome.trim().toLowerCase() === p.nome.trim().toLowerCase()
        );
        if (exists) {
          isConflict = true;
        }
      }

      const isValid = errors.length === 0;
      if (isValid) {
        if (isConflict) conflictCount++;
        else validCount++;
      } else {
        errorCount++;
      }

      return {
        ...p,
        isValid,
        isConflict,
        errorMessages: errors,
      };
    });

    setImportFeedback({
      total: validated.length,
      valid: validCount,
      conflicts: conflictCount,
      errors: errorCount,
    });

    return validated;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessingFile(true);
    setFileError('');
    setImportedProjects([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let rawProjects = [];
        
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          rawProjects = Array.isArray(parsed) ? parsed : [parsed];
        } else if (file.name.endsWith('.csv')) {
          rawProjects = parseCSV(text);
        } else {
          throw new Error('Formato de arquivo não suportado. Por favor, envie .csv ou .json.');
        }

        if (rawProjects.length === 0) {
          throw new Error('Nenhum registro de projeto foi encontrado no arquivo.');
        }

        const validated = validateProjects(rawProjects);
        setImportedProjects(validated);
      } catch (err) {
        console.error(err);
        setFileError(err.message || 'Erro ao processar o arquivo.');
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      setFileError('Erro de leitura do arquivo.');
      setIsProcessingFile(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  const confirmImport = () => {
    const validProjs = importedProjects.filter(p => p.isValid);
    if (validProjs.length === 0) return;

    const projsFormatados = validProjs.map((item) => {
      const projId = `proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Cria registro de auditoria da importação
      const novaAuditoria = {
        id_historico: `hist-proj-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        id_projeto: projId,
        nome: item.nome,
        descricao: item.descricao || '',
        sistema: item.sistema,
        responsavel: item.responsavel || '',
        status: item.status,
        regras: [],
        justificativa: 'Importação automática via arquivo de carga estruturada.',
        versao: '1.0.0',
        usuario: currentUser?.name || 'Administrador',
        data_alteracao: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };

      setHistoricoProjetos(prev => [novaAuditoria, ...prev]);

      return {
        id: projId,
        nome: item.nome,
        descricao: item.descricao || '',
        sistema: item.sistema,
        responsavel: item.responsavel || '',
        status: item.status,
        regras: [],
        documentos: [],
        versao: '1.0.0',
      };
    });

    setProjetos(prev => [...prev, ...projsFormatados]);
    setShowImportModal(false);
    setImportedProjects([]);
    setSelectedFile(null);
    setFileError('');
  };

  const downloadSampleCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' +
      'nome;descricao;sistema;responsavel;status\n' +
      '"Projeto Portal Acadêmico";"Migração das regras do portal antigo";"SGC";"Mirian Rodrigues";"Em Andamento"\n' +
      '"Faturamento Corporativo";"Regras de desconto por volume";"Financeiro";"Carlos Editor";"Concluído"';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'brms_template_importacao_projetos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleJSON = () => {
    const sample = [
      {
        nome: 'Projeto Portal Acadêmico',
        descricao: 'Migração das regras do portal antigo',
        sistema: 'SGC',
        responsavel: 'Mirian Rodrigues',
        status: 'Em Andamento',
      },
    ];
    const jsonString = 'data:text/json;charset=utf-8,\uFEFF' + encodeURIComponent(JSON.stringify(sample, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', 'brms_template_importacao_projetos.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reversão de histórico
  const handleRollbackProject = (historicoItem) => {
    setProjetos(prev =>
      prev.map(p => {
        if (p.id === historicoItem.id_projeto) {
          return {
            ...p,
            nome: historicoItem.nome,
            descricao: historicoItem.descricao,
            sistema: historicoItem.sistema,
            responsavel: historicoItem.responsavel,
            status: historicoItem.status,
            regras: historicoItem.regras,
            versao: historicoItem.versao,
          };
        }
        return p;
      })
    );

    // Registra auditoria da reversão
    const novaAuditoria = {
      id_historico: `hist-proj-${Date.now()}`,
      id_projeto: historicoItem.id_projeto,
      nome: historicoItem.nome,
      descricao: historicoItem.descricao,
      sistema: historicoItem.sistema,
      responsavel: historicoItem.responsavel,
      status: historicoItem.status,
      regras: historicoItem.regras,
      justificativa: `Restaurada versão ${historicoItem.versao} (autor original: ${historicoItem.usuario})`,
      versao: `1.${historicoProjetos.filter(h => h.id_projeto === historicoItem.id_projeto).length}.0`,
      usuario: currentUser?.name || 'Administrador',
      data_alteracao: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setHistoricoProjetos(prev => [novaAuditoria, ...prev]);
    setSelectedProjectForHistory(null);
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-secondary/10 p-3 rounded-xl text-secondary shadow-inner">
            <TableIcon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-text-title tracking-tight">
              Listar de Projetos
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">
              Consulta e listagem dos projetos cadastrados no ecossistema.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all uppercase tracking-widest gap-2 outline-none shadow-sm"
        >
          <Filter size={14} /> {showFilters ? 'Ocultar Filtros' : 'Exibir Filtros'}
        </button>
      </div>

      {/* Seção Filtros */}
      {showFilters && (
        <div className="bg-white rounded-card shadow-card p-6 border border-gray-100 flex flex-col space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro Nome */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Nome do Projeto
              </label>
              <input
                type="text"
                name="nome"
                value={filters.nome}
                onChange={handleChange}
                placeholder="Ex: Portal de Concessão"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 placeholder:text-gray-400 bg-white"
              />
            </div>

            {/* Filtro Sistema */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Sistema
              </label>
              <select
                name="sistema"
                value={filters.sistema}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 bg-white"
              >
                <option value="">Todos os Sistemas</option>
                {systems.map(sys => (
                  <option key={sys.id} value={sys.nome}>{sys.nome}</option>
                ))}
              </select>
            </div>

            {/* Filtro Status */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 bg-white"
              >
                <option value="">Todos</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Revisão">Revisão</option>
              </select>
            </div>

            {/* Filtro Responsável */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Responsável
              </label>
              <input
                type="text"
                name="responsavel"
                value={filters.responsavel}
                onChange={handleChange}
                placeholder="Ex: Mirian Rodrigues"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-gray-600 placeholder:text-gray-400 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-50 pt-4">
            <div className="flex space-x-3">
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
      )}

      {/* Seção de Resultados */}
      <div className="bg-white rounded-card shadow-card overflow-hidden border border-gray-100">
        <div className="p-6 bg-gray-50/50 border-b flex items-center justify-between text-secondary relative">
          <div className="flex items-center space-x-2">
            <FileText size={18} />
            <h2 className="font-bold text-lg">Resultado</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {canEdit && (
              <button 
                onClick={() => setShowImportModal(true)}
                className="flex items-center text-xs font-bold bg-secondary/15 border border-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/25 transition-all shadow-sm"
              >
                <Upload size={14} className="mr-1.5 text-secondary" /> Importar
              </button>
            )}

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
                {visibleColumns.nome && <th className="px-6 py-4">nome do projeto</th>}
                {visibleColumns.sistema && <th className="px-6 py-4 whitespace-nowrap">Sistema</th>}
                {visibleColumns.responsavel && <th className="px-6 py-4 whitespace-nowrap">Responsável</th>}
                {visibleColumns.regras && <th className="px-6 py-4">regras vinculadas</th>}
                {visibleColumns.documentos && <th className="px-6 py-4">documentos</th>}
                {visibleColumns.status && <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>}
                {visibleColumns.acoes && <th className="px-6 py-4 text-center whitespace-nowrap">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {currentItems.length > 0 ? (
                currentItems.map((row, index) => (
                  <tr key={index} className="hover:bg-primary/5 transition-colors group">
                    {visibleColumns.id && (
                      <td className="px-6 py-4 font-mono text-xs font-bold text-secondary whitespace-nowrap">
                        {row.id}
                      </td>
                    )}
                    {visibleColumns.nome && (
                      <td className="px-6 py-4 font-bold text-text-title min-w-[200px]">
                        <div>{row.nome}</div>
                        <div className="text-[10px] text-gray-400 font-normal italic line-clamp-1 mt-0.5">{row.descricao}</div>
                      </td>
                    )}
                    {visibleColumns.sistema && (
                      <td className="px-6 py-4 font-medium text-primary whitespace-nowrap">
                        {row.sistema}
                      </td>
                    )}
                    {visibleColumns.responsavel && (
                      <td className="px-6 py-4 font-medium text-gray-600 whitespace-nowrap">
                        {row.responsavel || '-'}
                      </td>
                    )}
                    {visibleColumns.regras && (
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(row.regras || []).map(rId => (
                            <span key={rId} className="px-1.5 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded">
                              {rId}
                            </span>
                          ))}
                          {(row.regras || []).length === 0 && <span className="text-xs text-gray-400 italic">Nenhuma</span>}
                        </div>
                      </td>
                    )}
                    {visibleColumns.documentos && (
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 font-medium">
                          {(row.documentos || []).length} arquivo(s)
                        </div>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusClass(row.status)}`}>
                          {getStatusIcon(row.status)}
                          {row.status}
                        </span>
                      </td>
                    )}
                    {visibleColumns.acoes && (
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedProjectForSpec(row);
                              setSpecTab('preview');
                            }}
                            className="flex items-center px-3 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm text-green-700 hover:text-white hover:bg-green-700 border-green-200 hover:border-green-700"
                            title="Visualizar Especificação Técnica"
                          >
                            <FileText size={14} className="mr-1.5" /> Especificação
                          </button>

                          <button
                            onClick={() => setSelectedProjectForHistory(row)}
                            className="flex items-center px-3 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm text-primary hover:text-white hover:bg-primary border-primary/20 hover:border-primary"
                            title="Histórico de auditoria e versionamento"
                          >
                            <History size={14} className="mr-1.5" /> Histórico
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(row)}
                            disabled={!canEdit}
                            className={`flex items-center px-4 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm ${
                              !canEdit
                                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                : 'text-secondary hover:text-white hover:bg-secondary border-secondary/20 hover:border-secondary'
                            }`}
                            title={!canEdit ? 'Sem permissão para editar projetos.' : ''}
                          >
                            {!canEdit && <Lock size={12} className="mr-1.5" />}
                            <Edit size={14} className="mr-1.5" /> Editar
                          </button>

                          <button
                            onClick={() => handleDeleteProject(row)}
                            disabled={!canDelete}
                            className={`flex items-center px-4 py-1.5 text-xs font-bold border rounded-md transition-all shadow-sm ${
                              !canDelete
                                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                : 'text-red-600 hover:text-white hover:bg-red-600 border-red-200 hover:border-red-600'
                            }`}
                            title={!canDelete ? 'Sem permissão para excluir projetos.' : ''}
                          >
                            {!canDelete && <Lock size={12} className="mr-1.5" />}
                            <Trash2 size={14} className="mr-1.5" /> Excluir
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={allColumns.length} className="text-center py-12 text-gray-400 italic">
                    Nenhum projeto cadastrado ou encontrado.
                  </td>
                </tr>
              )}
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
              disabled={currentPage === 1 || totalPages <= 1}
              className={`p-2 rounded-lg border border-gray-300 transition-all ${currentPage === 1 || totalPages <= 1 ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'hover:bg-white hover:border-secondary text-secondary shadow-sm'}`}
            >
              <ChevronLeft size={16} />
            </button>

            {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
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
              disabled={currentPage === totalPages || totalPages <= 1}
              className={`p-2 rounded-lg border border-gray-300 transition-all ${currentPage === totalPages || totalPages <= 1 ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'hover:bg-white hover:border-secondary text-secondary shadow-sm'}`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl animate-slide-down border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-primary flex items-center">
                <Folder size={20} className="mr-2 text-secondary" />
                Editar Projeto
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Novo Portal de Matrículas"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 text-gray-700"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva brevemente os objetivos e impactos..."
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 h-20 resize-none text-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sistema */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Sistema Vinculado
                  </label>
                  <select
                    value={formData.sistema}
                    onChange={(e) => setFormData({ ...formData, sistema: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 text-gray-600"
                  >
                    {systems.map((sys) => (
                      <option key={sys.id} value={sys.nome}>
                        {sys.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Responsável */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 text-gray-700"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Status do Projeto
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 text-gray-600"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Revisão">Revisão</option>
                </select>
              </div>

              {/* Regras (Checkbox list) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Vincular Regras de Negócio
                </label>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 max-h-40 overflow-y-auto space-y-2">
                  {regras.map((rule) => {
                    const isChecked = formData.regras.includes(rule.id_regra);
                    return (
                      <label
                        key={rule.id_regra}
                        className="flex items-center space-x-3 text-xs font-medium text-gray-700 hover:text-secondary cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRule(rule.id_regra)}
                          className="rounded border-gray-300 text-secondary focus:ring-secondary/20 h-4 w-4"
                        />
                        <span>
                          <strong>{rule.id_regra}</strong> - {rule.nome}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Justificativa de Auditoria */}
              <div className="space-y-1 pt-2 border-t border-gray-100">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Justificativa de Auditoria (Obrigatorio)
                </label>
                <textarea
                  value={formData.justificativa}
                  onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
                  placeholder="Por que este projeto está sendo alterado? Descreva para o log de auditoria..."
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-secondary/20 h-16 resize-none text-gray-700 font-medium italic"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProject}
                className="px-6 py-2.5 bg-secondary text-white rounded-xl font-bold shadow-md hover:bg-secondary/90 transition-all text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Especificação */}
      {selectedProjectForSpec && (
        <Modal
          isOpen={!!selectedProjectForSpec}
          onClose={() => setSelectedProjectForSpec(null)}
          title={`Especificação Técnica: ${selectedProjectForSpec.id}`}
          icon={FileText}
        >
          <div className="space-y-6 text-left max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-4 sticky top-0 bg-white z-10 py-1">
              <button
                onClick={() => setSpecTab('preview')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
                  specTab === 'preview' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Visualizar Documento
              </button>
              <button
                onClick={() => setSpecTab('markdown')}
                className={`flex-1 py-2 text-center text-xs font-bold border-b-2 transition-all ${
                  specTab === 'markdown' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Código Markdown (.md)
              </button>
            </div>

            {specTab === 'preview' ? (
              <div className="space-y-6 text-xs text-gray-700 leading-relaxed font-sans bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                {/* Cabeçalho */}
                <div className="border-b border-gray-200 pb-4 text-center">
                  <h1 className="text-base font-black text-primary uppercase tracking-wide">
                    Especificação Técnica de Projeto no BRMS
                  </h1>
                  <p className="text-[14px] font-bold text-secondary mt-1">{selectedProjectForSpec.nome}</p>
                  <div className="flex justify-center space-x-4 text-[10px] text-gray-400 mt-2 font-mono">
                    <span>ID: {selectedProjectForSpec.id}</span>
                    <span>•</span>
                    <span>Sistema: {selectedProjectForSpec.sistema}</span>
                    <span>•</span>
                    <span>Data: {new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Seção 1 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-l-2 border-secondary pl-2">
                    1. Descrição do Projeto
                  </h3>
                  <p>{selectedProjectForSpec.descricao || 'Sem descrição cadastrada.'}</p>
                </div>

                {/* Seção 2 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-l-2 border-secondary pl-2">
                    2. Regras de Negócio Associadas ({(selectedProjectForSpec.regras || []).length})
                  </h3>
                  <div className="space-y-4">
                    {(selectedProjectForSpec.regras || []).length > 0 ? (
                      (selectedProjectForSpec.regras || []).map(rId => {
                        const rObj = regras.find(r => r.id_regra === rId);
                        return (
                          <div key={rId} className="bg-white p-3 border rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-secondary">{rId}: {rObj?.nome || 'Regra de negócio'}</span>
                              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-mono">v{rObj?.versao || '1.0.0'}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 italic">{rObj?.descricao || 'Sem descrição.'}</p>
                            <pre className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-mono text-[10px] text-secondary overflow-x-auto">
                              {rObj?.expressao || '/* Lógica não implementada */'}
                            </pre>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 italic">Nenhuma regra de negócio associada.</p>
                    )}
                  </div>
                </div>

                {/* Seção 3 */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-primary uppercase tracking-widest border-l-2 border-secondary pl-2">
                    3. Artefatos de Conformidade
                  </h3>
                  <ul className="list-disc pl-4 space-y-1">
                    {(selectedProjectForSpec.documentos || []).length > 0 ? (
                      (selectedProjectForSpec.documentos || []).map((doc, idx) => (
                        <li key={idx}>
                          <strong>{doc.name}</strong> ({doc.type.toUpperCase()}) - {doc.description}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400 italic">Nenhum documento anexado ao projeto.</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                  Código Markdown (.md)
                </label>
                <textarea
                  readOnly
                  value={generateProjectSpec(selectedProjectForSpec)}
                  className="w-full h-96 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-700 focus:outline-none custom-scrollbar leading-relaxed resize-none"
                />
              </div>
            )}

            {/* Ações */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setSelectedProjectForSpec(null)}
                type="button"
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-xs uppercase tracking-widest text-center"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateProjectSpec(selectedProjectForSpec));
                  alert('Especificação do projeto copiada para a área de transferência!');
                }}
                type="button"
                className="px-4 py-3 border border-secondary text-secondary rounded-xl font-bold hover:bg-secondary/5 transition-all active:scale-95 text-xs uppercase tracking-widest text-center"
              >
                Copiar Markdown
              </button>
              <button
                onClick={() => downloadProjectSpecFile(selectedProjectForSpec)}
                type="button"
                className="flex-1 px-6 py-3 bg-secondary text-white shadow-md shadow-secondary/15 hover:bg-secondary-dark rounded-xl font-black transition-all active:scale-95 text-xs uppercase tracking-widest text-center"
              >
                Baixar (.md)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Histórico */}
      {selectedProjectForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 border border-gray-100 flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center space-x-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <History size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">Histórico de Alterações do Projeto</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Visualizando versões de <span className="font-mono text-secondary font-bold">{selectedProjectForHistory.id}</span> — {selectedProjectForHistory.nome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProjectForHistory(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Timeline */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              {(() => {
                const historyList = historicoProjetos
                  .filter((h) => h.id_projeto === selectedProjectForHistory.id)
                  .sort((a, b) => new Date(b.data_alteracao) - new Date(a.data_alteracao));

                if (historyList.length === 0) {
                  return (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      <History size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-bold text-gray-400">Nenhum histórico registrado para este projeto</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Novos registros de histórico serão gravados automaticamente quando você editar ou reverter este projeto.
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
                          <div className="flex-1 space-y-3 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2.5 py-0.5 bg-secondary text-white text-[10px] font-black uppercase tracking-wider rounded border border-secondary shadow-sm shadow-secondary/10">
                                v{item.versao}
                              </span>
                              <span className="text-[11px] text-gray-400 font-bold">
                                {item.data_alteracao}
                              </span>
                              <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                Modificado por: {item.usuario}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusClass(item.status)}`}>
                                Status: {item.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-gray-800">{item.nome}</h4>
                              <p className="text-xs text-gray-500">{item.descricao}</p>
                              <p className="text-xs text-gray-400 font-mono">Regras vinculadas: {(item.regras || []).join(', ') || 'Nenhuma'}</p>
                            </div>

                            {item.justificativa && (
                              <div className="bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100 italic text-xs text-gray-500">
                                <strong>Justificativa da Auditoria: </strong>"{item.justificativa}"
                              </div>
                            )}
                          </div>

                          {/* Rollback */}
                          {canEdit && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja restaurar o projeto para a versão ${item.versao}?`)) {
                                  handleRollbackProject(item);
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
                onClick={() => setSelectedProjectForHistory(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-black hover:bg-gray-200 transition-all uppercase tracking-widest outline-none active:scale-95 border border-gray-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação de Projetos */}
      {showImportModal && (
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportedProjects([]);
            setSelectedFile(null);
            setFileError('');
          }}
          title="Importação Automática de Projetos"
          icon={Upload}
        >
          <div className="space-y-6 text-left">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-start space-x-3 mb-2">
              <div className="p-2 bg-secondary/10 rounded-lg shrink-0">
                <Upload size={20} className="text-secondary" />
              </div>
              <div className="text-xs text-gray-600 leading-relaxed">
                <p className="font-bold text-gray-700 mb-1">Instruções para Importação</p>
                <p className="mb-2">Envie um arquivo <strong>.csv</strong> (delimitado por ponto e vírgula `;`) ou <strong>.json</strong> contendo os projetos de regras a serem inseridos.</p>
                <div className="flex space-x-2">
                  <button onClick={downloadSampleCSV} type="button" className="text-secondary hover:underline font-bold flex items-center">
                    <FileSpreadsheet size={12} className="mr-1" /> Modelo CSV
                  </button>
                  <span className="text-gray-300">|</span>
                  <button onClick={downloadSampleJSON} type="button" className="text-secondary hover:underline font-bold flex items-center">
                    <FileText size={12} className="mr-1" /> Modelo JSON
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
                Selecionar Arquivo
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-secondary rounded-xl p-6 transition-all flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white relative">
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessingFile}
                />
                <Upload className="text-gray-400 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-600 text-center">
                  {selectedFile ? selectedFile.name : 'Clique ou arraste o arquivo de carga aqui'}
                </span>
                <span className="text-[10px] text-gray-400 mt-1">Formatos suportados: .csv e .json</span>
              </div>
            </div>

            {fileError && (
              <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {isProcessingFile && (
              <div className="text-center py-4 text-xs font-medium text-gray-500">
                Processando e validando dados do arquivo...
              </div>
            )}

            {!fileError && importedProjects.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between text-xs font-bold bg-gray-50 p-3 rounded-lg border">
                  <span className="text-gray-600">Resumo da Validação</span>
                  <div className="flex space-x-3 text-[10px]">
                    <span className="text-green-600 font-bold">✅ {importFeedback.valid} Válidos</span>
                    {importFeedback.conflicts > 0 && (
                      <span className="text-orange-600 font-bold">⚠️ {importFeedback.conflicts} Duplicados</span>
                    )}
                    {importFeedback.errors > 0 && (
                      <span className="text-red-600 font-bold">❌ {importFeedback.errors} Com Erro</span>
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-xl divide-y divide-gray-100 text-xs custom-scrollbar">
                  {importedProjects.map((p, idx) => (
                    <div key={idx} className="p-3 hover:bg-gray-50/50 flex items-start justify-between space-x-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            p.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {p.isValid ? 'OK' : 'Inválido'}
                          </span>
                          <span className="font-bold text-gray-800 truncate">{p.nome || '(Sem nome)'}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">
                          Sistema: {p.sistema || 'N/A'} | Responsável: {p.responsavel || 'N/A'} | Status: {p.status || 'N/A'}
                        </p>
                        {p.errorMessages.length > 0 && (
                          <ul className="list-disc pl-4 text-[10px] text-red-600 space-y-0.5">
                            {p.errorMessages.map((msg, mIdx) => (
                              <li key={mIdx}>{msg}</li>
                            ))}
                          </ul>
                        )}
                        {p.isConflict && (
                          <p className="text-[10px] text-orange-600 font-semibold italic flex items-center">
                            <AlertTriangle size={10} className="mr-1 shrink-0" /> Nome duplicado (pode ser sobrescrito).
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportedProjects([]);
                  setSelectedFile(null);
                  setFileError('');
                }}
                type="button"
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95 text-xs uppercase tracking-widest text-center"
              >
                Cancelar
              </button>
              <button
                onClick={confirmImport}
                type="button"
                disabled={importFeedback.valid + importFeedback.conflicts === 0}
                className={`flex-1 px-6 py-3 rounded-xl font-black transition-all active:scale-95 shadow-md text-xs uppercase tracking-widest leading-none ${
                  (importFeedback.valid + importFeedback.conflicts > 0)
                    ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirmar ({importFeedback.valid + importFeedback.conflicts} Projetos)
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ListProjects;
