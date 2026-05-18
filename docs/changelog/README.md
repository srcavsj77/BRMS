# Changelog - BRMS-FGV

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O projeto segue os padrões de [Conventional Commits](https://www.conventionalcommits.org/) e [Semantic Versioning](https://semver.org/).

## [2.5.0] - 2026-05-18
### Adicionado
- Evolução de UX do Stepper (Wizard) na criação de regras: navegação direta entre etapas concluídas/acessíveis.
- Feedback visual de completitude com cores (Azul para completo, Amarelo para incompleto, Cinza para inacessível).
- Campo "Todos" no menu suspenso de personalização de colunas, permitindo selecionar/desmarcar todas de uma vez.
- Módulo do Sistema integrado nas regras de negócio e persistência com retrocompatibilidade automática de regras legadas.
- Geração de relatórios de exportação consistentes (Excel e PDF) contendo cabeçalho institucional e respeitando filtros.

### Melhorado
- Limpeza e organização visual: remoção do botão duplicado de salvar no cabeçalho e posicionamento do botão "Cancelar" no rodapé ao lado de "Finalizar e Salvar".
- Renomeação da coluna "NOME" para "NOME DA REGRA" no grid de resultados e no menu de colunas.
- Correção de importação de ícones que resolvia falha crítica de renderização na tela de criação.

## [1.2.0] - 2026-05-13
### Adicionado
- Nova estrutura de documentação "Docs as Code" na pasta `/docs`.
- Matriz de Rastreabilidade Técnica e Funcional.
- Diagramas de arquitetura usando Mermaid.
- Documentação modular para RBAC e Regras.

### Melhorado
- Organização do projeto e limpeza de arquivos desnecessários.
- Centralização de configurações de API para suporte a rede local.
- Estilização de modais com barras de rolagem e alinhamento de botões.

## [1.1.0] - 2026-05-12
### Adicionado
- Módulo de Manutenção de Perfis (RBAC Granular).
- Dashboard de Governança refinado.

## [1.0.0] - 2026-05-10
### Lançamento Inicial
- CRUD funcional de Regras de Negócio.
- Autenticação JWT e Mock DB funcional.
- Sistema de Auditoria básica.
