const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'brms_fgv_super_secret_key_2026';

const logger = require('../config/logger');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware de Segurança Global: Prevenção contra SQL/NoSQL Injection
const sqlInjectionPattern = /(\b(UPDATE|DELETE|INSERT|DROP|TRUNCATE)\b\s+.*|(\bOR\b\s+\d+\s*=\s*\d+))/i;

const preventInjection = (req, res, next) => {
  const detectInjection = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        if (sqlInjectionPattern.test(obj[key])) return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (detectInjection(obj[key])) return true;
      }
    }
    return false;
  };

  if (req.body && detectInjection(req.body)) {
    logger.warn(`[Segurança] Bloqueada tentativa de injeção do IP: ${req.ip}`);
    return res.status(403).json({ error: '🚨 Acesso Negado: Tentativa de injeção de código ou caracteres maliciosos detectada.' });
  }
  next();
};

app.use(preventInjection);

const dbFile = path.join(__dirname, '../db.json');

// Initialize db with mock data if it doesn't exist
if (!fs.existsSync(dbFile)) {
  const INITIAL_RULES = [
    { id_regra: 'RULE-001', nome: 'Elegibilidade de Bolsista', versao: '1.2.0', descricao: 'Valida se o aluno possui os requisitos para bolsa', sistema: 'SGC', usuario: 'carlos.junior', criacao: '10/01/2026', modificacao: '15/03/2026', status: 'Ativo', vigencia_inicio: '2026-01-01', vigencia_fim: '2026-12-31' },
    { id_regra: 'RULE-002', nome: 'Cálculo de Desconto Antecipação', versao: '1.0.5', descricao: 'Aplica 10% de desconto para pagamentos até o dia 05', sistema: 'Financeiro', usuario: 'ana.silva', criacao: '22/02/2026', modificacao: '01/03/2026', status: 'Ativo', vigencia_inicio: '2026-01-01', vigencia_fim: '2026-03-15' },
    { id_regra: 'RULE-005', nome: 'Bloqueio Inadimplência', versao: '2.1.0', descricao: 'Bloqueia acesso ao portal para dívidas > 60 dias', sistema: 'Portal Aluno', usuario: 'roberto.oliveira', criacao: '05/12/2025', modificacao: '12/03/2026', status: 'Ativo', vigencia_inicio: '2026-01-01', vigencia_fim: '2026-06-30' },
  ];

  const INITIAL_AUDIT_DATA = [
    { id: 1, data: '18/03/2026', hora: '14:20', usuario: 'carlos.junior', regra_id: 'RULE-001', alteracao: 'Alteração na descrição funcional para incluir novos critérios de bolsa', status: 'Alterado' },
    { id: 2, data: '18/03/2026', hora: '11:45', usuario: 'ana.silva', regra_id: 'RULE-005', alteracao: 'Conflito detectado: Descrição funcional sobrepõe critérios da RULE-012', status: 'Conflito' },
    { id: 100, data: '15/04/2026', hora: '11:45', usuario: 'antigravity', regra_id: 'SISTEMA v1.2', alteracao: 'Compilação e deploy da versão 1.2: Melhoria visual com Checkbox verde na seleção de perfis e refinamento de UX.', status: 'Versão' },
    { id: 101, data: '15/04/2026', hora: '11:30', usuario: 'antigravity', regra_id: 'SEGURANÇA', alteracao: 'Tarefa 2: Implementação de Modo de Leitura restrito (RBAC) para Monitoramento e Gestão de Usuários.', status: 'Melhoria' },
    { id: 102, data: '15/04/2026', hora: '11:15', usuario: 'antigravity', regra_id: 'AUDITORIA', alteracao: 'Tarefa 3: Adição de KPIs e gráficos de distribuição de status para simplificar a análise de regras.', status: 'Ajuste' },
  ];

  const DEFAULT_PERMISSIONS = {
    admin: ['Dashboard', 'Criar regra', 'Listar / Editar regras', 'Alterações realizadas', 'Cadastrar sistema', 'Documentos', 'Monitoramento', 'Usuários', 'Manutenção de perfil'],
    editor: ['Dashboard', 'Criar regra', 'Listar / Editar regras', 'Alterações realizadas', 'Cadastrar sistema', 'Documentos'],
    viewer: ['Dashboard', 'Listar / Editar regras', 'Alterações realizadas', 'Documentos']
  };

  const ROLE_DESCRIPTIONS = {
    admin: 'Acesso irrestrito a todos os módulos, configurações de segurança, manutenção de perfis e auditoria técnica do sistema BRMS.',
    editor: 'Permite criação e edição de regras, aprovação de rascunhos, cadastro de novos sistemas satélites e gestão de documentos.',
    viewer: 'Acesso apenas de leitura aos dashboards de regras, histórico de auditoria e repositório de documentos. Bloqueado para edições.',
    blocked: 'Usuário desativado ou suspenso temporariamente. Sem acesso ao sistema.'
  };

  const INITIAL_PROFILES = [
    { id: 'admin', name: 'Administrador', description: ROLE_DESCRIPTIONS.admin, status: 'Ativo', permissions: DEFAULT_PERMISSIONS.admin },
    { id: 'editor', name: 'Editor', description: ROLE_DESCRIPTIONS.editor, status: 'Ativo', permissions: DEFAULT_PERMISSIONS.editor },
    { id: 'viewer', name: 'Leitor / Auditor', description: ROLE_DESCRIPTIONS.viewer, status: 'Ativo', permissions: DEFAULT_PERMISSIONS.viewer },
    { id: 'blocked', name: 'Bloqueado', description: ROLE_DESCRIPTIONS.blocked, status: 'Ativo', permissions: [] },
  ];

  const DEFAULT_USERS = [
    { id: 1, name: 'Roberto Administrator', role: 'admin', email: 'roberto@fgv.br', status: 'Ativo' },
    { id: 2, name: 'João Usuário', role: 'editor', email: 'joao@fgv.br', status: 'Ativo' },
    { id: 3, name: 'Maria Editora', role: 'editor', email: 'maria@fgv.br', status: 'Ativo' },
    { id: 4, name: 'Pedro Viewer', role: 'viewer', email: 'pedro@fgv.br', status: 'Ativo' },
  ];

  const INITIAL_SYSTEMS = [
    { nome: 'SGC', versao: '1.2.0', modulos: 'Bolsas, Matrícula, Acadêmico', descricao: 'Sistema de Gestão de Candidatos' },
    { nome: 'Financeiro', versao: '2.0.5', modulos: 'Contas a Pagar, Contas a Receber, Tesouraria', descricao: 'Gestão Financeira Central' },
    { nome: 'Portal Aluno', versao: '3.1.0', modulos: 'Notas, Frequência, Requerimentos', descricao: 'Interface do Estudante' }
  ];

  fs.writeFileSync(dbFile, JSON.stringify({
    regras: INITIAL_RULES,
    eventosAuditoria: INITIAL_AUDIT_DATA,
    systems: INITIAL_SYSTEMS,
    profilesList: INITIAL_PROFILES,
    usersList: DEFAULT_USERS
  }, null, 2));
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    
    // Buscar usuário pelo nome (no protótipo, o username é o nome completo)
    const user = data.usersList.find(u => u.name === username);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    if (user.status === 'Bloqueado') {
      return res.status(403).json({ error: 'Usuário bloqueado. Contate o administrador.' });
    }

    // Verificar se o perfil está inativo
    const profile = data.profilesList.find(p => p.id === user.role);
    if (profile && profile.status === 'Inativo') {
      return res.status(403).json({ error: `O perfil "${profile.name}" está inativo.` });
    }

    // Se o usuário não tem senha cadastrada (fallback de segurança)
    if (!user.password) {
       return res.status(401).json({ error: 'Conta sem senha cadastrada. Procure o administrador.' });
    }

    // Comparar a senha
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas. Tente novamente.' });
    }

    // Gerar token (expira em 8 horas)
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

    // Retornar usuário (sem a senha) e o token
    const userResponse = { ...user };
    delete userResponse.password;
    
    res.json({ user: userResponse, token });

  } catch (error) {
    logger.error('Erro na autenticação: ', error);
    res.status(500).json({ error: 'Erro no servidor de autenticação.' });
  }
});

app.get('/api/public/users', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const publicUsers = (data.usersList || []).map(u => ({ id: u.id, name: u.name, role: u.role, email: u.email }));
    res.json(publicUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read public users data' });
  }
});

app.get('/api/data', authenticateToken, (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    
    // Não enviar as senhas para o frontend por segurança!
    if (data.usersList) {
      data.usersList = data.usersList.map(u => {
        const safeUser = { ...u };
        delete safeUser.password;
        return safeUser;
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read database' });
  }
});

app.post('/api/save', authenticateToken, (req, res) => {
  try {
    // Write new data
    // Precisamos manter as senhas que estão no db.json, pois o frontend não as envia mais (ou envia vazias)
    const existingData = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
    const newData = req.body;
    
    if (newData.usersList) {
       newData.usersList = newData.usersList.map(newUser => {
         const oldUser = existingData.usersList.find(u => u.id === newUser.id);
         if (oldUser) {
           // Se a senha não veio ou veio em branco, mantemos a antiga
           if (!newUser.password || newUser.password === '••••••••') {
             newUser.password = oldUser.password;
           } else {
             // Se veio uma nova senha (ex: Admin resetando), idealmente deveríamos encriptar aqui.
             // Para o escopo atual, assumimos que o hash ocorreu, mas como é um protótipo, podemos apenas salvar
             // Nota: Se a alteração de senha fosse real, o bcrypt.hash deveria acontecer aqui.
             const salt = bcrypt.genSaltSync(10);
             newUser.password = bcrypt.hashSync(newUser.password, salt);
           }
         }
         return newUser;
       });
    }

    fs.writeFileSync(dbFile, JSON.stringify(newData, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`[BRMS-FGV Backend] Server running on http://0.0.0.0:${PORT}`);
});
