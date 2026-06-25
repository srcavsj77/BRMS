import React, { useState } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  Trash2,
  RotateCw,
  Lock,
} from 'lucide-react';
import { checkPermission } from '../utils/permissions';

const AuditChanges = ({ onEdit, regras, auditData = [], triggerExpiracao, onApproveExclusao, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const processadoRef = React.useRef(false);

  // Permissões
  const canRefresh = checkPermission(currentUser, 'Auditoria');
  const canEdit = checkPermission(currentUser, 'Editar regra');
  const canApprove = currentUser?.role === 'admin';

  // Aciona a sincronização automática ao entrar na tela para garantir dados frescos
  React.useEffect(() => {
    if (triggerExpiracao && !processadoRef.current) {
      processadoRef.current = true;
      triggerExpiracao();
    }
  }, [triggerExpiracao]);

  const handleRefresh = () => {
    if (!canRefresh) return;
    if (triggerExpiracao) {
      const resultado = triggerExpiracao();
      if (resultado.novosEventosCount > 0 || resultado.alteradasCount > 0) {
        setNotification({
          message: `Sincronização completa realizada: ${resultado.alteradasCount} status de regras validados e ${resultado.novosEventosCount} novos registros automáticos gerados.`,
          type: 'success',
        });
      } else {
        setNotification({
          message: 'O ecossistema já está totalmente sincronizado.',
          type: 'info',
        });
      }
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredData = auditData.filter(
    (item) =>
      item.regra_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alteracao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (item) => {
    if (!canEdit) return;
    const ruleData = {
      id_regra: item.regra_id,
      nome: item.regra_id.startsWith('RULE-001')
        ? 'Elegibilidade de Bolsista'
        : item.regra_id.startsWith('RULE-005')
          ? 'Bloqueio Inadimplência'
          : 'Regra de Negócio Auditada',
      versao: '1.0.0',
      descricao: item.alteracao,
      sistema: 'SGC',
      usuario: item.usuario,
      criacao: item.data,
      modificacao: item.data,
      status: item.status === 'Conflito' ? 'Pendente' : 'Ativo',
    };
    if (onEdit) onEdit(ruleData);
  };

  const handleApproveClick = (item) => {
    if (!canApprove) {
      alert('Ação restrita a administradores.');
      return;
    }
    setSelectedItem(item);
    setShowModal(true);
  };

  const confirmAction = (choice) => {
    if (!canApprove) return;
    if (choice === 'Sim' && selectedItem) {
      if (onApproveExclusao) {
        onApproveExclusao(selectedItem.id, selectedItem.regra_id);
      }
      setNotification({
        message: `Exclusão definitiva da regra ${selectedItem.regra_id} aprovada com sucesso.`,
        type: 'success',
      });
      setTimeout(() => setNotification(null), 3000);
    }
    setShowModal(false);
    setSelectedItem(null);
  };

  // Estatísticas para os "Gráficos" simplificados
  const stats = {
    total: auditData.length,
    alterado: auditData.filter((i) => i.status === 'Alterado' || i.status === 'Conflito').length,
    excluido: auditData.filter((i) => i.status === 'Excluída').length,
    novo: auditData.filter((i) => i.status === 'Novo').length,
  };

  const statusColors = {
    alterado: 'bg-yellow-500',
    excluido: 'bg-red-500',
    novo: 'bg-green-500',
    other: 'bg-blue-500',
  };

  return (
    <div className="animate-fade-in space-y-6 relative">
      {/* Notifications */}
      {notification && (
        <div
          className={`fixed top-24 right-8 z-[100] p-4 rounded-lg shadow-xl border-l-4 flex items-center space-x-3 animate-slide-in-right ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-500 text-green-800'
              : 'bg-blue-50 border-blue-500 text-blue-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-title tracking-tight">
              Alterações Realizadas
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Rastreamento completo de modificações e conflitos no ecossistema.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
          <Clock size={16} />
          <span>
            Última atualização: Hoje às{' '}
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* KPI Cards & Simplified Graphics (Tarefa 3) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Total de Eventos
            </p>
            <h3 className="text-2xl font-black text-primary">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
            <ClipboardCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Alterações/Conflitos
            </p>
            <h3 className="text-2xl font-black text-yellow-600">{stats.alterado}</h3>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-500 rounded-lg">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Exclusões Realizadas
            </p>
            <h3 className="text-2xl font-black text-red-600">{stats.excluido}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-500 rounded-lg">
            <Trash2 size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
            Distribuição de Status
          </p>
          <div className="w-full h-8 bg-gray-100 rounded-lg flex overflow-hidden p-1 gap-0.5">
            <div
              className="h-full bg-yellow-400 rounded-l"
              style={{ width: `${(stats.alterado / stats.total) * 100}%` }}
              title="Alterações"
            ></div>
            <div
              className="h-full bg-red-400"
              style={{ width: `${(stats.excluido / stats.total) * 100}%` }}
              title="Exclusões"
            ></div>
            <div
              className="h-full bg-green-400"
              style={{ width: `${(stats.novo / stats.total) * 100}%` }}
              title="Novos"
            ></div>
            <div className="h-full bg-blue-400 rounded-r flex-1" title="Outros"></div>
          </div>
          <div className="flex justify-between mt-2">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Alt</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Exc</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Nov</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por ID da regra, usuário ou descrição..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleRefresh}
          disabled={!canRefresh}
          className={`flex items-center space-x-2 px-6 h-[30px] rounded-lg transition-all font-black shadow-md text-[12px] uppercase tracking-widest leading-none outline-none ${
            canRefresh
              ? 'bg-secondary text-white hover:bg-secondary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
          }`}
          title={!canRefresh ? 'Você não tem permissão para sincronizar auditoria.' : ''}
        >
          {!canRefresh && <Lock size={14} />}
          <RotateCw size={16} />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Grid de resultados */}
      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-secondary transition-colors">
                    <span>Data / Hora</span>
                    <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Usuário
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  ID da Regra
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-1/4">
                  Alteração Realizada
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center border-l border-gray-100 whitespace-nowrap">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text-title">{item.data}</span>
                      <span className="text-xs text-gray-400">{item.hora}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${item.usuario === 'sistema' ? 'bg-gray-400' : 'bg-primary'}`}
                      >
                        {item.usuario.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{item.usuario}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-secondary/5 text-secondary text-xs font-bold rounded border border-secondary/10 font-mono">
                      {item.regra_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-2 italic group-hover:line-clamp-none transition-all">
                      "{item.alteracao}"
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      {item.status === 'Alterado' || item.status === 'Conflito' ? (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-[11px] font-bold uppercase tracking-wider">
                            {item.status === 'Conflito' ? 'Conflito Funcional' : 'Alterada'}
                          </span>
                        </div>
                      ) : item.status === 'Excluída' ? (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-700 rounded-full border border-red-100">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-[11px] font-bold uppercase tracking-wider font-bold">
                            Excluída
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-[11px] font-bold uppercase tracking-wider font-bold">
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-l border-gray-100 whitespace-nowrap">
                    <div className="flex justify-center space-x-2">
                      {item.status === 'Excluída' ? (
                        <button
                          onClick={() => handleApproveClick(item)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-xs font-bold border ${
                            canApprove
                              ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent hover:text-white'
                              : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                          }`}
                          title={
                            !canApprove
                              ? 'Aprovação restrita a administradores.'
                              : 'Aprovar exclusão definitiva'
                          }
                        >
                          {!canApprove && <Lock size={12} />}
                          <CheckCircle size={14} />
                          <span>Aprovação</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEditClick(item)}
                          disabled={!canEdit}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-all text-xs font-bold border ${
                            canEdit
                              ? 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-600 hover:text-white'
                              : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                          }`}
                        >
                          {!canEdit && <Lock size={12} />}
                          <Edit size={14} />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <AlertTriangle size={48} className="mb-4 opacity-20" />
            <p className="font-medium">Nenhuma alteração encontrada para os critérios de busca.</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center font-medium">
          <span>Exibindo {filteredData.length} registros de auditoria centralizada</span>
          <span>© 2026 BRMS Ecosystem v1.2</span>
        </div>
      </div>

      {/* Approval Modal (Refactor to use checkPermission ideally, but keeping it simple for now) */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-white/20">
            <div className="bg-primary p-6 text-white flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                <Trash2 size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Aprovação de Exclusão</h3>
                <p className="text-xs text-white/70">Confirmação de Administrador necessária.</p>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-6 leading-relaxed">
                Você deseja confirmar a exclusão definitiva da regra{' '}
                <span className="font-bold text-text-title">{selectedItem?.regra_id}</span> do
                sistema? Esta ação é irreversível.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => confirmAction('Sim')}
                  className="flex-1 flex items-center justify-center px-4 h-[30px] bg-secondary text-white rounded-lg font-black text-[12px] hover:bg-secondary/90 transition-all shadow-md shadow-secondary/10 active:scale-95 uppercase tracking-widest leading-none outline-none"
                >
                  <CheckCircle size={16} className="mr-2" /> Sim
                </button>
                <button
                  onClick={() => confirmAction('Não')}
                  className="flex items-center justify-center px-4 h-[30px] border border-gray-300 text-gray-400 rounded-lg text-[12px] font-black hover:bg-gray-50 transition-all hover:border-gray-400 uppercase tracking-widest leading-none outline-none"
                >
                  <XCircle size={16} className="mr-2" /> Não
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-6 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Cancelar operação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditChanges;
