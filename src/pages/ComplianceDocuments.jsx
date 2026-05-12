import React, { useState } from 'react';
import {
  Folder,
  Search,
  ChevronRight,
  FileText,
  Info,
  Filter,
  ArrowLeft,
  FolderPlus,
  Upload,
  X,
  Trash2,
  ExternalLink,
  Network,
  Link,
  Plus,
} from 'lucide-react';

const initialTreeData = [
  {
    id: 1,
    name: 'Manuais e Normativos',
    children: [
      {
        id: 101,
        name: 'Manual do Usuário v2.0',
        type: 'pdf',
        description: 'Guia completo de utilização da plataforma BRMS.',
      },
      {
        id: 102,
        name: 'Política de Conformidade 2026',
        type: 'doc',
        description: 'Diretrizes oficiais da FGV para o ano vigente.',
      },
    ],
  },
  {
    id: 2,
    name: 'Processos de Negócio',
    children: [
      {
        id: 201,
        name: 'Portal Normativo',
        type: 'link',
        url: 'https://portal.fgv.br/normas',
        description: 'Acesso direto ao repositório central de normas FGV.',
      },
      {
        id: 202,
        name: 'Diretório de Rede - Auditoria',
        type: 'network',
        url: '\\\\fgv\\auditoria\\2026',
        description: 'Pasta compartilhada para arquivos brutos de auditoria.',
      },
    ],
  },
];

const ComplianceDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState(initialTreeData);
  const [expandedFolders, setExpandedFolders] = useState({ 1: true, 2: true });
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(null); // ID da pasta
  const [newFolderName, setNewFolderName] = useState('');

  const [linkData, setLinkData] = useState({ name: '', url: '', description: '', type: 'link' });

  const toggleFolder = (id) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now(),
      name: newFolderName,
      children: [],
    };
    setTreeData((prev) => [...prev, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleDeleteFolder = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta pasta e todos os seus itens?')) {
      setTreeData((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleAddLink = () => {
    if (!linkData.name.trim() || !linkData.url.trim()) return;

    setTreeData((prev) =>
      prev.map((folder) => {
        if (folder.id === isAddingLink) {
          return {
            ...folder,
            children: [...folder.children, { ...linkData, id: Date.now() }],
          };
        }
        return folder;
      })
    );

    setLinkData({ name: '', url: '', description: '', type: 'link' });
    setIsAddingLink(null);
    setExpandedFolders((prev) => ({ ...prev, [isAddingLink]: true }));
  };

  const handleImportClick = (folderId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const allowedExtensions = ['pdf', 'doc', 'docx', 'txt'];
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert('Extensão não permitida.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo excede 10MB.');
        return;
      }

      const description = prompt(`Descrição para "${file.name}":`, '');

      setTreeData((prev) =>
        prev.map((folder) => {
          if (folder.id === folderId) {
            return {
              ...folder,
              children: [
                ...folder.children,
                {
                  id: Date.now(),
                  name: file.name.replace(`.${fileExtension}`, ''),
                  type: fileExtension,
                  description: description || 'Sem descrição.',
                },
              ],
            };
          }
          return folder;
        })
      );
      setExpandedFolders((prev) => ({ ...prev, [folderId]: true }));
    };
    input.click();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'link':
        return <ExternalLink size={16} />;
      case 'network':
        return <Network size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-secondary/10 p-3 rounded-xl text-secondary shadow-inner">
            <Folder size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-text-title tracking-tight">
              Documentos de Conformidade
            </h1>
            <p className="text-gray-500 mt-1 font-medium italic">
              Gestão centralizada de documentos, sistemas e repositórios de rede.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddingFolder(true)}
          className="flex items-center px-5 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-bold shadow-lg shadow-secondary/30 active:scale-95"
        >
          <FolderPlus size={18} className="mr-2" /> Nova Pasta
        </button>
      </div>

      {isAddingFolder && (
        <div className="bg-white border-2 border-dashed border-secondary/30 p-6 rounded-2xl flex items-center space-x-4 animate-slide-down shadow-lg">
          <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
            <Plus size={24} />
          </div>
          <input
            autoFocus
            type="text"
            placeholder="Nome da nova pasta organizacional..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
            className="flex-1 bg-gray-50 border-none rounded-xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/20 shadow-inner"
          />
          <button
            onClick={handleAddFolder}
            className="bg-secondary text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600"
          >
            Criar
          </button>
          <button
            onClick={() => setIsAddingFolder(false)}
            className="text-gray-400 hover:text-red-500 p-2"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-5 flex items-center text-[15px] uppercase tracking-wider">
              <Filter size={18} className="mr-2 text-secondary" /> Legenda de Itens
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                  <FileText size={16} />
                </div>
                <span className="font-medium">Arquivo (PDF, DOC...)</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="p-2 bg-green-50 text-green-500 rounded-lg">
                  <ExternalLink size={16} />
                </div>
                <span className="font-medium">Link de Sistema</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="p-2 bg-purple-50 text-purple-500 rounded-lg">
                  <Network size={16} />
                </div>
                <span className="font-medium">Diretório de Rede</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-[12px] text-blue-700 leading-relaxed">
                  <Info size={14} className="inline mr-2" />
                  <strong>Suporte:</strong> Links de rede devem seguir o padrão FGV corporativo para
                  acesso direto.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-8 rounded-3xl shadow-card border border-gray-100 min-h-[600px]">
            <div className="relative mb-10 group">
              <input
                type="text"
                placeholder="Pesquisar por nome, descrição ou URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-7 pr-16 text-[17px] focus:outline-none focus:ring-4 focus:ring-secondary/5 transition-all shadow-inner placeholder:text-gray-400"
              />
              <div className="absolute right-5 top-4 bg-secondary text-white p-2.5 rounded-xl shadow-lg">
                <Search size={22} />
              </div>
            </div>

            <div className="space-y-6">
              {treeData.map((folder) => {
                const isExpanded = expandedFolders[folder.id];
                return (
                  <div
                    key={folder.id}
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:border-secondary/20 transition-all shadow-sm"
                  >
                    <div
                      onClick={() => toggleFolder(folder.id)}
                      className={`w-full flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors group ${isExpanded ? 'bg-gray-50/30 border-b border-gray-50' : 'bg-white'}`}
                    >
                      <div className="flex items-center space-x-5">
                        <div
                          className={`p-2.5 rounded-xl transition-all ${isExpanded ? 'bg-secondary text-white shadow-md' : 'bg-gray-100 text-gray-400 group-hover:bg-accent/10 group-hover:text-accent'}`}
                        >
                          <Folder size={20} className={isExpanded ? 'fill-current' : ''} />
                        </div>
                        <span
                          className={`text-[17px] font-bold ${isExpanded ? 'text-primary' : 'text-text-title'}`}
                        >
                          {folder.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAddingLink(folder.id);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Adicionar Link"
                        >
                          <Link size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImportClick(folder.id);
                          }}
                          className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Importar Arquivo"
                        >
                          <Upload size={18} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteFolder(e, folder.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir Pasta"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight
                          size={20}
                          className={`transition-transform duration-300 ml-2 ${isExpanded ? 'rotate-90 text-secondary' : 'text-gray-300'}`}
                        />
                      </div>
                    </div>

                    {isAddingLink === folder.id && (
                      <div className="bg-green-50/30 p-6 border-b border-green-100 animate-slide-down">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <input
                            placeholder="Nome do Sistema / Recurso"
                            value={linkData.name}
                            onChange={(e) => setLinkData({ ...linkData, name: e.target.value })}
                            className="bg-white border border-green-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-100 outline-none"
                          />
                          <div className="flex space-x-2">
                            <select
                              value={linkData.type}
                              onChange={(e) => setLinkData({ ...linkData, type: e.target.value })}
                              className="bg-white border border-green-200 rounded-xl px-3 py-2 text-sm outline-none"
                            >
                              <option value="link">Link Web</option>
                              <option value="network">Diretório Rede</option>
                            </select>
                            <input
                              placeholder="URL ou Caminho Rede"
                              value={linkData.url}
                              onChange={(e) => setLinkData({ ...linkData, url: e.target.value })}
                              className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-100 outline-none"
                            />
                          </div>
                        </div>
                        <textarea
                          placeholder="Descrição / Observações do acesso..."
                          value={linkData.description}
                          onChange={(e) =>
                            setLinkData({ ...linkData, description: e.target.value })
                          }
                          className="w-full bg-white border border-green-200 rounded-xl px-4 py-2 text-sm h-16 focus:ring-2 focus:ring-green-100 outline-none resize-none mb-4"
                        ></textarea>
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => setIsAddingLink(null)}
                            className="text-gray-500 text-sm font-bold px-4 py-2 hover:bg-gray-100 rounded-xl transition-all"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAddLink}
                            className="bg-green-600 text-white text-sm font-bold px-6 py-2 rounded-xl shadow-md hover:bg-green-700"
                          >
                            Adicionar Link
                          </button>
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="bg-white p-3 space-y-1 animate-slide-down">
                        {folder.children && folder.children.length > 0 ? (
                          folder.children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 group cursor-pointer border border-transparent hover:border-gray-100 transition-all"
                            >
                              <div className="flex items-start space-x-4">
                                <div
                                  className={`p-2.5 rounded-xl transition-all ${
                                    child.type === 'link'
                                      ? 'bg-green-50 text-green-500'
                                      : child.type === 'network'
                                        ? 'bg-purple-50 text-purple-500'
                                        : 'bg-blue-50 text-blue-500'
                                  }`}
                                >
                                  {getIcon(child.type)}
                                </div>
                                <div>
                                  <h4 className="text-[15px] font-bold text-gray-700 group-hover:text-secondary transition-colors">
                                    {child.name}
                                    {child.url && (
                                      <span className="ml-2 text-[11px] font-normal text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        ({child.url})
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-[13px] text-gray-500 mt-1 line-clamp-2 italic leading-tight">
                                    {child.description || 'Nenhuma descrição fornecida.'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                {child.type === 'link' || child.type === 'network' ? (
                                  <button className="bg-secondary text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 transition-transform uppercase tracking-wider">
                                    Acessar
                                  </button>
                                ) : (
                                  <button className="bg-gray-100 text-gray-600 text-[11px] font-extrabold px-3 py-1.5 rounded-lg hover:bg-secondary hover:text-white transition-all uppercase tracking-wider">
                                    Baixar
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-16 text-center text-gray-400">
                            <Upload size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm italic">
                              Arraste arquivos ou use os botões acima para popular esta pasta.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDocuments;
