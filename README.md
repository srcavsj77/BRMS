# BRMS-FGV (Business Rule Management System)

Sistema Enterprise para Gestão Centralizada e Dinâmica de Regras de Negócio e Controle de Acesso.

## Objetivo

O BRMS-FGV atua como um hub centralizado para o gerenciamento de regras de negócios, integrando e comunicando-se de forma consistente com os demais sistemas corporativos da instituição (SGC, Financeiro, Portal do Aluno). Ele garante governança, visibilidade e flexibilidade, proporcionando empoderamento às áreas de negócio.

## Arquitetura e Estrutura do Repositório

A arquitetura do repositório adota um padrão Enterprise-Grade (Escalável e Modular):

```
.github/            # Pipelines de CI/CD, templates de Issue/PR, políticas e Codeowners
api/                # Backend (ExpressJS) desacoplado, com lógica de negócios e segurança
config/             # Configurações globais (ex: Logger Winston)
docker/             # Dockerfiles focados em segurança (Frontend / Backend)
docs/               # Registros de Decisão Arquitetural (ADR), Guia de Deploy e Runbooks
infra/              # Scripts e definições de Infraestrutura como Código (Terraform/Helm)
logs/               # Logs gerados localmente e estrutura base para observabilidade
scripts/            # Scripts utilitários de automação e manutenção
src/                # Código-fonte da Interface Web (React/Vite)
tests/              # Casos de teste automatizados e configurações (Vitest)
```

## Como Executar

### Via Docker (Recomendado)

Para executar a versão completa da plataforma via contêineres:

```bash
docker-compose up --build -d
```

A aplicação estará disponível em `http://localhost:80` (Interface) e `http://localhost:3333` (API).

### Ambiente de Desenvolvimento Local (Dev Mode)

1. Certifique-se de usar Node.js 20+.
2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente baseadas no exemplo:

   ```bash
   cp .env.example .env
   ```

4. Execute o frontend e o backend em paralelo:

   ```bash
   npm run start:all
   ```

Acesso: `http://localhost:5173`

## 📚 Documentação e Rastreabilidade (Lightweight Traceability)

Implementamos um modelo moderno de documentação técnica e funcional próxima ao código:

- **[Matriz de Rastreabilidade](./docs/matriz-rastreabilidade.md)**: Mapeamento completo de Funcionalidade -> Código -> API -> Banco.
- **[Arquitetura](./docs/arquitetura/README.md)**: Visão técnica, stack e diagramas de fluxo.
- **[Módulos do Sistema](./docs/modulos/README.md)**: Detalhamento funcional de Dashboard, RBAC, Auditoria, etc.
- **[Regras de Negócio](./docs/regras-negocio/README.md)**: Lógica, ciclo de vida e versionamento das regras.
- **[APIs](./docs/api/README.md)**: Endpoints, autenticação JWT e contratos de dados.
- **[Banco de Dados](./docs/banco/README.md)**: Dicionário de dados e persistência (db.json).
- **[Changelog](./docs/changelog/README.md)**: Histórico de evoluções e correções.

### Outros Documentos Corporativos:
- [Governança e Política de Segurança](./SECURITY.md)
- [ADR - Decisões Arquiteturais](./docs/ADR-001-Architecture-Modernization.md)
- [Guia de Deployment](./docs/DEPLOYMENT.md)
- [Runbook Operacional](./docs/RUNBOOK.md)


## Como Contribuir (Fluxo Git)

Nosso fluxo de trabalho exige aderência aos padrões de qualidade:

1. Trabalhe em branches `feature/*`, `bugfix/*` ou `hotfix/*`.
2. Siga as convenções de commits (**Conventional Commits**). Temos regras aplicadas via **Husky** e **Commitlint**.
3. Todo código está sujeito a verificação de Linter (ESLint + Prettier).
4. **CI/CD**: Sua PR passará por testes e análise estática antes de ser aceita.

## Testes e Qualidade

Para assegurar a confiabilidade, impomos uma meta de teste (Vitest + Testing Library).

```bash
npm run test           # Executar bateria de testes
npm run test:coverage  # Relatório de cobertura
npm run lint           # Validação estática
npm run format         # Correção automática de formatação
```

## Observabilidade

O backend conta com logs estruturados utilizando a biblioteca Winston (`config/logger.js`), que gera saídas `JSON` ideais para integração com pilhas ELK (Elasticsearch, Logstash, Kibana) ou Datadog.

---
**Nota de Sustentação**: Este repositório está configurado para escalabilidade contínua. Por favor, respeite os processos de *Code Review*, *Pull Request Templates* e mantenha o rigor corporativo na inserção de novas bibliotecas.
