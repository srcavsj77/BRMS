import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Filter,
  Calendar,
  Activity,
  Database,
  AlertCircle,
  FileText,
  CheckCircle,
  X,
  XCircle,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const COLORS = ['#153A6A', '#205A9C', '#A1C6E8', '#FF6600', '#FF3333', '#4CAF50'];

const availableFiltersList = [
  { key: 'id_regra', label: 'ID' },
  { key: 'nome', label: 'Nome' },
  { key: 'sistema', label: 'Sistema' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'criacao', label: 'Data de Criação' },
  { key: 'modificacao', label: 'Data de Modificação' },
  { key: 'status', label: 'Status' },
];

const AuditReports = ({ regras = [], auditData = [] }) => {
  const [filters, setFilters] = useState({
    id_regra: '',
    nome: '',
    versao: '',
    descricao: '',
    sistema: '',
    usuario: '',
    criacao: '',
    modificacao: '',
    status: '',
  });

  const [activeFilters, setActiveFilters] = useState([]);

  const filterOptions = useMemo(() => {
    const options = {};
    availableFiltersList.forEach((f) => {
      // Extrai valores únicos não vazios para cada campo
      const distinctVals = [
        ...new Set(
          regras.map((r) => r[f.key]).filter((v) => v !== undefined && v !== null && v !== '')
        ),
      ];
      options[f.key] = distinctVals;
    });
    return options;
  }, [regras]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const removeFilter = (key) => {
    setActiveFilters((prev) => prev.filter((f) => f !== key));
    handleFilterChange(key, '');
  };

  const filteredRegras = useMemo(() => {
    return regras.filter((r) => {
      return activeFilters.every((key) => {
        const filterVal = filters[key];
        if (!filterVal) return true; // ignore empty
        return r[key] != null && r[key].toString() === filterVal;
      });
    });
  }, [regras, filters, activeFilters]);

  const total = filteredRegras.length;
  const ativos = filteredRegras.filter((r) => r.status === 'Ativo').length;
  const sistemasAtivos = new Set(filteredRegras.map((r) => r.sistema)).size;
  const issues = filteredRegras.filter(
    (r) => r.status === 'Expirada' || r.status === 'Conflito'
  ).length;
  const inativas = filteredRegras.filter((r) => r.status === 'Inativa').length;
  const excluidas = filteredRegras.filter((r) => r.status === 'Excluída').length;
  const emConflito = filteredRegras.filter((r) => r.status === 'Conflito').length;

  const regrasPorSistema = useMemo(() => {
    const count = {};
    filteredRegras.forEach((r) => {
      count[r.sistema] = (count[r.sistema] || 0) + 1;
    });
    return Object.keys(count).map((k) => ({ name: k, Quantidade: count[k] }));
  }, [filteredRegras]);

  const evolucaoMensal = useMemo(() => {
    const count = {};
    filteredRegras.forEach((r) => {
      const parts = r.criacao.split('/');
      if (parts.length === 3) {
        const m = `${parts[1]}/${parts[2]}`;
        count[m] = (count[m] || 0) + 1;
      }
    });
    return Object.keys(count)
      .sort()
      .map((k) => ({ name: k, Novas: count[k] }));
  }, [filteredRegras]);

  const statusData = useMemo(() => {
    const count = {};
    filteredRegras.forEach((r) => {
      count[r.status] = (count[r.status] || 0) + 1;
    });
    return Object.keys(count).map((k) => ({ name: k, value: count[k] }));
  }, [filteredRegras]);

  const criticidadeData = useMemo(() => {
    const count = { 'Alta': 0, 'Média': 0, 'Baixa': 0 };
    filteredRegras.forEach((r) => {
      const crit = r.criticidade || 'Média';
      count[crit] = (count[crit] || 0) + 1;
    });
    return Object.keys(count).map((k) => ({ name: k, Quantidade: count[k] }));
  }, [filteredRegras]);

  return (
    <div className="animate-fade-in pb-10">
      {/* HEADER E KPIS */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-6 flex items-center gap-2">
          <Activity className="text-secondary" />
          Dashboard Regras de Negócio
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <div className="bg-gradient-to-br from-white to-primary/5 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-primary hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-primary/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Total
              </p>
              <p className="text-2xl font-black text-primary">{total}</p>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <FileText size={18} className="text-primary" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-100/30 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[#4CAF50] hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-green-500/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Ativas
              </p>
              <p className="text-2xl font-black text-[#4CAF50]">{ativos}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-full">
              <CheckCircle size={18} className="text-[#4CAF50]" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-100/30 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-secondary hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-secondary/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Sistemas Ativos
              </p>
              <p className="text-2xl font-black text-secondary">{sistemasAtivos}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-full">
              <Database size={18} className="text-secondary" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-100/30 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-[#FF3333] hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-red-500/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Alertas
              </p>
              <p className="text-2xl font-black text-[#FF3333]">{issues}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-full">
              <AlertCircle size={18} className="text-[#FF3333]" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-100/40 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-gray-400 hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-gray-400/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Inativas
              </p>
              <p className="text-2xl font-black text-gray-500">{inativas}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full">
              <XCircle size={18} className="text-gray-500" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-red-100/20 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-red-800 hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-red-800/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Excluídas
              </p>
              <p className="text-2xl font-black text-red-800">{excluidas}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-full">
              <Trash2 size={18} className="text-red-800" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-orange-100/30 p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between border-l-4 border-l-orange-500 hover:-translate-y-1 hover:scale-102 hover:shadow-md hover:shadow-orange-500/5 transition-all duration-300">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                Conflito
              </p>
              <p className="text-2xl font-black text-orange-500">{emConflito}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-full">
              <AlertTriangle size={18} className="text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS E DISTRIBUIÇÃO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex flex-col lg:flex-row gap-8 min-h-[320px]">
        {/* Seção de Filtros (Esquerda) */}
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="font-bold text-primary flex items-center gap-2 mb-4">
              <Filter size={18} className="text-secondary" /> Selecione os Filtros
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {availableFiltersList.map((f) => {
                const isActive = activeFilters.includes(f.key);
                return (
                  <label
                    key={f.key}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors select-none ${isActive ? 'bg-secondary/10 border-secondary/30 text-secondary' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                  >
                    <input
                      type="checkbox"
                      className="rounded text-secondary focus:ring-secondary/20 cursor-pointer border-gray-300 w-3.5 h-3.5"
                      checked={isActive}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveFilters([...activeFilters, f.key]);
                        } else {
                          removeFilter(f.key);
                        }
                      }}
                    />
                    {f.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeFilters.map((key) => {
                const filterDef = availableFiltersList.find((f) => f.key === key);
                return (
                  <div
                    key={key}
                    className="relative group bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      {filterDef.label}
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-secondary/20"
                        value={filters[key] || ''}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                      >
                        <option value="">Todos</option>
                        {(filterOptions[key] || []).map((val) => (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeFilter(key)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover filtro"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {activeFilters.length === 0 && (
              <div className="text-sm text-gray-400 italic text-center py-10 bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                Nenhum filtro ativo. Adicione um para segmentar os dados.
              </div>
            )}
          </div>
        </div>

        {/* Mini-Gráfico Status (Direita) */}
        <div className="w-full lg:w-[350px] flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">
            Distribuição de Saúde
          </h3>
          <div className="h-[150px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    padding: '10px 15px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#153A6A' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Lenda customizada abaixo */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {statusData.map((entry, idx) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                ></div>
                {entry.name} <span className="text-gray-400">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* GRÁFICOS INFERIORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <h2 className="font-bold text-primary mb-6 flex items-center gap-2">
            <Database size={18} className="text-secondary" /> Volume de Regras por Sistema
          </h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regrasPorSistema}
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(21, 58, 106, 0.03)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '10px 15px',
                  }}
                  itemStyle={{ fontWeight: 'bold', color: '#153A6A' }}
                  labelStyle={{
                    color: '#888',
                    marginBottom: '5px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                />
                <Bar dataKey="Quantidade" fill="#205A9C" radius={[6, 6, 0, 0]} barSize={45}>
                  {regrasPorSistema.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % 2 === 0 ? 0 : 1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <h2 className="font-bold text-primary mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-secondary" /> Evolução de Criação (Mensal)
          </h2>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucaoMensal} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(161, 198, 232, 0.15)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '10px 15px',
                  }}
                  itemStyle={{ fontWeight: 'bold', color: '#153A6A' }}
                  labelStyle={{
                    color: '#888',
                    marginBottom: '5px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                />
                <Bar dataKey="Novas" fill="#A1C6E8" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SEÇÃO INFERIOR: CRITICIDADE E ATIVIDADES RECENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Distribuição por Criticidade */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <h2 className="font-bold text-primary mb-6 flex items-center gap-2">
            <AlertCircle size={18} className="text-secondary" /> Distribuição por Criticidade
          </h2>
          <div className="flex-1 w-full font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={criticidadeData}
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255, 102, 0, 0.03)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    padding: '10px 15px',
                  }}
                  itemStyle={{ fontWeight: 'bold', color: '#153A6A' }}
                  labelStyle={{
                    color: '#888',
                    marginBottom: '5px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                />
                <Bar dataKey="Quantidade" fill="#FF6600" radius={[6, 6, 0, 0]} barSize={45}>
                  {criticidadeData.map((entry, index) => {
                    const cColors = ['#FF3333', '#FF6600', '#4CAF50']; // Alta (Red), Média (Orange), Baixa (Green)
                    let barColor = '#205A9C';
                    if (entry.name === 'Alta') barColor = cColors[0];
                    else if (entry.name === 'Média') barColor = cColors[1];
                    else if (entry.name === 'Baixa') barColor = cColors[2];
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividades Recentes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[320px] flex flex-col hover:-translate-y-1 transition-transform duration-300">
          <h2 className="font-bold text-primary mb-4 flex items-center gap-2">
            <Activity size={18} className="text-secondary" /> Atividades Recentes
          </h2>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3.5">
            {(() => {
              const latestEvents = (auditData || []).slice(0, 5);
              if (latestEvents.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
                    Nenhuma atividade recente registrada no log de auditoria.
                  </div>
                );
              }

              return latestEvents.map((evt, idx) => {
                let badgeColor = 'bg-gray-100 text-gray-700';
                if (evt.status === 'Novo' || evt.status === 'Ativo') badgeColor = 'bg-green-50 text-green-700 border border-green-100';
                else if (evt.status === 'Alterado') badgeColor = 'bg-blue-50 text-blue-700 border border-blue-100';
                else if (evt.status === 'Excluída' || evt.status === 'Expirada') badgeColor = 'bg-red-50 text-red-700 border border-red-100';
                else if (evt.status === 'Ajuste') badgeColor = 'bg-purple-50 text-purple-700 border border-purple-100';

                return (
                  <div key={evt.id || idx} className="flex items-start space-x-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 mt-0.5 ${badgeColor}`}>
                      {evt.status}
                    </span>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-bold text-gray-700 truncate">{evt.alteracao}</p>
                      <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span>Regra: <strong className="font-mono text-secondary">{evt.regra_id}</strong></span>
                        <span>•</span>
                        <span>Usuário: <strong>{evt.usuario}</strong></span>
                      </p>
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold shrink-0 text-right">
                      <div>{evt.data}</div>
                      <div className="text-[9px] font-normal">{evt.hora}</div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReports;
