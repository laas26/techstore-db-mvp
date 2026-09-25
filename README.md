# TechStore - MVP de Persistência e Gestão de Dados

> Aplicação web com arquitetura resiliente onde os dados sobrevivem à destruição e reinicialização dos contêineres.

[![CI Pipeline](https://github.com/laas26/techstore-db-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/laas26/techstore-db-mvp/actions) ![Version](https://img.shields.io/badge/version-1.0.0--mvp-000000?style=flat)

---

## 🎯 O Problema & A Solução

O desafio principal era garantir a persistência e a resiliência de dados críticos (usuários, autenticação, produtos) sem depender do ciclo de vida efémero dos contêineres.

**Solução:** Isolamento da camada de dados em um serviço dedicado com volume persistente nomeado, orquestração com arranque determinístico (healthcheck) e rotina de bootstrap automática e idempotente (aplicação de migrações e seed sem duplicação de dados).

---

##  🏗️ Arquitetura e Stack

<div align="center">
       
```text
 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
 │   Frontend   │      │   Backend    │      │  PostgreSQL  │
 │ React + Vite │─────▶│ Node.js +    │─────▶│  Volume     │
 │  Nginx :8080 │ /api/│ Express +    │      │  persistente │
 │              │      │ Prisma :3000 │◀─────│  pg_data    │
 └──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        └──────── Vitrine ────┴─── API REST ────────┴── Dados ──
```
</div>

| Camada | Tecnologia | Porta Local | Servidor Interno |
| :--- | :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React_19-000000?style=flat&logo=react&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router_7-000000?style=flat&logo=react-router&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-000000?style=flat&logo=vite&logoColor=white) | `3001` | Nginx `:8080` |
| **Backend** | ![NodeJS](https://img.shields.io/badge/Node.js_20-000000?style=flat&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express_5-000000?style=flat&logo=express&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma_6-000000?style=flat&logo=prisma&logoColor=white) | `3002` | API Express `:3000` |
| **Banco** | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-000000?style=flat&logo=postgresql&logoColor=white) | `5434` | Postgres `:5432` |
| **Qualidade** | ![Biome](https://img.shields.io/badge/Biome-000000?style=flat&logo=biome&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-000000?style=flat&logo=vitest&logoColor=white) ![Jest](https://img.shields.io/badge/Jest-000000?style=flat&logo=jest&logoColor=white) | - | - |
| **Infra / CI** | ![Docker](https://img.shields.io/badge/Docker_Compose-000000?style=flat&logo=docker&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-000000?style=flat&logo=github-actions&logoColor=white) | - | - |

---

## 🚀 Como Executar

### Pré-requisitos
* Docker + Docker Compose (v2+)
* Portas livres: `3001`, `3002`, `5434`

### Passo Único

```bash
# 1. Clonar e acessar o repositório
git clone https://github.com/laas26/techstore-db-mvp.git
cd techstore-db-mvp

# 2. Subir a aplicação (build + banco + migração + seed automáticos)
docker compose up -d --build
```

---

## 🔗 Links de Acesso

* 🛍️ **Aplicação Web** ➔ http://localhost:3001
* 🔌 **API Health / Readiness** ➔ http://localhost:3002/health/ready

---

## 🔑 Credenciais de Demonstração (Seed)

| Perfil | E-mail | Senha | Rota Inicial |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@techstore.local` | `Admin@123` | `/dashboard` |
| **Cliente** | `cliente@techstore.local` | `Cliente@123` | `/client` |

---

## 🧪 Validação de Resiliência (Teste Prático)

Para testar a retenção de dados após derrubar a infraestrutura:

```bash
# 1. Derrube os serviços (sem remover os volumes)
docker compose down

# 2. Suba o ambiente novamente
docker compose up -d

# 3. Verifique a permanência dos dados no banco
docker compose exec db psql -U techstore_user -d techstore_v2 \
  -c "SELECT COUNT(*) FROM usuarios; SELECT COUNT(*) FROM produtos;"

# 4. Execute a verificação automatizada de persistência
sh scripts/verify-persistence.sh
```
---

## 📑 Documentação & Materiais de Apresentação

Todos os recursos técnicos e entregáveis exigidos para a avaliação do MVP estão disponíveis abaixo:

* 📄 **[Documentação Técnica](./docs/DOCUMENTACAO_TECNICA.md)** ➔ Análise do problema, arquitetura detalhada, justificativas técnicas, cultura DevOps, limitações e roadmap.
* 📊 **[Slides da Apresentação (PDF)](./docs/slides-apresentacao.pdf)** ➔ Estrutura visual e decisões de engenharia.
---
<p align="center">TechStore · MVP de Persistência e Gestão de Dados</p>