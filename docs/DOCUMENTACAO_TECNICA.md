# Documentação Técnica — TechStore

## 1. Identificação

- **Projeto:** TechStore
- **Área:** persistência e gestão de dados
- **Tipo:** MVP acadêmico de DevOps
- **Objetivo:** demonstrar persistência, resiliência, consistência transacional e automação de operação em containers

### Integrantes

1. [Nome completo do integrante 1]
2. [Nome completo do integrante 2]
3. [Nome completo do integrante 3]
4. [Nome completo do integrante 4]

Este documento descreve o estado atual do projeto e permite que outra pessoa compreenda e reproduza a execução da aplicação.

---

## 2. Problemática recebida

O desafio era construir uma aplicação cujos dados não fossem perdidos quando os containers fossem destruídos, recriados ou reiniciados.

A solução deveria:

- manter usuários, produtos, carrinhos e pedidos em banco relacional;
- permitir reconstruir o ambiente local com um comando;
- evitar duplicação de dados na inicialização;
- preservar o catálogo e as regras de negócio;
- manter carrinho, estoque e pedido consistentes;
- comprovar a persistência após a recriação da stack.

O escopo é um MVP para avaliação acadêmica, não uma operação de produção ou um sistema de pagamentos real.

---

## 3. Análise do problema

A análise separou o problema em cinco pontos.

### 3.1 Persistência

Os dados precisavam sobreviver à remoção dos containers. O PostgreSQL foi escolhido como banco de dados, com os arquivos armazenados em um volume Docker.

### 3.2 Inicialização

O banco, as migrações, o seed e a API precisam iniciar em ordem determinística. O Compose usa healthchecks e `depends_on` para evitar que o backend tente usar o banco antes de ele estar pronto.

### 3.3 Integridade

O carrinho, o estoque e o pedido não podem ser alterados de forma independente durante o checkout. A criação do pedido precisa ser atômica.

### 3.4 Duplicidade de operações

Uma falha de rede ou um retry poderia criar o mesmo pedido e descontar o estoque novamente. O fluxo usa `Idempotency-Key` para evitar esse cenário.

### 3.5 Dados históricos

O repositório continha referências antigas a MariaDB. A aplicação atual usa somente PostgreSQL, e nenhum artefato físico de banco foi incluído no projeto.

---

## 4. Proposta da solução

A solução é composta por três serviços coordenados pelo Docker Compose:

1. **Frontend React**, compilado com Vite e servido por Nginx.
2. **Backend Node.js e Express**, com regras de negócio e Prisma ORM.
3. **PostgreSQL 15**, com volume persistente.

A solução também inclui:

- migrações versionadas com Prisma Migrate;
- seed idempotente;
- autenticação JWT com cookie `HttpOnly`;
- revogação de sessões persistida;
- transações de carrinho, estoque e pedido;
- idempotência de pedidos;
- scripts de backup, restauração e persistência;
- CI e smoke test da stack.

---

## 5. Arquitetura da solução

### 5.1 Topologia de rede

Os serviços estão na rede bridge do Docker. O navegador acessa o frontend pela porta do host; a comunicação entre containers usa nomes e portas internas.

```text
┌────────────────────────────────────────────────────────────────────┐
│                       REDE DOCKER (bridge)                          │
│                                                                    │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐   │
│  │   Frontend   │  /api │    Backend   │ Prisma│  PostgreSQL  │   │
│  │  React + Vite│──────▶│  Node.js +   │──────▶│      15      │   │
│  │  Nginx :8080 │       │   Express    │       │    :5432     │   │
│  │  Host :3001  │       │  Host :3002  │       └──────┬───────┘   │
│  └──────────────┘       └──────────────┘              │           │
│                                                     ┌────▼─────┐     │
│                                                     │ pg_data  │     │
│                                                     │  volume  │     │
│                                                     └──────────┘     │
└────────────────────────────────────────────────────────────────────┘
             ▲
             │ http://localhost:3001
        Navegador no host
```

O backend acessa o banco pelo nome interno `db` e pela porta `5432`. O Nginx atual encaminha as chamadas para `http://techstore_backend:3000/api/`, preservando o prefixo `/api/`.

### 5.2 Portas

| Serviço | Porta interna | Porta no host | Função |
|---|---:|---:|---|
| Frontend/Nginx | 8080 | 3001 | Interface e proxy |
| Backend/Express | 3000 | 3002 | API REST |
| PostgreSQL | 5432 | 5434 | Persistência local |

A porta `5434` é publicada somente no loopback para diagnóstico e evitar conflito com um PostgreSQL local.

### 5.3 Camada de apresentação

O frontend usa React e Vite. O Dockerfile faz um build em múltiplas etapas e entrega os arquivos estáticos em uma imagem Nginx sem privilégios de root.

O Nginx:

1. serve a aplicação React;
2. encaminha requisições `/api/` ao backend pela rede Docker.

Assim, o navegador usa uma origem pública única e não precisa conhecer o endereço interno do backend.

### 5.4 Camada de aplicação

O backend é organizado em camadas:

- **Routes:** definem endpoints;
- **Middlewares:** tratam autenticação, cookies, roles, CORS, rate limit e segurança;
- **Controllers:** recebem requisições e formatam respostas;
- **Services:** concentram regras de negócio;
- **Repositories:** isolam as operações Prisma;
- **Prisma:** executa consultas parametrizadas no PostgreSQL.

A autenticação usa o cookie `sessionToken`. O middleware verifica JWT, expiração, `jti` e revogação. O acesso administrativo consulta o role no banco.

### 5.5 Persistência e volume

O PostgreSQL é o armazenamento principal da aplicação. O diretório `/var/lib/postgresql/data` é montado no volume Docker `pg_data`.

| Comando | Resultado |
|---|---|
| `docker compose stop` | Para os serviços e preserva o volume |
| `docker compose restart` | Reinicia preservando os dados |
| `docker compose down` | Remove containers e rede, mas preserva o volume |
| `docker compose up -d` | Recria os serviços e reutiliza o volume |
| `docker compose down -v` | Remove também os dados; usar somente para reset intencional |

A persistência é validada por `scripts/verify-persistence.sh`, que cria um registro-sentinela, executa `down` e `up` sem remover o volume e confirma que o registro continua existindo.

### 5.6 Bootstrap

A inicialização segue esta ordem:

1. PostgreSQL executa `pg_isready`;
2. o Compose espera o banco saudável;
3. o backend gera o Prisma Client;
4. o entrypoint executa `prisma migrate deploy`;
5. o seed cria os registros de demonstração ausentes;
6. o Express inicia;
7. o frontend inicia após a API ficar pronta.

O seed cria dois usuários e oito produtos quando eles ainda não existem. Ele não sobrescreve dados previamente cadastrados.

### 5.7 Fluxo de criação de produto

1. O navegador envia `POST /api/produtos` com o cookie `sessionToken`.
2. O Nginx encaminha a requisição para `http://techstore_backend:3000/api/produtos`.
3. O middleware valida o JWT e a revogação da sessão.
4. O middleware administrativo consulta o role no banco.
5. Controller e service validam os dados.
6. O repository executa `prisma.produto.create(...)`.
7. O PostgreSQL grava o produto em `pg_data`.
8. A API retorna `201 Created` através do Nginx.

---

## 6. Tecnologias e ferramentas

### Frontend

React 19, Vite, React Router, Nginx, Vitest, Testing Library e Biome.

### Backend

Node.js 20, Express 5, Prisma 6, PostgreSQL, bcrypt, jsonwebtoken, Helmet, CORS, express-rate-limit, Jest e Biome.

### Infraestrutura

Docker, Docker Compose, volumes Docker, Git, GitHub Actions, Yarn, scripts Shell, `pg_dump` e `pg_restore`.

---

## 7. Justificativa das escolhas

### PostgreSQL

Oferece transações ACID, relacionamentos, constraints e índices, especialmente importantes para carrinho, estoque e pedidos.

### Prisma

Centraliza o schema, reduz SQL manual e fornece acesso type-safe ao banco.

### Docker Compose

Permite reproduzir a stack completa com um único arquivo e comando.

### Volume Docker

Separa o ciclo de vida dos dados do ciclo de vida dos containers.

### Transações

A criação de pedido altera estoque, itens, carrinho e pedido. A transação Prisma confirma tudo ou reverte tudo.

### Idempotência

`Idempotency-Key` evita que um retry crie outro pedido e desconte o estoque novamente.

### Testes automatizados

Jest, Vitest e smoke tests tornam a validação reproduzível e independente de arquivos JSON.

---

## 8. Modelo de dados

O schema está em `backend/prisma/schema.prisma`.

| Tabela | Responsabilidade |
|---|---|
| `usuarios` | Usuários, roles, senhas hash e recuperação de senha |
| `produtos` | Catálogo, preço, categoria, imagem e estoque |
| `carrinhos` | Relação entre usuário, produto e quantidade |
| `pedidos` | Total, status, entrega, pagamento e idempotência |
| `pedido_itens` | Snapshot de produto, quantidade e preço cobrado |
| `sessoes_revogadas` | Tokens invalidados por logout |

### Relacionamentos

- Um usuário possui carrinhos e pedidos.
- Um carrinho pertence a um usuário e a um produto.
- Um pedido pertence a um usuário e possui vários itens.
- O item guarda o nome e o preço do produto no momento da compra.
- Produtos vinculados a pedidos não podem ser excluídos livremente.

### Integridades

- E-mail único.
- Um par usuário/produto único no carrinho.
- Quantidades positivas.
- Preço, estoque e total não negativos.
- Chave de idempotência única por usuário.
- Snapshot de preço e nome no item do pedido.

---

## 9. Processo de desenvolvimento

### Etapa 1 — Estabilização

PostgreSQL, volume, healthchecks, seed, sessões, catálogo, CORS, proxy e rate limit.

### Etapa 2 — Consistência transacional

Transação de checkout, lock por usuário, estoque condicional, carrinho único, idempotência, snapshots e migrações.

### Etapa 3 — Confiabilidade operacional

Backup, restore, readiness, smoke test, teste de persistência após `down/up` e validação de integridade dos dados.

O desenvolvimento foi realizado em branches separadas, com revisão por Pull Request e merge na `develop`.

---

## 10. Práticas DevOps

- configuração da stack como código;
- rede Docker isolada;
- volume persistente;
- healthcheck do PostgreSQL e readiness da API;
- `prisma migrate deploy`;
- seed idempotente;
- CI com PostgreSQL, testes e build;
- smoke test da stack completa;
- backup com `pg_dump` e restore com `pg_restore`;
- `.env` e segredos fora do Git;
- scripts de persistência automatizados.

Scripts operacionais:

```text
scripts/backup.sh
scripts/restore.sh
scripts/verify-backup.sh
scripts/verify-persistence.sh
```

---

## 11. Execução do projeto

### Pré-requisitos

- Git;
- Docker;
- Docker Compose v2;
- portas livres `3001`, `3002` e `5434`.

### Subir a aplicação

```bash
git clone https://github.com/laas26/techstore-db-mvp.git
cd techstore-db-mvp
docker compose up -d --build
```

### Verificar

```bash
docker compose ps
curl http://localhost:3002/health/ready
curl http://localhost:3001/
curl http://localhost:3002/api/produtos
```

O readiness deve retornar:

```json
{
  "status": "ready",
  "database": "up"
}
```

### Acessos

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API | http://localhost:3002 |
| Health | http://localhost:3002/health |
| Readiness | http://localhost:3002/health/ready |

### Usuários de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Admin | `admin@techstore.local` | `Admin@123` |
| Cliente | `cliente@techstore.local` | `Cliente@123` |

Essas credenciais são apenas para demonstração.

### Comandos operacionais

```bash
docker compose logs -f backend
docker compose down
docker compose up -d

sh scripts/backup.sh
sh scripts/verify-backup.sh
sh scripts/verify-persistence.sh
```

Restauração:

```bash
CONFIRM_RESTORE=YES sh scripts/restore.sh backups/NOME_DO_BACKUP.dump
```

Não use `docker compose down -v` para reiniciar a aplicação: essa opção remove o volume.

---

## 12. Testes e validações

### Backend

```bash
cd backend
yarn test --runInBand
```

A suíte cobre autenticação, seed, sessões, carrinho, rollback, concorrência, oversell, idempotência, readiness e snapshots.

Resultado: **9 suítes e 32 testes passando**.

### Frontend

```bash
cd frontend
yarn vitest run
yarn build
```

Resultado: **3 arquivos e 4 testes frontend passando**, com build concluído.

### Infraestrutura

- `docker compose config`;
- `npx prisma validate`;
- `npx prisma migrate status`;
- `sh -n` nos scripts;
- `git diff --check`.

### Smoke test Docker

O workflow verifica:

1. frontend `200`;
2. readiness da API e PostgreSQL;
3. produtos do seed;
4. backup;
5. restauração em banco temporário;
6. persistência após `down/up`.

---

## 13. Resultados

O projeto demonstra:

- persistência no PostgreSQL;
- sobrevivência do volume;
- inicialização automática;
- seed sem duplicação;
- sessões persistentes e revogáveis;
- checkout transacional;
- prevenção de oversell nos testes;
- rollback;
- idempotência;
- snapshot de produtos;
- readiness do banco;
- backup e restauração;
- persistência verificada com sentinel;
- CI e smoke test da stack real.

A stack local é iniciada com:

```bash
docker compose up -d --build
```

---

## 14. Limitações

- O pagamento é simulado.
- O estoque é debitado na criação do pedido e não possui reserva expirável.
- O Compose é voltado para desenvolvimento e usa `yarn dev` com bind mount.
- As credenciais padrão são somente para demonstração.
- Não há backup externo, retenção ou recuperação point-in-time.
- Não há staging ou produção.
- Pedidos, usuários e partes do admin ainda possuem telas incompletas.
- Não há observabilidade avançada.
- A lint da CI permanece não bloqueante enquanto a dívida de formatação é tratada.

Essas limitações são aceitáveis para o escopo do MVP, mas devem ser resolvidas antes de uso real.

---

## 15. Evoluções futuras

As evoluções devem priorizar persistência e gestão de dados.

### 15.1 Reservas e expiração de estoque

Reservar itens durante o checkout e liberar a reserva quando o pagamento não for concluído.

### 15.2 Histórico de pedidos e pagamentos

Registrar eventos, tentativas, cancelamentos, estornos, status, valores e provedores.

### 15.3 Ledger de estoque

Criar movimentações de entrada, saída, venda, ajuste, cancelamento e reposição, formando uma trilha auditável.

### 15.4 Backup avançado

Adicionar retenção, criptografia, ambientes separados e recuperação point-in-time.

### 15.5 Migrações mais seguras

Adicionar preflight, detecção de dados incompatíveis, deduplicação e ensaios em cópia do banco.

### 15.6 Desempenho e auditoria

Adicionar paginação, índices, filtros, enums, soft delete, trilha de auditoria e política de retenção de dados pessoais.

### 15.7 Evolução do catálogo

Persistir SKU, padronizar categorias e manter a consistência entre admin, vitrine e banco.

---

## 16. Conclusão

O projeto atende ao escopo de um MVP acadêmico de persistência e gestão de dados. A combinação de PostgreSQL, volume Docker, migrações, seed idempotente, transações, idempotência, readiness, backup e smoke tests oferece uma base reproduzível para a avaliação.

As evoluções futuras devem manter o foco em integridade, auditoria, recuperação, rastreabilidade e desempenho dos dados antes de adicionar novas funcionalidades de produto.
