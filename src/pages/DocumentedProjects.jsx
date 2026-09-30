import React, { useState } from 'react';
import {
  Folder,
  Search,
  ChevronRight,
  FileText,
  Info,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Upload,
} from 'lucide-react';

const DocumentedProjects = ({ projetos, setProjetos, regras, systems, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [systemFilter, setSystemFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    sistema: '',
    responsavel: '',
    status: 'Em Andamento',
    regras: [],
  });

  // Modal de adição de documento
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(null);
  const [docData, setDocData] = useState({
    name: '',
    type: 'pdf',
    description: '',
    url: '',
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluído':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Revisão':
        return <AlertCircle size={16} className="text-amber-500" />;
      default:
        return <Clock size={16} className="text-blue-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Revisão':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      nome: '',
      descricao: '',
      sistema: systems[0]?.nome || '',
      responsavel: currentUser?.name || '',
      status: 'Em Andamento',
      regras: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      nome: project.nome,
      descricao: project.descricao || '',
      sistema: project.sistema || systems[0]?.nome || '',
      responsavel: project.responsavel || '',
      status: project.status || 'Em Andamento',
      regras: project.regras || [],
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!formData.nome.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }

    if (editingProject) {
      // Edit
      setProjetos((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, ...formData }
            : p
        )
      );
    } else {
      // New
      const newProject = {
        id: `proj-${Date.now()}`,
        ...formData,
        documentos: [],
      };
      setProjetos((prev) => [...prev, newProject]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProject = (id) => {
    if (window.confirm('Deseja realmente excluir este projeto?')) {
      setProjetos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Regras checkbox handler
  const handleToggleRule = (ruleId) => {
    setFormData((prev) => {
      const isAssociated = prev.regras.includes(ruleId);
      const newRegras = isAssociated
        ? prev.regras.filter((r) => r !== ruleId)
        : [...prev.regras, ruleId];
      return { ...prev, regras: newRegras };
    });
  };

  // Documentos
  const handleOpenDocModal = (projectId) => {
    setTargetProjectId(projectId);
    setDocData({ name: '', type: 'pdf', description: '', url: '' });
    setIsDocModalOpen(true);
  };

  const handleAddDocument = () => {
    if (!docData.name.trim()) {
      alert('O nome do documento é obrigatório.');
      return;
    }

    setProjetos((prev) =>
      prev.map((proj) => {
        if (proj.id === targetProjectId) {
          return {
            ...proj,
            documentos: [
              ...(proj.documentos || []),
              {
                id: Date.now(),
                name: docData.name,
                type: docData.type,
                description: docData.description || 'Sem descrição.',
                url: docData.url,
              },
            ],
          };
        }
        return proj;
      })
    );

    setIsDocModalOpen(false);
  };

  const handleDeleteDocument = (projectId, docId) => {
    if (window.confirm('Excluir este documento do projeto?')) {
      setProjetos((prev) =>
        prev.map((proj) => {
          if (proj.id === projectId) {
            return {
              ...proj,
              documentos: (proj.documentos || []).filter((d) => d.id !== docId),
            };
          }
          return proj;
        })
      );
    }
  };

  // Filter projects
  const filteredProjects = projetos.filter((proj) => {
    const matchesSearch =
      proj.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.descricao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.responsavel || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSystem = systemFilter ? proj.sistema === systemFilter : true;
    const matchesStatus = statusFilter ? proj.status === statusFilter : true;

    return matchesSearch && matchesSystem && matchesStatus;
  });

  return (
    <div className="animate-fade-in space-y-6 pb-12 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-secondary/10 p-3 rounded-xl text-secondary shadow-inner">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-text-title tracking-tight">
              Projetos Documentados
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">
              Gerenciamento de projetos organizacionais, regras vinculadas e seus artefatos.
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-5 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-bold shadow-lg shadow-secondary/30 active:scale-95"
        >
          <Plus size={18} className="mr-2" /> Novo Projeto
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100 space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center text-[15px] uppercase tracking-wider">
              <Filter size={18} className="mr-2 text-secondary" /> Filtros e Busca
            </h3>

            {/* System Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Filtrar por Sistema
              </label>
              <select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
              >
                <option value="">Todos os Sistemas</option>
                {systems.map((sys) => (
                  <option key={sys.id} value={sys.nome}>
                    {sys.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Status do Projeto
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
              >
                <option value="">Todos os Status</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
                <option value="Revisão">Revisão</option>
              </select>
            </div>

            {/* Info Box */}
            <div className="pt-4 border-t border-gray-100">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-[12px] text-blue-700 leading-relaxed flex items-start">
                  <Info size={16} className="inline mr-2 shrink-0 mt-0.5" />
                  <span>
                    Projetos ajudam a agrupar e documentar regras sob o escopo de entregas específicas do BRMS-FGV.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Box */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Pesquisar por nome, descrição ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-6 pr-16 text-[16px] focus:outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary/20 transition-all shadow-sm placeholder:text-gray-400"
            />
            <div className="absolute right-4 top-3 bg-secondary text-white p-2 rounded-xl shadow-md">
              <Search size={18} />
            </div>
          </div>

          {/* Project Cards List */}
          {filteredProjects.length > 0 ? (
            <div className="space-y-6">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-gray-150 rounded-3xl p-6 hover:border-secondary/20 transition-all shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Status and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                        <span
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusClass(
                            proj.status
                          )}`}
                        >
                          {getStatusIcon(proj.status)}
                          <span>{proj.status}</span>
                        </span>
                        <span className="flex items-center space-x-1 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                          <Database size={12} />
                          <span>{proj.sistema}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(proj)}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                          title="Editar Projeto"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-55 rounded-xl transition-all"
                          title="Excluir Projeto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Project Information */}
                    <div>
                      <h2 className="text-xl font-bold text-text-title hover:text-secondary transition-colors cursor-pointer">
                        {proj.nome}
                      </h2>
                      <p className="text-[13px] text-gray-500 mt-1.5 italic font-medium leading-relaxed">
                        {proj.descricao || 'Nenhuma descrição fornecida.'}
                      </p>
                    </div>

                    {/* Responsible info */}
                    <div className="flex items-center space-x-2 text-[13px] text-gray-600 font-medium">
                      <Users size={16} className="text-gray-400" />
                      <span>Responsável: <strong>{proj.responsavel || 'Não definido'}</strong></span>
                    </div>

                    {/* Associated Rules list */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Regras de Negócio Associadas ({proj.regras?.length || 0})
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {proj.regras && proj.regras.length > 0 ? (
                          proj.regras.map((ruleId) => {
                            const rDetails = regras.find((r) => r.id_regra === ruleId);
                            return (
                              <span
                                key={ruleId}
                                className="inline-block bg-primary/5 text-primary text-[11px] font-extrabold px-2.5 py-1 rounded-lg border border-primary/10"
                                title={rDetails?.nome || 'Regra de negócio'}
                              >
                                {ruleId} {rDetails ? `- ${rDetails.nome}` : ''}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic font-medium">
                            Nenhuma regra vinculada a este projeto.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Documents List */}
                    <div className="pt-4 border-t border-gray-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Documentos e Artefatos do Projeto
                        </label>
                        <button
                          onClick={() => handleOpenDocModal(proj.id)}
                          className="flex items-center text-xs font-bold text-secondary hover:text-blue-600 transition-colors"
                        >
                          <Plus size={14} className="mr-0.5" /> Adicionar Documento
                        </button>
                      </div>

                      {proj.documentos && proj.documentos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {proj.documentos.map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-start justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all group"
                            >
                              <div className="flex items-start space-x-2">
                                <div className="p-2 bg-blue-100/50 text-blue-600 rounded-lg mt-0.5">
                                  <FileText size={14} />
                                </div>
                                <div className="text-left">
                                  <h4 className="text-xs font-bold text-gray-700 leading-tight">
                                    {doc.name}
                                    <span className="ml-1 text-[9px] font-bold uppercase text-gray-400 bg-gray-200 px-1 py-0.5 rounded">
                                      {doc.type}
                                    </span>
                                  </h4>
                                  <p className="text-[10px] text-gray-400 italic line-clamp-1">
                                    {doc.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 shrink-0">
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 text-gray-400 hover:text-secondary"
                                    title="Acessar"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteDocument(proj.id, doc.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remover documento"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic font-medium">
                          Nenhum documento anexado a este projeto.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-150 rounded-3xl py-20 text-center text-gray-400">
              <Folder size={48} className="mx-auto mb-4 opacity-30" />
              <h3 className="font-bold text-gray-700 mb-1">Nenhum projeto encontrado</h3>
              <p className="text-sm italic">Tente alterar os termos da busca ou crie um novo projeto.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação / Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl animate-slide-down border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-primary flex items-center">
                <Folder size={20} className="mr-2 text-secondary" />
                {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
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
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
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
                  placeholder="Descreva brevemente os objetivos e impactos do projeto..."
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 h-20 resize-none"
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
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
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
                    placeholder="Ex: Mirian Rodrigues"
                    className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
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
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
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
                  {regras.length > 0 ? (
                    regras.map((rule) => {
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
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic">Nenhuma regra cadastrada no sistema.</p>
                  )}
                </div>
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

      {/* Modal de Adição de Documento */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-slide-down border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-primary flex items-center">
                <FileText size={18} className="mr-2 text-secondary" />
                Adicionar Documento ao Projeto
              </h2>
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Nome do Documento */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Nome do Documento / Artefato
                </label>
                <input
                  type="text"
                  value={docData.name}
                  onChange={(e) => setDocData({ ...docData, name: e.target.value })}
                  placeholder="Ex: Especificação de Negócio v1.2"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {/* Tipo de Recurso */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Tipo
                </label>
                <select
                  value={docData.type}
                  onChange={(e) => setDocData({ ...docData, type: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="pdf">Documento PDF</option>
                  <option value="doc">Documento Word / Texto</option>
                  <option value="link">Link de Acesso Web</option>
                  <option value="network">Diretório Compartilhado</option>
                </select>
              </div>

              {/* Descrição */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Descrição / Observações
                </label>
                <input
                  type="text"
                  value={docData.description}
                  onChange={(e) => setDocData({ ...docData, description: e.target.value })}
                  placeholder="Ex: Documentação original aprovada pela diretoria."
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {/* URL ou Caminho */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Link / Caminho de Rede (Opcional)
                </label>
                <input
                  type="text"
                  value={docData.url}
                  onChange={(e) => setDocData({ ...docData, url: e.target.value })}
                  placeholder="Ex: http://portal.fgv.br/docs/especificacao.pdf"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setIsDocModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDocument}
                className="px-5 py-2 bg-secondary text-white rounded-xl font-bold shadow-md hover:bg-secondary/90 transition-all text-xs"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentedProjects;
