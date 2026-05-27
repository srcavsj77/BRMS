# Changelog - BRMS-FGV

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O projeto segue os padrões de [Conventional Commits](https://www.conventionalcommits.org/) e [Semantic Versioning](https://semver.org/).

## [2.6.0] - 2026-05-27
### Adicionado
- Configuração do sistema para utilizar zoom global padrão de 90%, otimizando significativamente o conforto visual, legibilidade das fontes e espaçamento da interface.
- Validação estrita (bloqueio de avanço e salvamento) nas etapas de cadastro de regras com exibição de modal de alerta elegante na tela ao identificar campos obrigatórios pendentes.

### Melhorado
- Reorganização hierárquica completa da ordem dos menus no sistema.
- Renomeação visual inteligente dos módulos no menu lateral ("Criar regra" para "Nova Regra de Negócio", "Sistemas" para "Sistemas FGV", "Auditoria" para "Auditoria de regras" e "Conformidade" para "Acervo documental"), implementada de forma a não gerar impactos no motor de permissões do usuário logado (RBAC).

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
