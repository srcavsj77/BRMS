# Módulos do Sistema BRMS-FGV

A aplicação é dividida em módulos funcionais independentes que compartilham o estado central via `App.jsx`.

## Lista de Módulos

### 1. [Dashboard](dashboard.md)
Visualização executiva da saúde das regras e logs de auditoria.

### 2. [Gestão de Regras (CRUD)](regras.md)
Interface para criação, edição e listagem de regras de negócio.

### 3. [Auditoria e Rastreabilidade](auditoria.md)
Log completo de alterações (quem, quando, o quê).

### 4. [Controle de Acesso (RBAC)](rbac.md)
Gestão de usuários, perfis e permissões granulares.

### 5. [Monitoramento](monitoramento.md)
Serviço de background para validação de integridade e vigência.

### 6. [Conformidade e Documentos](compliance.md)
Repositório central de documentos normativos e técnicos.

### 7. [Catálogo de Sistemas](sistemas.md)
Gestão de sistemas satélites que consomem as regras do BRMS.
