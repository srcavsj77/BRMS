# Módulo: Controle de Acesso (RBAC)

## Objetivo
Garantir que apenas usuários autorizados acessem funcionalidades específicas, baseando-se em perfis pré-definidos.

## Funcionalidades
- **Gestão de Usuários**: Cadastro, bloqueio e atribuição de cargos.
- **Manutenção de Perfis**: Definição de permissões por menu (Home, Regras, Auditoria, etc).
- **Autenticação**: Login seguro com JWT.

## Componentes Principais
- `UsersManagement.jsx`: Tela de CRUD de usuários.
- `ProfileMaintenance.jsx`: Gestão de permissões por perfil.
- `Login.jsx`: Interface de autenticação.
- `permissions.js`: Utilitário central de lógica de permissões.

## APIs Utilizadas
- `POST /api/auth/login`: Autenticação.
- `GET /api/public/users`: Listagem pública para login.
- `POST /api/save`: Persistência de alterações em perfis/usuários.

## Tabelas Relacionadas
- `usersList`: Armazena dados dos usuários e hashes de senha.
- `profilesList`: Armazena as permissões associadas a cada Role.
