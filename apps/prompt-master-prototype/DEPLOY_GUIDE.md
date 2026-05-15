Guia de implantação do protótipo Prompt Master
=============================================

Resumo:
- O protótipo está em `apps/prompt-master-prototype`.
- O servidor Node/Next deve estar empacotado como uma imagem Docker e enviada para um registry.
- Este guia não cria Dockerfiles nem pipelines; assume que a imagem já existe em `registry.example.com/prompt-master-prototype:latest`.

Opções de deploy:
1) Deploy com `kubectl` usando YAML:
   - Atualize a imagem em `k8s/deployment.yaml` para a tag desejada.
   - Crie secrets sensíveis (OIDC) via `kubectl create secret generic prompt-master-secrets --from-literal=oidc_client_secret=...`.
   - Aplicar manifests:
     ```bash
     kubectl apply -f apps/prompt-master-prototype/k8s/deployment.yaml
     kubectl apply -f apps/prompt-master-prototype/k8s/service.yaml
     # opcional: ingress
     kubectl apply -f apps/prompt-master-prototype/k8s/ingress.yaml
     ```

2) Deploy com Helm (skeleton fornecido):
   - Ajuste `k8s/helm-chart/values.yaml` com `image.repository` e `image.tag`.
   - Instalar:
     ```bash
     helm install prompt-master apps/prompt-master-prototype/k8s/helm-chart -n prompt-master --create-namespace
     ```

Requisitos e recomendações:
- Configure Ingress e DNS conforme infraestrutura (Nginx/Ingress Controller).
- Instale `pandoc` no node que executará o `api/export` se quiser a exportação server-side ativa.
- Gerencie segredos com soluções seguras (Vault, Azure Key Vault, AWS Secrets Manager).

Observações:
- Este guia não inclui criação de imagens ou pipelines CI/CD por decisão de conformidade de projeto.
- Para testes locais use `npm run dev` em `apps/prompt-master-prototype`.

Contato: arquitetura@empresa.corp
