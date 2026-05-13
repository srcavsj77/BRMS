# Estrutura de Dados - BRMS-FGV

O projeto utiliza atualmente uma abordagem de **Flat-File Database** (Mock persistente) para agilidade no protótipo, centralizada no arquivo `db.json`.

## Entidades Principais

### 1. Regras (`regras`)
Armazena a lógica e metadados das regras de negócio.
- `id_regra`: Identificador único (ex: RULE-001).
- `nome`: Nome descritivo.
- `versao`: Versão semântica.
- `status`: Ativo, Expirado, Conflito, Rascunho.
- `vigencia_inicio` / `vigencia_fim`: Datas de validade.

### 2. Auditoria (`eventosAuditoria`)
Log imutável de ações no sistema.
- `usuario`: Nome do executor.
- `alteracao`: Descrição textual da mudança.
- `data` / `hora`: Timestamp da ação.

### 3. Usuários (`usersList`)
Cadastro de operadores do sistema.
- `name`: Nome completo (usado como login).
- `role`: Perfil associado (admin, editor, viewer).
- `password`: Hash Bcrypt da senha.

### 4. Perfis (`profilesList`)
Configuração de acessibilidade.
- `id`: Chave do perfil.
- `permissions`: Array de strings contendo os nomes dos menus permitidos.

### 5. Sistemas (`systems`)
Catálogo de aplicações consumidoras.

## Relacionamentos
- **Usuário -> Perfil**: Via campo `role`.
- **Regra -> Sistema**: Via campo `sistema`.
- **Auditoria -> Regra**: Via campo `regra_id`.

> [!NOTE]
> Em produção, esta estrutura deve ser migrada para um banco relacional (PostgreSQL) para suporte a transações e concorrência.
