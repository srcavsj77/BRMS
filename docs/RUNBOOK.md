# Runbook Operacional - BRMS-FGV

## 1. Tratamento de Incidentes Críticos
Se houver uma queda do sistema de produção:
1. Verifique os logs do contêiner Nginx (`docker logs brms-frontend`).
2. Verifique os logs do backend express (`docker logs brms-backend`).
3. Verifique se o processo sofreu reinicialização (OOM).

## 2. Escalabilidade
O Frontend é escalável horizontalmente de forma simples por ser estático, contido no NGINX.
O Backend atualmente utiliza um mock `db.json` que **não é seguro** para escritas simultâneas massivas. Uma migração para um BD real (Postgres/Mongo) será necessária na fase de produção definitiva.

## 3. Gestão de Secrets
Todas as credenciais sensíveis devem ser injetadas via Variáveis de Ambiente e gerenciadas via GitHub Secrets ou AWS Secrets Manager/Azure Key Vault.
Nunca modifique localmente e comite o arquivo `.env`.

## 4. Como executar os testes em debug
Execute `npm run test:watch` para ter um feedback em tempo real sobre a cobertura e falhas.
Para debugar o frontend rodando, use o React Developer Tools integrado ao console local do `vite`.
