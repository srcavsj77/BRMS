# Política de Segurança Corporativa

Este documento estabelece as diretrizes de segurança, reporte de vulnerabilidades e compliance para o projeto **BRMS-FGV**.

## Versões Suportadas

Apenas as versões listadas abaixo recebem atualizações e patches de segurança. Recomendamos manter o ambiente sempre na versão mais recente.

| Versão | Status de Suporte |
| -------| ----------------- |
| 1.x.x  | :white_check_mark: Suportada |
| < 1.0  | :x: Não suportada |

## Reporte de Vulnerabilidades

**NÃO crie uma issue pública no GitHub para reportar uma vulnerabilidade de segurança.**

Se você descobrir uma falha de segurança, siga nosso processo de divulgação responsável (Responsible Disclosure):

1. Envie um e-mail com os detalhes para a equipe de AppSec ou o responsável pelo projeto.
2. Forneça o máximo de informações possível:
   - Descrição detalhada do risco.
   - Prova de conceito (PoC) ou passos para reprodução.
   - Possível impacto.

Nossa equipe confirmará o recebimento em até 48 horas e fornecerá um status sobre a correção.

## Diretrizes de Código e DevSecOps

Para desenvolvedores e colaboradores, as seguintes políticas são aplicadas rigorosamente através de CI/CD:

- **Zero Secrets no Código**: Nunca comite senhas, chaves de API, certificados ou tokens. Utilize cofres de senhas e injeção via variáveis de ambiente.
- **Scanning Contínuo**: Pushs e Pull Requests são auditados por ferramentas estáticas (SAST) e analisadores de dependências (ex: `npm audit`).
- **Least Privilege**: Componentes de backend, contêineres e scripts devem operar com os menores privilégios necessários. (Ex: usuário não-root no Docker).
- **Proteção de Branch**: As branches `main` e `develop` não aceitam pushs diretos e requerem revisão por pares (Code Review) e CI verde.
