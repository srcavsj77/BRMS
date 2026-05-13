# Matriz de Rastreabilidade Técnica e Funcional - BRMS-FGV

Esta matriz mapeia as principais funcionalidades do sistema aos seus respectivos componentes técnicos, APIs e armazenamento.

| ID | Funcionalidade | Tela / Módulo | Arquivo Principal | API / Endpoint | Banco (db.json) | Status |
|:---|:---|:---|:---|:---|:---|:---|
| **F01** | Dashboard de Governança | Home / Dashboard | `Dashboard.jsx` | `GET /api/data` | `regras`, `eventosAuditoria` | ✔ Ativo |
| **F02** | Gestão de Regras (CRUD) | Regras de Negócio | `CreateRule.jsx` / `ListRules.jsx` | `POST /api/save` | `regras` | ✔ Ativo |
| **F03** | Auditoria de Alterações | Auditoria | `AuditChanges.jsx` | `GET /api/data` | `eventosAuditoria` | ✔ Ativo |
| **F04** | Gestão de Usuários (RBAC) | Configurações > Usuários | `UsersManagement.jsx` | `POST /api/auth/login` | `usersList` | ✔ Ativo |
| **F05** | Manutenção de Perfis | Configurações > Perfil | `ProfileMaintenance.jsx` | `POST /api/save` | `profilesList` | ✔ Ativo |
| **F06** | Catálogo de Sistemas | Sistemas | `CreateSystem.jsx` / `SystemCard.jsx` | `GET /systems` (Mock) | `systems` | ✔ Ativo |
| **F07** | Monitoramento de Regras | Monitoramento | `Settings.jsx` / `monitoringService.js` | N/A (Background) | `regras` | ✔ Ativo |
| **F08** | Conformidade / Docs | Documentos | `ComplianceDocuments.jsx` | N/A (Static) | N/A | ✔ Ativo |
| **F09** | Autenticação JWT | Login | `Login.jsx` | `POST /api/auth/login` | `usersList` | ✔ Ativo |
| **F10** | Avisos & Notícias | Home | `NoticiasCard.jsx` | `GET /notices` (Mock) | N/A | ✔ Ativo |

---
*Legenda: ✔ Ativo \| 🚧 Em Desenvolvimento \| ⏳ Planejado*
