PROMPT MASTER — Plataforma Corporativa de Documentação Técnica e Especificação Funcional
=====================================================================================

| LOGO | Unidade | Contato |
|------|---------|---------|
| (logo-placeholder.png) | BRMS | arquitetura@empresa.corp |

Versão: 1.1
Data de emissão: 11/05/2026
Autor: Escritório de Arquitetura Técnica

OBS: Campos de assinatura e revisão encontram-se no final do documento (campo preenchível no DOCX).

SUMÁRIO
- Título do projeto
- Objetivos do projeto
- Objetivo principal
- Objetivos específicos
- Premissas
- Caminho do sistema
- Perfil do usuário
- Caminho completo de navegação
- Cenário Atual
- Problemas e impactos no negócio
- Cenário Proposto
- Descrição da solução
- Como o problema será resolvido
- Benefícios operacionais diretos
- Atualizações no Sistema
  - Configuração
  - Front-end
  - Backend/Integração
  - Compatibilidade
- Regras Gerais
- Benefícios do projeto
- Riscos do projeto
- Funcionalidade semelhante
- Assinaturas
- Arquitetura Completa
- Estrutura do Projeto


1. Título do projeto
- PROMPT MASTER — Plataforma Corporativa de Documentação Técnica e Especificação Funcional

2. Objetivos do projeto
- Automatizar e padronizar a geração de documentação técnica e especificação funcional com rastreabilidade, auditabilidade e baixo nível de ambiguidade.
- Suportar múltiplos consumidores (Negócio, Desenvolvimento, QA, Arquitetura, Infraestrutura, Governança, Sustentação).
- Garantir integração com o ecossistema corporativo e políticas de segurança.

3. Objetivo principal
- Fornecer um motor corporativo que, a partir de entradas padronizadas, gere especificações formais e artefatos técnicos rastreáveis e aprováveis por workflow.

4. Objetivos específicos
- Gerar documentos padronizados e versionados.
- Validar entradas sintática e semanticamente.
- Enriquecer conteúdo com metadados e `trace_id`.
- Expor APIs para integração com ALM e repositórios.
- Gerar artefatos exportáveis preservando metadados.
- Suportar workflows de aprovação e auditoria.

5. Premissas
| ID | Descrição | Versão |
|----|-----------|--------|
| P1 | Entrada segue template obrigatório (Contexto, Sistema, Módulo, Objetivo, Cenários, Dependências, Restrições). | 1.0 |
| P2 | IdP corporativo OIDC disponível para autenticação e SSO. | 1.0 |
| P3 | Infraestrutura Kubernetes e Object Storage disponíveis. | 1.0 |
| P4 | Times consumidores participarão do ciclo de validação e aprovação. | 1.0 |
| P5 | Mensageria corporativa (Kafka ou RabbitMQ) disponível para eventos. | 1.0 |

6. Caminho do sistema
- Entrada (UI/API) → Validação (sintática/semântica) → Enriquecimento (IA/heurísticas) → Geração de artefato (template engine) → Persistência (PostgreSQL + Object Storage) → Publicação/Notificação (events/webhooks) → Histórico/Versionamento.

7. Perfil do usuário
- Analista de Negócio: cria e aprova conteúdo inicial.
- Arquiteto: valida modelos arquiteturais e templates.
- Desenvolvedor: consome especificações para implementação.
- QA: gera casos de teste a partir das regras.
- Infra/DevOps: gerencia deploy e observabilidade.
- Governança: auditoria e conformidade.
- Sustentação: consulta histórico e reverte versões quando necessário.

8. Caminho completo de navegação
- Login (SSO) → Dashboard de Projetos → Novo Documento → Formulário de Entrada Obrigatória → Validação automática (erros/warnings) → Sugestões de melhoria (IA) → Gerar Documento → Enviar para Aprovação → Aprovar/Rejeitar → Exportar / Notificar sistemas externos.

9. Cenário Atual
- Produção manual de especificações com ausência de padronização; revisões em trocas de e-mail; artefatos armazenados em locais diversos sem metadados; fragilidade na rastreabilidade e auditoria; tempo de elaboração elevado; alto risco de interpretação ambígua.

10. Problemas e impactos no negócio
- Atrasos na entrega de projetos.
- Retrabalho em desenvolvimento por requisitos ambíguos.
- Falhas de conformidade e dificuldades em auditoria.
- Perda de produtividade e aumento de custo operacional.
- Risco financeiro por implementações incorretas.

11. Cenário Proposto
- Plataforma central que padroniza entrada, valida regras, enriquece conteúdo semanticamente, gera documentação formal versionada e acionável por workflows de aprovação, com rastreabilidade e integração com sistemas corporativos.

12. Descrição da solução
- Arquitetura: microsserviços alinhados a Clean Architecture, Hexagonal e DDD.
- Componentes: `api-gateway`, `auth-service`, `document-service`, `architecture-service`, `workflow-service`, `enrichment-service` (IA), `export-service`.
- Tecnologias principais: Frontend Next.js (React + TypeScript); Backend Node.js (NestJS); IA Python (FastAPI); PostgreSQL; Redis; Object Storage (S3); Kafka/RabbitMQ; Prometheus; Grafana; ELK.
- Segurança: OIDC/OAuth2, JWT, RBAC, TLS e KMS para chaves.

13. Como o problema será resolvido
- Entrada padronizada elimina variação de formatos.
- Validação semântica reduz ambiguidades e exige métricas onde necessário.
- Enriquecimento semântico adiciona metadados e sugestões de melhoria.
- `trace_id` e versionamento garantem rastreabilidade requisito→artefato.
- Workflows de aprovação e auditoria reduzem risco e suportam compliance.
- Eventos permitem integração com CI/ALM e notificação a stakeholders.

14. Benefícios operacionais diretos
- Redução de tempo de produção de documentos.
- Menor retrabalho e menos ambiguidades.
- Rastreabilidade entre requisitos e entregáveis.
- Evidência de auditoria e conformidade.
- Aumento de produtividade de QA e desenvolvimento.

15. Atualizações no Sistema

Configuração
- Templates configuráveis por papel e projeto.
- Políticas de validação configuráveis (hard/soft rules).
- Parâmetros de retenção e criptografia configuráveis.

Front-end
- SPA em Next.js com editor estruturado, painel de histórico e controle de approvals.
- Validação inline e visualização clara de metadados e `trace_id`.

Backend/Integração
- `api-gateway`: autenticação, roteamento, rate-limiting e agregação.
- Serviços de domínio: validação, geração, versionamento e exposição de contratos API.
- `enrichment-service` (IA): análise semântica e sugestões automatizadas.
- `export-service`: geração de artefatos (PDF/DOCX/MD) preservando metadados.
- Integradores: webhooks, conector Git e ALM/Ticketing.

Compatibilidade
- Navegadores corporativos (Chrome/Edge) suportados.
- Integração via REST/JSON e webhooks.
- SSO via OIDC.
- Exportadores compatíveis com padrões corporativos.

16. Regras Gerais
| ID | Descrição | Versão |
|----|-----------|--------|
| R1 | Documento não será gerado sem todos os campos obrigatórios do template preenchidos. | 1.0 |
| R2 | Termos vagos (ex.: "melhorar") exigem métrica ou serão sinalizados como obrigatório complementar. | 1.0 |
| R3 | Cada requisito deve possuir `trace_id` único referenciável por versão. | 1.0 |
| R4 | Alterações aprovadas criam nova versão imutável; histórico preservado. | 1.0 |
| R5 | Acesso via API somente com JWT válido emitido por fluxo OIDC; autorização por RBAC. | 1.0 |
| R6 | Artefatos exportados devem embutir metadados de versão, autor e `trace_id`. | 1.0 |
| R7 | Serviços expõem métricas Prometheus e logs estruturados para ELK. | 1.0 |
| R8 | Eventos publicados devem ser idempotentes no consumidor e garantir at-least-once. | 1.0 |
| R9 | Validação semântica automática deve aprovar ou devolver lista de inconsistências com mensagens testáveis. | 1.0 |

17. Benefícios do projeto
- Padronização corporativa de documentos.
- Redução de ambiguidades e retrabalho.
- Melhoria na governança e compliance.
- Aumento da eficiência entre Negócio e Desenvolvimento.
- Rastreabilidade e evidência para auditoria.
- Redução de tempo até entrega de requisitos prontos para implementação.

18. Riscos do projeto
- Dependência do IdP OIDC corporativo.
- Integração complexa com sistemas legados.
- Adoção e mudança de processo organizacional.
- Possíveis falhas de disponibilidade dos serviços críticos.
- Qualidade insuficiente das entradas humanas.
- Gestão inadequada de dados sensíveis e conformidade regulatória.
- Eventual inconsistência entre microsserviços distribuídos.

19. Funcionalidade semelhante
- Fluxos de Document Management com templates e versionamento adotados em corporações para controle de especificações, approvals e histórico de mudanças.

20. Assinaturas
- Autor: __________________________________
- Cargo: __________________________________
- Unidade: ________________________________
- Assinatura: _____________________________
- Data: ____/____/______

- Revisor: ________________________________
- Cargo: __________________________________
- Unidade: ________________________________
- Assinatura: _____________________________
- Data: ____/____/______

- Campo de Aprovação (PO/Governança):
- Nome: ___________________________________
- Cargo: ___________________________________
- Assinatura: ______________________________
- Data: ____/____/______


ARQUITETURA COMPLETA
--------------------

# 1. Visão Geral da Arquitetura
- Estilo arquitetural: Microsserviços orientados a eventos alinhados a Clean Architecture, Hexagonal e DDD.
- Objetivo técnico: modularidade, escalabilidade, observabilidade e rastreabilidade dos fluxos de documentação.
- Escalabilidade: serviços stateless escaláveis via Kubernetes; mensageria para desacoplamento e alto throughput.
- Segurança: autenticação central (OIDC), autorização RBAC, TLS, KMS para chaves.
- Comunicação: REST para operações síncronas; Kafka/RabbitMQ para eventos assíncronos; tracing distribuído para correlação.

# 2. Arquitetura da Solução
- Frontend: Next.js + React + TypeScript.
- Backend: Node.js + NestJS.
- IA: Python + FastAPI.
- API Gateway: autenticação, roteamento, throttling e agregação.
- Microsserviços: `auth-service`, `document-service`, `architecture-service`, `workflow-service`, `enrichment-service`, `export-service`.
- Observabilidade: Prometheus, Grafana, ELK, OpenTelemetry.
- Mensageria: Kafka com tópicos de domínio (`document.created`, `document.updated`, `approval.requested`, `enrichment.completed`).
- Banco: PostgreSQL para metadados; Redis para cache.
- Armazenamento: Object Storage S3 para artefatos.

# 3. Arquitetura em Camadas
- Apresentação: UI e API Gateway.
- Aplicação: orquestração de casos de uso e workflows.
- Domínio: entidades, agregados e regras DDD.
- Infraestrutura: implementações concretas de repositórios, filas e storage.
- Integração: adaptadores REST, consumers de mensagens e webhooks.
- Persistência: repositórios com migrations e políticas de versionamento.

# 4. Arquitetura de Integração
- APIs REST: contratos versionados; endpoints para projetos, documentos, templates, approvals e audit.
- Eventos: publicação de eventos de domínio para consumidores externos.
- Filas: Kafka para processamentos assíncronos (enriquecimento, exportação).
- Webhooks: notificações configuráveis por projeto.
- Integrações externas: IdP OIDC, ALM/Ticketing, repositório Git, Object Storage.

# 5. Arquitetura de Segurança
- OAuth2/OIDC: delegação de autenticação ao IdP corporativo.
- JWT: tokens com claims padronizados e rotação segura de refresh tokens.
- RBAC: papéis corporativos e permissões finas.
- Criptografia: TLS em trânsito; AES-256 em repouso com KMS.
- Auditoria: logs imutáveis e eventos de auditoria com retenção definida.
- Segregação de acesso: ambientes isolados e controles de acesso distintos.

# 6. Arquitetura de Dados
- Banco relacional: PostgreSQL com schemas por domínio e migrations versionadas.
- Cache: Redis para caching de templates, sessões e resultados de enriquecimento.
- Versionamento: cada alteração gera nova versão imutável vinculada a `trace_id`.
- Estratégia transacional: transações locais; sagas/orquestração para fluxos distribuídos.
- Backups e retenção: backups automatizados e política de retenção.

# 7. Arquitetura DevOps
- Containers: imagens padronizadas e scanning de vulnerabilidades.
- Kubernetes: deployments com HPA, readiness/liveness probes e namespaces por ambiente.
- Logs: ELK centralizado.
- Monitoramento: Prometheus + Grafana + Alertmanager.
- Observabilidade: OpenTelemetry, correlação por `trace_id`.
- Recomendação: pipelines corporativos para build e deploy (não gerados neste documento).


ESTRUTURA DO PROJETO
--------------------

Estrutura proposta (enterprise):
- /apps
- /frontend
- /backend
- /api-gateway
- /services
  - /auth-service
  - /document-service
  - /architecture-service
  - /workflow-service
  - /enrichment-service
  - /export-service
- /shared
- /domain
- /application
- /infrastructure
- /interfaces
- /modules
- /templates
- /docs
- /diagrams
- /docker
- /k8s
- /scripts
- /config

Explicação da responsabilidade de cada diretório
- /apps: pontos de entrada deployáveis (UI, admin, workers).
- /frontend: código Next.js/React; UI e componentes compartilhados.
- /backend: monorepo contendo os serviços e bibliotecas.
- /api-gateway: roteamento, autenticação e políticas.
- /services: microserviços autônomos, cada um com `domain/application/infrastructure`.
- /shared: contratos e tipos compartilhados (somente DTOs e interfaces).
- /domain: modelos DDD e regras de negócio puras.
- /application: casos de uso e orquestrações.
- /infrastructure: adaptadores concretos (DB, mensageria, storage).
- /interfaces: controllers REST, consumers e webhooks.
- /modules: agrupamento funcional por domínio.
- /templates: templates de documentos e regras de validação.
- /docs / /diagrams: documentação e artefatos visuais.
- /docker / /k8s / /scripts: metadados, manifests e utilitários (sem Dockerfiles ou pipelines neste artefato).
- /config: schemas e políticas por ambiente.

Desacoplamento e organização modular
- Domain isolado de infraestrutura; adaptadores implementam contratos definidos no domínio.
- Shared contém apenas contratos e tipos, prevenindo duplicação de lógica.
- Comunicação por eventos reduz acoplamento entre serviços.

PADRÕES ARQUITETURAIS OBRIGATÓRIOS APLICADOS
- Clean Architecture
- SOLID
- DDD
- Hexagonal Architecture
- API First
- Microsserviços
- Event Driven Architecture

STACK TECNOLÓGICA PADRÃO
- Frontend: React, Next.js, TypeScript
- Backend: Node.js, NestJS
- IA: Python, FastAPI
- Banco: PostgreSQL, Redis
- Observabilidade: Prometheus, Grafana, ELK
- DevOps: Docker, Kubernetes

DIRETRIZES DE QUALIDADE
- Linguagem formal e técnica, sem uso de primeira pessoa.
- Não inventar funcionalidades fora do escopo ou omitir impactos relevantes.
- Garantir coerência entre problema → solução → regra → impacto.
- Garantir rastreabilidade e clareza arquitetural.

BOAS PRÁTICAS RECOMENDADAS
- Padronização de fluxos e reuso de soluções existentes.
- Redução de exceções sistêmicas; desacoplamento de regras;
- Separação clara entre frontend/backend/integração;
- Alta coesão e baixo acoplamento; modularização e segurança corporativa.

CRITÉRIOS DE EXCELÊNCIA
- Documento pronto para aprovação corporativa e uso por desenvolvedores e QA.
- Baixo nível de ambiguidade e rastreabilidade garantida.
- Visão arquitetural completa e organização técnica corporativa.


ANEXOS
- Templates de entrada e exemplos operacionais ficam disponíveis em `/templates`.
- Diagrams de arquitetura devem ser salvos em `/diagrams` (SVG/PNG + fonte).


FIM DO DOCUMENTO
