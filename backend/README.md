# TechStore - BackEnd

> API REST e regras de negócio da plataforma TechStore

---

## 🛠️ Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-20-000000?style=flat-square&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)
![Jest/Supertest](https://img.shields.io/badge/Jest%2FSupertest-Testes-000000?style=flat-square&logo=jest)
![Biome](https://img.shields.io/badge/Biome-Linter-000000?style=flat-square)
![DevSecOps](https://img.shields.io/badge/DevSecOps-Seguranca-000000?style=flat-square)

* **Runtime:** Node.js 20
* **Framework:** Express 5
* **Arquitetura:** API REST organizada em Middlewares, Controllers, Services, Repositories e Routes
* **Persistência:** arquivos JSON locais em `backend/data/`, adequada ao MVP e ao desenvolvimento
* **Autenticação:** JWT em cookie HttpOnly, com controle de sessões revogadas
* **Testes:** Jest e Supertest
* **Code Style:** Biome (linter e formatter)
* **Segurança:** Helmet, CORS, rate limiting e práticas de DevSecOps

---

## ⚙️ Variáveis de Ambiente

Crie o arquivo `.env` a partir do exemplo antes de iniciar o backend:

```bash
cd backend
cp .env.example .env
```

No Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Variáveis principais:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=uma-chave-longa-e-aleatoria
```

* `PORT` define a porta da API.
* `FRONTEND_URL` define a origem usada nos links de recuperação de senha.
* `JWT_SECRET` assina os tokens de autenticação e nunca deve ser compartilhado.
* Tokens de autenticação expiram em 1 hora, conforme definido no serviço de autenticação.

---

## 🔒 DevSecOps & Bootstrap

O [bootstrap.js](src/bootstrap.js) prepara os dados locais antes de o servidor Express começar a escutar. Para cada arquivo dinâmico, ele verifica a existência em `backend/data/` e copia a respectiva semente `.example` quando necessário:

* `pedidos.json`
* `sessoes_revogadas.json`
* `usuarios.json`

Os arquivos mutáveis são ignorados pelo Git. Assim, dados locais, sessões e pedidos não são versionados, enquanto as sementes sanitizadas permanecem rastreadas.

### Garbage Collection da blacklist

O serviço de sessões remove automaticamente registros cujo `expiraEm` já passou de `Date.now()`. A lista limpa é persistida novamente em `sessoes_revogadas.json`, evitando o crescimento indefinido da blacklist.

---

## 🔑 Credenciais de Desenvolvimento

Na primeira inicialização, o bootstrap cria `usuarios.json` a partir de `usuarios.json.example`. As contas padrão usam hashes bcrypt e a senha de desenvolvimento `senha123`:

| Perfil | E-mail | Senha |
| :--- | :--- | :--- |
| **Administrador** | `admin@techstore.local` | `senha123` |
| **Cliente** | `cliente@techstore.local` | `senha123` |

> Essas credenciais são exclusivas para desenvolvimento e testes locais. Nunca as utilize em produção.

---

## 📂 Estrutura Interna do Backend

```text
backend/
├── data/
│   ├── produtos.json              # Catálogo versionado
│   ├── pedidos.json.example       # Semente de pedidos
│   ├── sessoes_revogadas.json.example
│   └── usuarios.json.example      # Usuários de desenvolvimento
├── src/
│   ├── controllers/               # Entrada e resposta das requisições
│   ├── middlewares/               # Autenticação, validação e erros
│   ├── repositories/              # Leitura e escrita dos dados JSON
│   ├── routes/                    # Rotas HTTP da API
│   ├── services/                  # Regras de negócio e sessões
│   ├── app.js                     # Configuração do Express
│   ├── bootstrap.js               # Inicialização das sementes locais
│   └── server.js                  # Ponto de entrada do servidor
├── .env.example
├── Dockerfile
├── package.json
└── README.md
```

---

## 🚀 Instalação e Execução

### 🧑🏽‍💻 Desenvolvimento Local (sem Docker)

```bash
cd backend
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

Health check: `http://localhost:3000/health`

### 🛠️ Comandos Úteis

```bash
npm run lint       # Verifica lint e formatação
npm run lint:fix   # Aplica correções automáticas do Biome
npm test           # Executa a suíte de testes
npm run format     # Formata os arquivos
```

### 🐳 Execução com Docker

Na raiz do projeto:

```bash
docker compose up -d --build backend
docker compose logs -f backend
docker compose stop backend
```

---

## 🔗 Endpoints Principais

* `GET /health` - health check da API
* `POST /api/auth/login` - autenticação
* `POST /api/auth/logout` - encerramento da sessão
* `POST /api/auth/forgot-password` - geração do link de recuperação
* `POST /api/auth/reset-password` - redefinição da senha
* `POST /api/register` - cadastro de usuário
* `GET /api/produtos` - consulta do catálogo
* `POST /api/orders` - gravação de pedido
* `POST /api/checkout` - alias para gravação de pedido

---

## 🔗 Links Úteis

* [README principal](../README.md)
* [README do FrontEnd](../frontend/README.md)
* [Documentação do projeto](../docs/README.md)