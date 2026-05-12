# Guia de Deploy - BRMS-FGV

Este documento descreve os passos para realizar o deploy em ambientes controlados.

## Requisitos
- Docker (versão 20+) e Docker Compose (versão 2+)
- Acesso de rede configurado
- Certificados TLS (Se implantado atrás de um Load Balancer / API Gateway)

## Passo a Passo para Deploy Local (Homologação)
1. Clone o repositório.
2. Copie o arquivo `.env.example` para `.env` e ajuste a variável `JWT_SECRET`.
3. Inicie o build de produção via docker:
   ```bash
   docker-compose up --build -d
   ```
4. Verifique os logs usando `docker-compose logs -f`.

## Integração Contínua (CI)
Toda PR em direção a `develop` e `main` sofre a validação de segurança e qualidade estabelecida pelo arquivo `.github/workflows/ci.yml`.

## Deployment Contínuo (CD)
- A pipeline `cd.yml` atualmente constrói o artefato, validando o estado do commit.
- A orquestração definitiva de deploy precisa do injetor configurado conforme a nuvem alvo (Azure, AWS, On-Premise).
