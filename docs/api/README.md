# Documentação de API - BRMS-FGV

O backend do BRMS-FGV é construído em Node.js com Express, fornecendo endpoints RESTful para o frontend.

## 1. Autenticação
A maioria dos endpoints exige um Token JWT no Header `Authorization`.

- **Formato**: `Bearer <token>`

### [POST] `/api/auth/login`
Autentica o usuário e gera um token.
- **Payload**: `{ "username": "...", "password": "..." }`
- **Resposta**: `{ "user": {...}, "token": "..." }`

## 2. Dados e Persistência

### [GET] `/api/data` (Protegido)
Retorna o estado completo do banco de dados (Regras, Auditoria, Usuários, etc).

### [POST] `/api/save` (Protegido)
Persiste as alterações enviadas pelo frontend no arquivo `db.json`.
- **Payload**: Objeto JSON completo representando o novo estado do BD.

## 3. Endpoints Públicos

### [GET] `/api/public/users`
Retorna a lista de nomes de usuários para facilitar o preenchimento no login (modo protótipo).

## 4. Mocks de Integração (Plan)
- `GET /systems`: Simula consulta ao catálogo de sistemas.
- `GET /notices`: Simula feed de notícias corporativas.

---
## Códigos de Resposta
- `200 OK`: Sucesso.
- `401 Unauthorized`: Token ausente ou inválido.
- `403 Forbidden`: Bloqueio de segurança (Ex: tentativa de SQL Injection).
- `500 Internal Server Error`: Falha na leitura/escrita do arquivo de dados.
