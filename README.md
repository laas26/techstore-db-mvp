# TechStore - MVP de Persistência e Gestão de Dados

> Loja demo com dados que sobrevivem à infraestrutura.

---

## 📋 Índice

- [Problemática Recebida](#-problemática-recebida)
- [Análise do Problema](#-análise-do-problema)
- [Proposta da Solução](#-proposta-da-solução)
- [Arquitetura da Solução](#-arquitetura-da-solução)
- [Tecnologias e Ferramentas](#-tecnologias-e-ferramentas)
- [Justificativa Técnica](#-justificativa-técnica)
- [Processo de Desenvolvimento](#-processo-de-desenvolvimento)
- [Práticas DevOps](#-práticas-devops)
- [Instruções de Execução](#-instruções-de-execução)
- [Testes e Validações](#-testes-e-validações)
- [Resultados Obtidos](#-resultados-obtidos)
- [Limitações da Solução](#-limitações-da-solução)
- [Possíveis Evoluções Futuras](#-possíveis-evoluções-futuras)

---

## 🎯 Problemática Recebida

O desafio era garantir a persistência e a segurança de dados críticos, como utilizadores, autenticação e produtos, sem depender dos ciclos de vida efémeros dos contentores. Os dados precisam sobreviver a reinicializações, atualizações de serviços e até à destruição e recriação dos contentores.

## 🔍 Análise do Problema

Os principais riscos identificados foram:

- Perda de informação com ficheiros voláteis em reinicializações ou atualizações de serviços.
- Acoplamento entre aplicação e dados: se o contentor da API cai, os dados não podem cair junto com ele.
- Necessidade de uma camada de dados segura e independente já no MVP, sem complexidade operacional excessiva.

## 💡 Proposta da Solução

A solução usa um banco relacional (MariaDB) desacoplado da API, provisionado via Infraestrutura como Código (`docker-compose.yml`):

- O banco vive num serviço próprio (`db`), com ciclo de vida independente do backend e do frontend.
- Na primeira inicialização, o backend cria o esquema e popula o banco automaticamente através de um seed idempotente, sem exigir nenhum comando manual.
- Os segredos e credenciais ficam centralizados no Compose, com valores padrão embutidos e um `.env` opcional para personalização.

## 🏗️ Arquitetura da Solução

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │      │    MariaDB   │
│ React + Vite │─────▶│ Node.js +    │─────▶│  Volume      │
│  Nginx :8080 │ /api/│ Express +    │      │  persistente │
│              │      │ Prisma :3000 │◀─────│  db_data     │
└──────────────┘      └──────────────┘      └──────────────┘
       │                      │                      │
       └──────── Vitrine ─────┴──── API REST ─────────┴── Dados ──
```

O frontend (React + Vite), o backend (Node.js + JS) e o MariaDB estão conectados de forma isolada: cada camada é um serviço Docker independente, comunicando apenas pela rede interna do Compose.

| Serviço  | Imagem / Build       | Porta local | Destino interno |
| -------- | -------------------- | ----------- | --------------- |
| Frontend | `frontend/Dockerfile`| `3001`      | Nginx `:8080`   |
| Backend  | `backend/Dockerfile` | `3002`      | API `:3000`     |
| Banco    | `mariadb:11`         | `3306`      | MariaDB `:3306` |

Acesso rápido:

- 🛍️ Loja: <http://localhost:3001>
- 🔌 API: <http://localhost:3002> · Health: <http://localhost:3002/health>
- 👑 Admin: <http://localhost:3001/dashboard> · 👤 Cliente: <http://localhost:3001/client>

## 🧰 Tecnologias e Ferramentas

| Camada    | Tecnologia                              |
| --------- | --------------------------------------- |
| Frontend  | React 19, React Router 7, Vite          |
| Backend   | Node.js 20, Express 5, Prisma 6 (ORM)   |
| Banco     | MariaDB 11                              |
| Infra     | Docker & Docker Compose                 |
| Qualidade | Biome (lint/format), Vitest, Jest       |

## ⚙️ Justificativa Técnica

- O MariaDB combinado com Docker Volumes garante independência de dados e resiliência: destruir e recriar contentores não apaga nada, já que o volume nomeado `db_data` só é removido com `docker compose down -v`.
- O healthcheck junto com `depends_on: service_healthy` faz o backend só iniciar quando o banco está realmente pronto, eliminando condições de corrida.
- O bootstrap automático (`backend/docker-entrypoint.sh`) executa `prisma db push` e o `seed.js` idempotente (upsert) a cada arranque, o que é seguro repetir e nunca duplica dados.
- A autenticação por perfis usa JWT com `role` (`admin`/`user`); o frontend separa as áreas de forma que o admin vai para o painel de gestão e o cliente para a sua própria área, sem acesso cruzado.

## 🧩 Processo de Desenvolvimento

O foco foi a modularização e a construção de uma camada de dados segura para o MVP:

```
techstore-db-mvp/
├── docker-compose.yml          # Infraestrutura como Código
├── .github/workflows/ci.yml    # Pipeline CI (build, testes, seed + MariaDB)
├── backend/
│   ├── src/                    # controllers, services, repositories, routes, middlewares
│   ├── prisma/schema.prisma    # Fonte da verdade do esquema
│   ├── scripts/seed.js         # Seed idempotente (2 utilizadores + 8 produtos)
│   ├── docker-entrypoint.sh    # Bootstrap: wait → db push → seed → start
│   └── Dockerfile
├── frontend/
│   ├── src/routes/             # AppRoutes, AdminRoute, ClientRoute
│   ├── src/context/            # AuthContext (eAdmin / eCliente)
│   ├── src/utils/role.js       # Leitura centralizada da role
│   └── Dockerfile + nginx.conf
```

## 🔄 Práticas DevOps

- Contentorização total: frontend, backend e banco funcionam como serviços declarativos.
- Gestão de volumes persistentes usando um volume nomeado em vez de bind mount, o que evita fricção de permissões no Windows, Linux ou Mac e não polui o repositório.
- Configuração por ambiente com padrões seguros, usando `${VAR:-padrão}` no Compose, personalizável via `.env` e funcional mesmo sem ele.
- Arranque determinístico: primeiro o healthcheck do banco, depois a migração de esquema, o seed e só então a API.
- Integração contínua via GitHub Actions: a cada push ou PR para a `main`, jobs independentes validam o backend (install, `prisma validate`, `db push` mais seed contra uma MariaDB de serviço, e Jest) e o frontend (install, Vitest, build de produção).

## 🚀 Instruções de Execução

### Pré-requisitos

- Docker + Docker Compose (v2+)
- Portas livres: `3001`, `3002`, `3306`

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/laas26/techstore-db-mvp.git
cd techstore-db-mvp

# 2. (Opcional) Personalizar credenciais e segredos
# Crie um ficheiro `.env` na raiz se quiser trocar os padrões
# (ex.: DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET...)

# 3. Subir tudo (build + arranque), sem nenhum comando manual extra
docker compose up -d --build

# 4. Acompanhar o bootstrap (schema + seed automáticos)
docker compose logs -f backend
# ✅ Seed executado com sucesso.
```

Pronto: a loja fica disponível em <http://localhost:3001> e a API em <http://localhost:3002>.

### Credenciais de demonstração (seed)

| Perfil  | E-mail                    | Senha        | Destino após login |
| ------- | ------------------------- | ------------ | ------------------ |
| Admin   | `admin@techstore.local`   | `Admin@123`  | `/dashboard`       |
| Cliente | `cliente@techstore.local` | `Cliente@123`| `/client`          |

> ⚠️ Essas credenciais são exclusivas para desenvolvimento e demonstração. Nunca devem ser usadas em produção.

### Comandos úteis

```bash
docker compose ps                    # estado dos serviços
docker compose logs -f backend       # logs da API (inclui seed)
docker compose down                  # para tudo mantendo os dados
docker compose down -v               # para tudo apagando os dados (volume)
```

## ✅ Testes e Validações

O teste de resiliência consiste em derrubar a infraestrutura e subi-la novamente, comprovando a retenção dos dados:

```bash
# 1. Criar evidência (ex.: um produto via UI) e anotar a contagem
# 2. Derrubar a infraestrutura sem apagar volumes
docker compose down

# 3. Subir novamente
docker compose up -d

# 4. Confirmar: mesmos utilizadores, mesmos produtos, zero duplicados
docker compose exec db mariadb -u techstore_user -ptechstore_password techstore_v2 \
  -e "SELECT COUNT(*) AS usuarios, (SELECT COUNT(*) FROM produtos) AS produtos FROM usuarios;"
```

O resultado esperado é que as contagens sejam idênticas antes e depois. O seed idempotente (upsert) atualiza sem duplicar, e o volume `db_data` preserva tudo, incluindo os dados criados pelo utilizador.

## 🏆 Resultados Obtidos

O MVP foi validado com sucesso:

- ✅ `docker compose up -d --build` provisiona banco, esquema e dados do zero, sem comandos manuais.
- ✅ Os dados sobrevivem a quedas de infraestrutura (`down`/`up`, restarts, rebuilds).
- ✅ A separação de acessos por perfil (admin e cliente) funciona de ponta a ponta.
- ✅ A configuração é zero obrigatória: tudo funciona sem `.env`, mas a personalização continua possível.

## ⚠️ Limitações da Solução

- O foco atual está no ambiente local orquestrado (máquina do desenvolvedor ou demonstração).
- O `prisma db push` sincroniza o esquema a partir do `schema.prisma`, o que é adequado para o MVP mas não gera um histórico formal de migrações versionadas.
- Os segredos padrão embutidos servem à demonstração; em produção é necessária uma gestão dedicada de segredos.

## 🔮 Possíveis Evoluções Futuras

- 💾 Backups automatizados em nuvem, com snapshots agendados do volume e política de retenção.
- 🧬 Migrações de esquema versionadas (`prisma migrate`), com um pipeline de CI validando cada mudança.
- 🌐 Alta disponibilidade, com réplicas de leitura no MariaDB, múltiplas instâncias da API e monitorização e observabilidade.

---

<p align="center">TechStore · MVP de Persistência e Gestão de Dados · Problemática 03</p>