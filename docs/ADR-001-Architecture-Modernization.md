# ADR 001: Modernização Estrutural e Governança Enterprise

## Status
Aceito

## Contexto
O projeto original do BRMS-FGV foi criado como um protótipo com tudo alocado na raiz do projeto (backend e frontend). Com o aumento da complexidade e foco em segurança, precisávamos garantir qualidade contínua, auditoria automática de vulnerabilidades e estrutura escalável.

## Decisão
Implementamos um padrão "Enterprise-grade" contendo:
1. **Governança no GitHub**: Utilização de CODEOWNERS e templates obrigatórios de PRs/Issues para padronizar o fluxo de contribuição.
2. **Separação Arquitetural**: Criação do diretório `api/` para desacoplar a lógica do backend em Node.js (mock) e uso de pastas estratégicas (`config/`, `docker/`, `infra/`, `logs/`, `docs/`, `scripts/`, `tests/`).
3. **Qualidade Contínua e Shift-Left Security**: Inclusão de ESLint, Prettier, e Commitlint com validações locais via Husky, garantindo que o código não versionável suba sujo. Adição de pipeline CI base.
4. **Containerização**: Implementação de Dockerfile Multi-stage build focado em segurança e performance, acompanhado de Docker Compose para facilitar o setup local de novos desenvolvedores.

## Consequências
### Positivas
- Maior controle de acessos no código (CODEOWNERS).
- Prevenção automática de credenciais e más práticas através do `.gitignore` rigoroso e pipelines de CI.
- Preparação para crescimento da equipe e manutenção contínua de longo prazo.

### Negativas
- Leve aumento na curva de aprendizado para iniciar o ambiente (devido ao uso estrito de Conventional Commits e linters obrigatórios).
