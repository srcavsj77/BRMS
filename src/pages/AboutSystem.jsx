import React, { useState, useEffect } from 'react';
import {
  Activity, Shield, Database, Cpu, Server, GitBranch, Terminal,
  Code, Layers, Clock, CheckCircle, AlertTriangle, Settings,
  Link as LinkIcon, Users, Lock, BarChart3, Workflow,
  FileText, History, Box, Globe, ExternalLink, HardDrive, Network, Info
} from 'lucide-react';
// ============================================================================
// COMPONENTES AUXILIARES (UI KITS)
// ============================================================================
const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors[color]}`}>
      {children}
    </span>
  );
};

const SectionTitle = ({ icon: Icon, title, description }) => (
  <div className="mb-6 border-b border-gray-100 pb-4">
    <div className="flex items-center text-text-title mb-1">
      <Icon size={20} className="mr-2 text-secondary" />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    {description && <p className="text-sm text-gray-500 font-medium">{description}</p>}
  </div>
);

const DataBox = ({ label, value, icon: Icon, statusColor }) => (
  <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl hover:shadow-md transition-all">
    <div className="flex items-center text-gray-500 mb-2">
      {Icon && <Icon size={16} className="mr-2 opacity-70" />}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="flex items-center">
      {statusColor && (
        <div className={`w-2.5 h-2.5 rounded-full bg-${statusColor}-500 mr-2 shadow-sm shadow-${statusColor}-500/50`}></div>
      )}
      <span className="text-sm font-bold text-gray-800 break-words">{value}</span>
    </div>
  </div>
);

// ============================================================================
// CONTEÚDO DAS ABAS (TABS)
// ============================================================================

const TabGerais = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Info} title="Informações Gerais" description="Metadados principais e responsabilidades do BRMS-FGV." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DataBox label="Nome do Sistema" value="Business Rules Management System" icon={Box} />
      <DataBox label="Sigla" value="BRMS-FGV" icon={Terminal} />
      <DataBox label="Empresa / Instituição" value="Fundação Getulio Vargas" icon={Globe} />
      <DataBox label="Proprietário (Owner)" value="Diretoria de Tecnologia" icon={Users} />
      <DataBox label="Responsável Técnico" value="Arquitetura Enterprise" icon={Code} />
      <DataBox label="Product Owner" value="Comitê de Governança" icon={Settings} />
      <DataBox label="Status Operacional" value="Produção (Ativo)" icon={Activity} statusColor="green" />
      <DataBox label="SLA de Disponibilidade" value="99.9%" icon={Clock} />
    </div>
    <div className="mt-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
      <h4 className="text-xs font-bold uppercase text-blue-800 mb-2">Descrição Funcional</h4>
      <p className="text-sm text-blue-900 leading-relaxed">
        Plataforma centralizada para orquestração, governança e execução dinâmica de regras de negócios 
        e controle de acesso da instituição. Atua como middleware inteligente para os demais sistemas corporativos.
      </p>
    </div>
  </div>
);

const TabVersionamento = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={GitBranch} title="Versionamento" description="Controle de versões, builds e histórico de lançamentos." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DataBox label="Versão Atual" value="v2.4.0-enterprise" icon={Code} />
      <DataBox label="Build" value="#2026.05.12-4" icon={Terminal} />
      <DataBox label="Branch Principal" value="main" icon={GitBranch} />
      <DataBox label="Pipeline Atual" value="brms-ci-cd-prod" icon={Workflow} />
      <DataBox label="Commit Hash" value="52b173d" icon={Hash} />
      <DataBox label="Último Deploy" value="Hoje, às 10:45" icon={Clock} />
      <DataBox label="Estratégia Release" value="Blue/Green" icon={Layers} />
      <DataBox label="Status Build" value="Success" icon={CheckCircle} statusColor="green" />
    </div>
  </div>
);

const TabDatabase = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Database} title="Banco de Dados" description="Infraestrutura de persistência e conexões." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DataBox label="Tipo" value="Relacional" icon={Database} />
      <DataBox label="Engine" value="PostgreSQL 16.2" icon={Server} />
      <DataBox label="Ambiente" value="AWS RDS Cluster" icon={Globe} />
      <DataBox label="Schema" value="brms_prod_v2" icon={Layers} />
      <DataBox label="Status da Conexão" value="Conectado (Pool Ativo)" icon={Activity} statusColor="green" />
      <DataBox label="Latência Média" value="~12ms" icon={Clock} />
      <DataBox label="Conexões Ativas" value="45 / 500" icon={Network} />
      <DataBox label="Backup Automático" value="Diário (PITR 7 dias)" icon={HardDrive} />
      <DataBox label="Replicação" value="Multi-AZ (Síncrona)" icon={Box} />
    </div>
  </div>
);

const TabArquitetura = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Network} title="Arquitetura do Ecossistema" description="Diagrama arquitetural de alto nível." />
    
    <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <DataBox label="Padrão Arquitetural" value="Microsserviços / API-First" />
      <DataBox label="Infraestrutura" value="Containers (Docker / K8s)" />
      <DataBox label="Cloud Provider" value="AWS / On-Premise Híbrido" />
    </div>


  </div>
);

const TabStack = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Code} title="Stack Tecnológica" description="Principais frameworks e tecnologias adotadas." />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Frontend</h4>
        <div className="space-y-2">
          <Badge color="blue">React 18</Badge>
          <Badge color="blue">Vite</Badge>
          <Badge color="blue">Tailwind CSS</Badge>
          <Badge color="blue">Lucide Icons</Badge>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Backend</h4>
        <div className="space-y-2">
          <Badge color="green">Node.js</Badge>
          <Badge color="green">Express</Badge>
          <Badge color="green">JSON Web Token</Badge>
          <Badge color="green">Winston Logger</Badge>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">DevOps</h4>
        <div className="space-y-2">
          <Badge color="purple">Docker</Badge>
          <Badge color="purple">GitHub Actions</Badge>
          <Badge color="purple">Husky / GitHooks</Badge>
        </div>
      </div>
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Testes</h4>
        <div className="space-y-2">
          <Badge color="yellow">Vitest</Badge>
          <Badge color="yellow">Testing Library</Badge>
          <Badge color="yellow">ESLint / Prettier</Badge>
        </div>
      </div>
    </div>
  </div>
);

const TabSecurity = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Shield} title="Segurança & Compliance" description="Mecanismos de proteção e conformidade." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DataBox label="Autenticação" value="OAuth 2.0 / JWT" icon={Lock} />
      <DataBox label="Criptografia (Trânsito)" value="TLS 1.3" icon={Shield} />
      <DataBox label="Criptografia (Repouso)" value="AES-256" icon={HardDrive} />
      <DataBox label="Segurança API" value="Rate Limiting / WAF" icon={Network} />
      <DataBox label="Vulnerabilidades" value="0 Detectadas" icon={CheckCircle} statusColor="green" />
      <DataBox label="Secret Scanning" value="Ativo (GitHub)" icon={Activity} />
      <DataBox label="LGPD Compliance" value="Anonimização Ativa" icon={FileText} />
      <DataBox label="Auditoria (Logs)" value="Winston Estruturado" icon={Terminal} />
      <DataBox label="Dependabot" value="Configurado (Semanal)" icon={Box} />
    </div>
  </div>
);

const TabGovernanca = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={FileText} title="Governança Corporativa" description="Políticas, compliance e padrões do projeto." />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DataBox label="Estratégia Git" value="Trunk Based Development" icon={GitBranch} />
      <DataBox label="Padrão de Commits" value="Conventional Commits" icon={Terminal} />
      <DataBox label="Versionamento" value="Semantic Versioning (SemVer)" icon={Layers} />
      <DataBox label="CODEOWNERS" value="Configurado (Ativo)" icon={Users} />
      <DataBox label="ADRs" value="Documentadas no rep" icon={FileText} />
      <DataBox label="Proteção de Branch" value="Requer PR + Status Checks" icon={Shield} />
    </div>
  </div>
);

const TabRecursos = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={Box} title="Recursos do Sistema" description="Módulos e APIs ativas no BRMS." />
    <div className="space-y-3">
      <div className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
        <div>
          <h4 className="font-bold text-sm text-gray-800">Motor de Regras (Core)</h4>
          <p className="text-xs text-gray-500">Execução e avaliação de expressões lógicas</p>
        </div>
        <Badge color="green">Ativo</Badge>
      </div>
      <div className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
        <div>
          <h4 className="font-bold text-sm text-gray-800">Módulo de Auditoria</h4>
          <p className="text-xs text-gray-500">Rastreabilidade completa e logs estruturados</p>
        </div>
        <Badge color="green">Ativo</Badge>
      </div>
      <div className="p-4 border border-gray-100 rounded-lg flex justify-between items-center bg-gray-50">
        <div>
          <h4 className="font-bold text-sm text-gray-800">Controle de Acesso Dinâmico (RBAC)</h4>
          <p className="text-xs text-gray-500">Gestão de identidades e matriz de perfis</p>
        </div>
        <Badge color="green">Ativo</Badge>
      </div>
    </div>
  </div>
);

const TabHistorico = () => (
  <div className="animate-fade-in">
    <SectionTitle icon={History} title="Histórico do Sistema" description="Linha do tempo de marcos e evoluções." />
    <div className="space-y-4">
      <div className="border-l-2 border-secondary pl-4 pb-4">
        <h4 className="font-bold text-sm text-gray-800">Maio 2026 - Modernização Enterprise</h4>
        <p className="text-xs text-gray-500 mt-1">Implementação de CI/CD, DevSecOps, Observabilidade e Componentização Avançada.</p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4 pb-4">
        <h4 className="font-bold text-sm text-gray-800">Fevereiro 2026 - Auditoria Global</h4>
        <p className="text-xs text-gray-500 mt-1">Lançamento do módulo de relatórios analíticos de alterações.</p>
      </div>
      <div className="border-l-2 border-gray-200 pl-4">
        <h4 className="font-bold text-sm text-gray-800">Agosto 2025 - Início do Projeto</h4>
        <p className="text-xs text-gray-500 mt-1">Lançamento da versão MVP do hub centralizado de regras.</p>
      </div>
    </div>
  </div>
);

// Hash Icon Helper
const Hash = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/>
  </svg>
);


// ============================================================================
// COMPONENTE PRINCIPAL: GOVERNANCE DASHBOARD (AboutSystem)
// ============================================================================
const AboutSystem = () => {
  const [activeTab, setActiveTab] = useState('gerais');

  const [topMetrics, setTopMetrics] = useState([
    { label: 'Versão atual do sistema', val: 'v2.4.0', color: 'gray' },
  ]);

  const tabs = [
    { id: 'gerais', label: 'Gerais', icon: Info },
    { id: 'versionamento', label: 'Versionamento', icon: GitBranch },
    { id: 'banco', label: 'Banco de Dados', icon: Database },
    { id: 'arquitetura', label: 'Arquitetura', icon: Network },
    { id: 'stack', label: 'Stack Tech', icon: Code },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'governanca', label: 'Governança', icon: FileText },
    { id: 'recursos', label: 'Recursos', icon: Box },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  return (
    <div className="bg-white rounded-card shadow-card border border-gray-100 flex flex-col min-h-[85vh] overflow-hidden">
      
      {/* HEADER CORPORATIVO */}
      <div className="p-8 border-b border-gray-100 relative overflow-hidden bg-gradient-to-r from-gray-50 to-white">
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center space-x-5 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <Cpu size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 mb-1">BRMS-FGV Governance & Monitoring Dashboard</h1>
              <div className="text-xs text-gray-500 font-medium flex items-center mt-1">
                <Clock size={14} className="mr-1.5" /> Atualizado: {new Date().toLocaleString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP CARDS (RESUMO) */}
      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 overflow-x-auto custom-scrollbar">
        <div className="flex space-x-4 min-w-max pb-2">
          {/* Card Simples inline */}
          {topMetrics.map((c, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center space-x-3 shadow-sm min-w-[140px]">
              <div className={`w-2 h-2 rounded-full bg-${c.color}-500 shadow-sm shadow-${c.color}-500/50`}></div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">{c.label}</p>
                <p className="text-sm font-black text-gray-800 leading-none">{c.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS E CONTEÚDO */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Menu Lateral de Abas (Vertical on Desktop, Horizontal scroll on Mobile) */}
        <div className="lg:w-64 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto custom-scrollbar flex lg:flex-col p-4 space-x-2 lg:space-x-0 lg:space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 rounded-lg text-sm transition-all whitespace-nowrap lg:whitespace-normal font-semibold ${
                activeTab === tab.id 
                  ? 'bg-white text-secondary shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-transparent'
              }`}
            >
              <tab.icon size={16} className={`mr-3 ${activeTab === tab.id ? 'text-secondary' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Área de Conteúdo da Aba */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === 'gerais' && <TabGerais />}
          {activeTab === 'versionamento' && <TabVersionamento />}
          {activeTab === 'banco' && <TabDatabase />}
          {activeTab === 'arquitetura' && <TabArquitetura />}
          {activeTab === 'stack' && <TabStack />}
          {activeTab === 'seguranca' && <TabSecurity />}
          {activeTab === 'governanca' && <TabGovernanca />}
          {activeTab === 'recursos' && <TabRecursos />}
          {activeTab === 'historico' && <TabHistorico />}
        </div>
      </div>
    </div>
  );
};

export default AboutSystem;
