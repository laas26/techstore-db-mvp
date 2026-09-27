# TechStore DB MVP — Relatório Completo do Sistema (build.md)

> Gerado em 27/09/2026 a partir de inspeção direta do repositório `techstore-db-mvp`.
> Escopo: arquitetura, lógica de negócio, backend, frontend, banco de dados, infra/DevOps, segurança, fluxos ponta-a-ponta, testes, limitações e roadmap.

---

## 1. Visão Geral do Projeto

**TechStore** é um MVP de e-commerce de eletrônicos focado em **persistência e gestão de dados resiliente em ambiente conteinerizado**.

**Problema central:** dados críticos (usuários, autenticação, produtos, carrinhos, pedidos) não podiam depender do ciclo de vida efêmero dos contêineres Docker. Destruir e recriar containers não podia apagar dados.

**Solução adotada:**
1. Isolar a camada de dados em serviço PostgreSQL dedicado com **volume nomeado persistente `pg_data`**.
2. Arranque determinístico: `healthcheck` (`pg_isready`) + `depends_on: service_healthy` garante ordem `db → backend → frontend`.
3. Bootstrap automático e idempotente no `entrypoint.sh`: `prisma generate + migrate deploy + seed` sem duplicar dados.
4. Consistência transacional no checkout (carrinho → estoque → pedido) + idempotência por `Idempotency-Key`.
5. Automação de prova: scripts `backup/restore/verify-backup/verify-persistence` + CI + smoke tests Docker.

**Stack resumida:**

| Camada | Tecnologia | Porta host | Porta interna |
|---|---|---|---|
| Frontend | React 19 + React Router 7 + Vite 8 + Nginx unprivileged | `127.0.0.1:3001` | `:8080` |
| Backend | Node 20 + Express 5 + Prisma 6 + JWT + bcrypt | `127.0.0.1:3002` | `:3000` |
| Banco | PostgreSQL 15 | `127.0.0.1:5434` | `:5432` |
| Qualidade | Biome, Jest 30 (backend), Vitest 3 + Testing Library (frontend) | — | — |
| Infra/CI | Docker Compose v2, GitHub Actions, Yarn 1.22 | — | — |

**Topologia (conforme `docker-compose.yml` + `README.md`):**

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

Rede dedicada `techstore_net` (bridge). Navegador só usa `http://localhost:3001`; Nginx faz proxy `/api/` → `http://techstore_backend:3000/api/`.

**Como executar (passo único):**

```bash
git clone https://github.com/laas26/techstore-db-mvp.git
cd techstore-db-mvp
docker compose up -d --build
# Web: http://localhost:3001
# Readiness: http://localhost:3002/health/ready
```

**Credenciais seed:**

| Perfil | E-mail | Senha | Rota |
|---|---|---|---|
| Admin | `admin@techstore.local` | `Admin@123` | `/dashboard` |
| Cliente | `cliente@techstore.local` | `Cliente@123` | `/client` |

---

## 2. Estrutura de Diretórios

```text
techstore-db-mvp/
├── backend/               # API Express + Prisma
│   ├── src/
│   │   ├── app.js         # composição Express (middlewares + rotas + health)
│   │   ├── server.js      # bootstrap (inicializarBanco + listen)
│   │   ├── database/connection.js, transaction.js
│   │   ├── middlewares/   # auth, admin, validarLogin/Cadastro, errorHandler
│   │   ├── routes/        # auth, register, user, product, cart, order
│   │   ├── controllers/   # auth, product, cart, order
│   │   ├── services/      # auth, session, product, cart, order
│   │   ├── repositories/  # user, product, cart, order (queries Prisma)
│   │   └── utils/crypto.js
│   ├── prisma/schema.prisma + migrations/ (3 migrações)
│   ├── scripts/seed.js
│   ├── tests/ (9 suítes, 32 testes)
│   ├── entrypoint.sh, Dockerfile, package.json, biome.json
├── frontend/              # SPA React + Vite + Nginx
│   ├── src/
│   │   ├── main.jsx, App.jsx, styles/theme.css (971 linhas, tokens + dark mode)
│   │   ├── routes/AppRoutes.jsx, AdminRoute.jsx, ClientRoute.jsx
│   │   ├── context/AuthContext, CartContext, ProductCatalogContext
│   │   ├── services/api, auth, product, cart, order (+ testes)
│   │   ├── hooks/useHome, useRegister, useForgotPassword, useResetPassword, useCart, useAuth
│   │   ├── pages/ (Home, Login, Register, Forgot/ResetPassword, Cart, Checkout,
│   │   │          Dashboard, Products, Orders, Users, Pix, Client, Profile,
│   │   │          AdminPlaceholder, NotFound)
│   │   └── components/layout, common, product, auth, home, cart, checkout, dashboard
│   ├── nginx.conf, Dockerfile (multi-stage), vite.config.js, index.html
├── docs/DOCUMENTACAO_TECNICA.md (738 linhas, 18 seções) + slides
├── scripts/backup.sh, restore.sh, verify-backup.sh, verify-persistence.sh
├── .github/workflows/ci.yml, test-docker-stack.yml
├── docker-compose.yml, README.md, .gitignore
```

---

## 3. Banco de Dados — Modelo Lógico e Físico

### 3.1. ORM e migrações

- `prisma/schema.prisma`: fonte única da verdade (`datasource postgresql`, `generator prisma-client-js`).
- `migration_lock.toml`: `provider = "postgresql"`.
- 3 migrações versionadas:
  - `20260924000000_init`: baseline — cria `usuarios, produtos, carrinhos, pedidos, pedido_itens, sessoes_revogadas` + FKs Cascade + `UNIQUE usuarios.email`.
  - `20260925000000_transactional_orders`: checkout transacional — adiciona `pedidos.entrega JSONB, idempotency_key VARCHAR(128), pagamento TEXT DEFAULT 'pix-simulado'`, `pedido_itens.nome_produto TEXT` (snapshot), `UNIQUE carrinhos(usuario_id,produto_id)`, `UNIQUE pedidos(usuario_id,idempotency_key)`, índices `pedidos(usuario_id,created_at)` e `pedido_itens(produto_id)`, FK `pedido_itens.produto_id → Restrict`, CHECKs `stock>=0, preco>=0, total>=0, quantidade>0`.
  - `20260926000000_idempotency_fingerprint`: `pedidos.idempotency_hash CHAR(64)` (fingerprint SHA-256 do payload para detectar reuso indevido da chave).

### 3.2. Diagrama entidade-relacionamento (lógico)

```text
USUARIOS (1)───(N) CARRINHOS (N)───(1) PRODUTOS
    │                                       │
    │(1)                                    │(1)
    │                                       │
    │(N)                                    │(N)
  PEDIDOS (1)───(N) PEDIDO_ITENS ───────────┘
                    (snapshot nome+preço)

SESSOES_REVOGADAS (autônoma, lista de bloqueio JWT por jti)
```

### 3.3. Tabelas e campos (físico)

| Tabela | Campos principais | Constraints |
|---|---|---|
| `usuarios` | `id SERIAL PK, nome TEXT, email TEXT UNIQUE, senhaHash TEXT, role TEXT DEFAULT 'user', tokenRedefinicaoHash TEXT?, tokenRedefinicaoExpiraEm BIGINT?, created_at TIMESTAMP` | e-mail normalizado `trim().toLowerCase()` no repository |
| `produtos` | `id SERIAL PK, nome TEXT, descricao TEXT?, preco DECIMAL(10,2), stock INT DEFAULT 0, categoria TEXT?, imagem TEXT?, created_at` | `CHECK preco>=0, stock>=0` |
| `carrinhos` | `id SERIAL PK, usuario_id FK→usuarios CASCADE, produto_id FK→produtos CASCADE, quantidade INT DEFAULT 1` | `UNIQUE (usuario_id, produto_id)`, `CHECK quantidade>0` |
| `pedidos` | `id SERIAL PK, usuario_id FK→usuarios CASCADE, total DECIMAL(10,2), status TEXT DEFAULT 'pendente', idempotency_key VARCHAR(128)?, idempotency_hash CHAR(64)?, entrega JSONB?, pagamento TEXT DEFAULT 'pix-simulado', created_at` | `UNIQUE (usuario_id, idempotency_key)`, `INDEX (usuario_id, created_at)`, `CHECK total>=0` |
| `pedido_itens` | `id SERIAL PK, pedido_id FK→pedidos CASCADE, produto_id FK→produtos RESTRICT, quantidade INT, preco_unitario DECIMAL(10,2), nome_produto TEXT?` | `INDEX (produto_id)`, `CHECK quantidade>0, preco>=0`. `RESTRICT` impede deletar produto com histórico de venda (vira `409 ProdutoEmUso`) |
| `sessoes_revogadas` | `id SERIAL PK, token TEXT (=jti), revoked_at TIMESTAMP, expiraEm TIMESTAMP?` | `INDEX (jti)`, `INDEX (expiraEm)`, GC de expirados a cada revogação/consulta |

**Decisões lógicas importantes:**
- `Decimal(10,2)` para dinheiro + monkey-patch `Decimal.prototype.toJSON → Number` e `BigInt.prototype.toJSON → String` em `connection.js` para serialização JSON segura.
- Snapshot `nome_produto + preco_unitario` em `pedido_itens` preserva histórico mesmo se produto mudar/deletar depois.
- `entrega JSONB` (`nome,endereco,numero,bairro,cidade,cep` normalizado com 8 dígitos) evita tabela extra no MVP.
- `idempotency_key + idempotency_hash`: replay seguro (mesma chave + mesmo payload retorna pedido existente; mesma chave + payload diferente → `409`).

---

## 4. Backend — Arquitetura em Camadas e Lógica

Padrão: `Routes → Middlewares → Controllers → Services → Repositories → Prisma/Postgres`. Controllers finos (HTTP), Services com regras, Repositories só com queries.

### 4.1. Núcleo (`src/app.js`, `server.js`, `database/`)

- **`src/app.js`** (exporta `app`):
  - `parseTrustProxy(TRUST_PROXY)` → `app.set('trust proxy', ...)`.
  - Globais: `helmet` (CSP `connect-src self + localhost:3000,3001,3002,5173`), `cors` (allowlist `FRONTEND_ORIGINS` senão defaults, `credentials:true`), `express.json({limit:'100kb'})`, `cookieParser()`.
  - Health: `GET /health/live → {ok}`, `GET /health/ready → prisma.$queryRaw SELECT 1 → {ready/up}` ou `503`, `GET /health → {ok}` (compat).
  - Montagem: `/api/auth` (authRoutes), `/api` (registerRoutes → `POST /register`), `/api/users` (userRoutes), `/api` (productRoutes → `/produtos`), `/api/orders` + `/api/checkout` (alias, orderRoutes), `/api/cart` (cartRoutes), `errorHandler` final.
- **`src/server.js`**: `inicializarBanco()` com retry 3s, depois `listen(PORT||3000)`.
- **`src/database/connection.js`** (`prisma, inicializarBanco`): resolve `DATABASE_URL` (usa se `postgres://`, monta de `DB_HOST/PORT/USER/PASSWORD/NAME` senão; em `production` sem protocolo dá throw), `new PrismaClient`, log verboso só em development.
- **`src/database/transaction.js`** (`bloquearUsuario(usuarioId, client)`): `SELECT id FROM usuarios WHERE id=... FOR UPDATE` — trava a linha do usuário para serializar operações concorrentes de carrinho/pedido do mesmo usuário (evita oversell e condição de corrida).
- **`src/utils/crypto.js`**: `hashSenha/compararSenha` (bcrypt 10 rounds), `gerarToken/verificarToken` (JWT 1h). Duplicado legado de `authService`.

### 4.2. Middlewares (`src/middlewares/`)

| Arquivo | Função | Lógica |
|---|---|---|
| `authMiddleware.js` | Autenticação JWT via cookie | Lê `req.cookies.sessionToken` → `401` se ausente; `jwt.verify` → `403` se inválido; exige `jti+exp` → `403`; `sessaoFoiRevogada(jti)` → `401` se revogada, `503` se DB falhar; set `req.usuarioId` |
| `adminMiddleware.js` | Autorização RBAC | `buscarPorId(req.usuarioId)`; se `role.toLowerCase()!=='admin'` → `403`; set `req.usuario`. Sempre após `authMiddleware` |
| `validarLogin.js` | Validação entrada login | Exige `email+senha`, regex e-mail → `400` |
| `validarCadastro.js` | Validação registro | Exige `nome/email/senha`, regex e-mail, `senha>=6` → `400` |
| `errorHandler.js` | Mapa erro→HTTP | `CredenciaisInvalidas→401`, `DadosProduto/Carrinho/Pedido/Transicao→400`, `PedidoConflito/ProdutoEmUso→409`, resto `500` |

### 4.3. Rotas (método + caminho + cadeia)

| Método | Caminho | Cadeia |
|---|---|---|
| `POST` | `/api/auth/login` | `loginLimiter (rate-limit 15min, limit LOGIN_RATE_LIMIT\|\|5, skipSuccessfulRequests:true) + validarLogin + login` |
| `POST` | `/api/auth/logout` | `logout` |
| `POST` | `/api/auth/forgot-password` | `forgotPassword` |
| `POST` | `/api/auth/reset-password` | `resetPassword` |
| `POST` | `/api/register` | `validarCadastro + register` (público) |
| `GET` | `/api/users/perfil` | `authMiddleware` → `200 {mensagem, usuarioId}` |
| `GET` | `/api/produtos` | público `listar` |
| `POST` | `/api/produtos` | `auth+admin+criar` |
| `PATCH/PUT` | `/api/produtos/:id` | `auth+admin+atualizar` (mesmo handler) |
| `DELETE` | `/api/produtos/:id` | `auth+admin+remover` |
| `GET` | `/api/cart/` | `auth (global no router) + listar` |
| `POST` | `/api/cart/items` | `auth + adicionarOuAtualizar` |
| `DELETE` | `/api/cart/items/:id` | `auth + remover` (`:id` = produtoId) |
| `POST` | `/api/orders/` e `/api/checkout/` (alias) | `auth + criarPedido` |
| `POST` | `/api/orders/:id/simulate-payment` e `/api/checkout/:id/simulate-payment` | `auth + simularPagamento` |

### 4.4. Controllers (`src/controllers/`)

- **`authController.js`** (`login,logout,register,forgotPassword,resetPassword`):
  - Cookie helper: `httpOnly:true, secure:(NODE_ENV==production), sameSite:'strict', path:'/', maxAge 1h`.
  - `login`: `email.trim + senha||password` → `authService.autenticar` → `res.cookie(sessionToken)` + `200 {usuario}`; `401` se credenciais.
  - `register`: `201 {mensagem, usuario:{id,nome,email}}`; `409` e-mail duplicado.
  - `forgotPassword`: sempre `200` genérico (anti-enumeração).
  - `resetPassword`: `{token,novaSenha}` → `200`; `400` token inválido.
  - `logout`: sem cookie→`401`; token inválido→limpa+`401`; `revogarSessao(jti,exp)`→limpa+`200`.
- **`productController.js`**: `listar→200 array`, `criar→201 {produto}`, `atualizar→200\|404`, `remover→200\|404`, erros via `next`.
- **`cartController.js`**: `listar/adicionarOuAtualizar/remover` → `200 {carrinho:{usuarioId,itens,quantidadeTotal,total}}` usando `req.usuarioId`.
- **`orderController.js`**: `criarPedido` lê chave de `header Idempotency-Key || body.idempotencyKey` → `201 {mensagem:'Pedido salvo', pedido}`; `simularPagamento` → `200 {pedido}`.

### 4.5. Services — regras de negócio

**`authService.js`** (`autenticar,cadastrar,gerarTokenRecuperacao,redefinirSenha`):
- `autenticar`: `buscarPorEmail` → `bcrypt.compare` → `jwt.sign({id}, secret, {expiresIn:'1h', jwtid:randomUUID()})` → `{token, usuario}`.
- `cadastrar`: `bcrypt.hash(10)` → `criarUsuario({...role:'user'})`.
- `gerarTokenRecuperacao`: `randomBytes(32).hex`, `sha256→hash`, `expira=now+1h` → `criarTokenRedefinicao`; loga link `${FRONTEND_URL}/reset-password?token=...`; retorna null se e-mail vazio.
- `redefinirSenha`: valida presença, `sha256`, `bcrypt.hash nova` → `atualizarSenhaPorToken` senão throw.

**`sessionService.js`** (`revogarSessao,sessaoFoiRevogada`):
- `revogarSessao(jti,expiraEm)`: converte `Date→ms / number→*1000`, `prisma.$transaction`: `deleteMany expiraEm<now` (GC) + `findFirst jti` → `update` ou `create({jti,expiraEm})`.
- `sessaoFoiRevogada(jti)`: `findFirst`; se sem expira usa `revokedAt+1h`; se expirada `deleteMany`+`false`, senão `true`.

**`productService.js`**: `validarProduto(dados,parcial)` — exige objeto; se criação exige `nome,preco,categoria,descricao,stock`; tipos `string não-vazia, preco finite>=0, stock int>=0`; whitelist `selecionarCamposProduto`; delega ao repository.

**`cartService.js`**:
- `listarCarrinho → buscarPorUsuarioId → montarResumo`.
- `adicionarOuAtualizarItem(usuarioId,{produtoId||id,quantidade})`: valida `produtoId` presente, `quantidade int>0`; `prisma.$transaction`: `bloquearUsuario` → `listarPorId` + check `quantidade<=stock` → merge item existente/novo → `salvarPorUsuarioId` → resumo `{usuarioId,itens[{produtoId,nome,descricao,preco,imagem,quantidade,subtotal}],quantidadeTotal,total}`.
- `removerItem`: valida id, `bloquear+buscar+filtrar+salvar`.

**`orderService.js`** (coração transacional):
- `validarEntrega`: exige `nome,endereco,numero,bairro,cidade,cep` strings trim, `cep` com 8 dígitos → normalizado.
- `validarPagamento`: só `pix-simulado` (default).
- `validarItens`: array não-vazio, `produtoId int>0` único, `quantidade int>0`.
- `resolverIdempotencyKey`: trim não-vazio `<=128` senão erro `Informe cabeçalho Idempotency-Key`.
- `calcularHashPedido = sha256(JSON{entrega,pagamento})`; `obterPedidoReplay`: se hash diverge → `PedidoConflitoError`, senão `formatarPedido`.
- `finalizarPedido(usuarioId,checkout,chave)`: valida tudo → `prisma.$transaction`: `bloquearUsuario` → `buscarRegistroPorIdempotencyKey`→replay → `buscarPorUsuarioId` (carrinho) + `validarItens` → `baixarEstoque` (`EstoqueInsuficiente→PedidoInvalidoError`) → `total=sum subtotal` → `criarPedido({status:'pendente',key,hash,entrega,pagamento})` → `salvarPorUsuarioId([],tx)` (limpa carrinho). Catch `P2002`→re-busca replay (corrida).
- `simularPagamento`: bloqueado em `production`; `atualizarStatus(id,usuarioId,'pago')` senão `Pedido não encontrado`.

### 4.6. Repositories — queries Prisma

- **`userRepository.js`**: `buscarPorEmail (lower), buscarPorId, criarUsuario (P2002→EmailJaCadastrado, retorna id String), criarTokenRedefinicao (P2025→false), atualizarSenhaPorToken (findFirst hash+expira>now → update limpa token)`.
- **`productRepository.js`**: `listarTodos (orderBy created_at desc), listarPorId, criarProduto, atualizarProduto (P2025→null), removerProduto (P2025→null, P2003→ProdutoEmUsoError), baixarEstoque(itens,client)` — agrupa por produto ordenado asc (anti-deadlock), `findUnique` + `updateMany({where:{id,stock:{gte:q}}, data:{stock:{decrement:q}}})` verifica `count==1`, retorna snapshots com `subtotal=preco*qtd`.
- **`cartRepository.js`**: `buscarPorUsuarioId (include produto, orderBy produto_id asc → mapearItem com subtotal)`, `salvarPorUsuarioId (filtra qtd>0, deleteMany notIn ou all, loop upsert where usuario_id_produto_id → re-busca; envolve em transaction se client==prisma)`.
- **`orderRepository.js`**: `formatarPedido (ids→String, total→Number, criadoEm ISO)`, `criarPedido (create com itens nested + include)`, `buscarRegistroPorIdempotencyKey`, `atualizarStatus (transaction bloquear→findFirst→se mesmo status retorna→se pago e atual!=pendente throw Transicao→update include itens)`.

### 4.7. Seed idempotente (`scripts/seed.js`)

- `executarSeeds, produtosIniciais, usuariosIniciais`; se `require.main` → script.
- `findUnique(email)` → se ausente `bcrypt.hash+create`; `findFirst(nome)` → se ausente `create`. Nunca sobrescreve.
- Usuários: `admin@techstore.local/admin`, `cliente@techstore.local/user`; senhas via `SEED_ADMIN_PASSWORD/SEED_CLIENTE_PASSWORD` ou fallback `Admin@123/Cliente@123` (throw em production sem env).
- 8 produtos: `Caixa Sonic 299.9/25/audio, Sonic Buds X 199.9/40, Notebook Titan 7499.9/12/notebooks, Note Slim 4299.9/18, Mouse Precision 89.9/60/perifericos, Teclado Mecânico 249.9/35, Pen Drive 128GB 69.9/80, Toca-discos Vintage 899.9/10`.

### 4.8. Testes backend (9 suítes)

`health, auth (login/logout/cookie), register (201/409/400+hash), user (perfil 401/200), crypto (hash/JWT), sessionService (revogar/identificar/GC/sem jti), orderCart (transacional: cart, orders com entrega/pagamento, Idempotency-Key, simulate-payment idempotente, 409 reuse, concorrência sem oversell, rollback estoque, 400 sem chave/entrega), rateLimit (bloqueio após N), seed (não sobrescreve)`. Comando: `cd backend && yarn test --runInBand`.

---

## 5. Frontend — SPA, Rotas, Estado e Lógica

### 5.1. Stack e config

- `React 19.2.8, react-router-dom 7.18.2, lucide-react, Vite 8.2, Vitest+jsdom+TestingLibrary, Biome`.
- `vite.config.js`: `plugin-react, jsx automatic, server 5173 host:true, proxy /api → http://techstore_backend:3000, sourcemap:false, test globals+jsdom`.
- `nginx.conf`: `listen 8080, root dist, headers X-Frame DENY/nosniff/Referrer/CSP (img/connect localhost:3001,3002), /api/ → proxy_pass backend:3000/api/, / → try_files index.html` (SPA fallback).
- `Dockerfile` multi-stage: `node:20-alpine (install+build)` → `nginxinc/nginx-unprivileged:alpine (dist + nginx.conf)`.
- `VITE_API_URL=/api` (Docker) ou `http://localhost:3002` (dev local); `apiFetch` normaliza sem duplicar `/api`, `credentials:include` (cookie HttpOnly), `204→null`, erro vira `Error(erro||message)` com `.status`.
- `theme.css` (971 linhas): tokens `--color-primary #2563eb, secondary #7c3aed, background/surface/border/text, radius, container 1200px, breakpoints 640/1024`, `[data-theme=dark]`, classes `btn-*, input-field, dash-*, product-*, site-*, hero-slider, cart/checkout/auth/pix` + responsivo. Demais arquivos usam majoritariamente `style={{}}` inline.

### 5.2. Rotas React Router (`App.jsx → AppRoutes.jsx`)

| Rota | Página | Guard | Layout |
|---|---|---|---|
| `/` | `Home` | pública | `HeroSlider + ProductFilters + ProductList + Footer` |
| `/login` | `Login` | pública, logado redireciona `admin→/dashboard, user→/client` | `Navbar + LoginForm + footer` |
| `/register` | `Register` | pública | `PageLayout + RegisterForm` (sem Navbar dedicada) |
| `/forgot-password` | `ForgotPassword` | pública | `PageLayout + form` |
| `/reset-password?token=` | `ResetPassword` | pública, token via `useSearchParams` | `PageLayout + form` |
| `/cart` | `Cart` | `RequireAuth` | `cart/CartItemList + CartSummary` |
| `/checkout` | `Checkout` | `RequireAuth` | `AddressForm + CartItemList + OrderSummary + PixPaymentModal + CheckoutFooter` |
| `/profile` | `Profile` | `RequireAuth` | `eAdmin ? AdminPlaceholder : cartão neutro` |
| `/client` | `Client` | `ClientRoute` (não-admin; admin→dashboard, deslogado→login) | placeholder links Loja/Carrinho/Perfil |
| `/dashboard` | `Dashboard` | `AdminRoute` (role==admin) | `Sidebar + KpiCards + OrdersTable + StockAlerts` |
| `/products` | `Products` | `AdminRoute` | `Sidebar + toolbar + tabela + ProductModal` |
| `/orders` | `Orders` | `AdminRoute` | `AdminPlaceholder(Pedidos)` |
| `/users` | `Users` | `AdminRoute` | `AdminPlaceholder(Clientes)` |
| `/pix` | `Pix` | `AdminRoute` | `AdminPlaceholder(Pix)` |
| `*` | `NotFound` | pública | `404` |

Guards: `RequireAuth (usuarioLogado ? children : /login)`, `AdminRoute (carregando→wait, !logado→/login, eAdmin?Outlet:/client)`, `ClientRoute (eAdmin→/dashboard)`. Links mortos (404): `Navbar /support`, footers `/about,/privacy,/terms,/shipping,/contact`, `ProductSearch result → /`.

### 5.3. Estado global (Contexts)

- **`AuthContext`**: `usuarioLogado,setUsuarioLogado,carregando,eAdmin,eCliente,role`. Persistência `localStorage techstore-user + techstore-remember==true` senão `sessionStorage`. Hidrata no mount, sincroniza em `useEffect`. Role via `utils/role.js` (`getRole/isAdmin/isClient`, lê `role|usuario.role|user.role|permissao`).
- **`CartContext`**: `carrinho,itens,quantidadeTotal,total,carregando,erro,adicionarProduto,alterarQuantidade,removerProduto,limparCarrinho(local-only)`. Normaliza `produtoId→id string`. Busca quando `usuarioLogado` muda; limpa no logout.
- **`ProductCatalogContext`**: `produtos,carregando,erro,recarregar`. Retry `4x backoff 500*2^attempt`.
- Local: `useHome(categoriaAtiva,precoMaximo,erroCarrinho)`, `Checkout(dadosEntrega,mensagem,modalPix)`, `Products(busca,categoria,form,edição,erro)`, `Dashboard(period)`, `HeroSlider(slide+5s)`, `PixPaymentModal(processando,pedido,erro,idempotencyKey)`.

### 5.4. Services frontend → endpoints

Base `VITE_API_URL||/api`, sempre `credentials:include`:

| Método | Endpoint | Chamador |
|---|---|---|
| `POST` | `/auth/login {email,senha}` | `authService.login ← Login` |
| `POST` | `/auth/logout` | `authService.logout ← Navbar,Sidebar,Header` |
| `POST` | `/register {nome,email,senha}` | `authService.register ← useRegister` |
| `POST` | `/auth/forgot-password {email}` | `useForgotPassword ← ForgotPasswordForm` |
| `POST` | `/auth/reset-password {token,novaSenha}` | `useResetPassword ← ResetPasswordForm` |
| `GET` | `/produtos` | `productService.listarProdutos (cache singleton + dedup + normalizar /img/) ← ProductCatalogContext, Products, ProductSearch` |
| `POST` | `/produtos` | `criarProduto ← Products` |
| `PATCH` | `/produtos/:id` | `atualizarProduto ← Products` |
| `DELETE` | `/produtos/:id` | `removerProduto ← Products` |
| `GET` | `/cart` | `cartService.buscarCarrinho ← CartContext` |
| `POST` | `/cart/items {produtoId,quantidade}` | `salvarItemCarrinho ← CartContext` |
| `DELETE` | `/cart/items/:produtoId` | `removerItemCarrinho ← CartContext` |
| `POST` | `/orders {entrega} + Idempotency-Key: uuid` | `orderService.criarPedido ← PixPaymentModal` |
| `POST` | `/orders/:id/simulate-payment` | `orderService.simularPagamento ← PixPaymentModal` |
| `GET` externo | `viacep.com.br/ws/:cep/json/` | `Checkout` autocomplete (fetch + AbortController) |

### 5.5. Páginas e componentes principais

- **Entry/Shell**: `main.jsx (StrictMode+App+theme.css)`, `App.jsx (BrowserRouter>Auth>Catalog>Cart>AppShell; suprime Navbar em auth/admin, flush em home)`.
- **Home**: `useHome` filtro `categoria/precoMax(15000)` + `produtosFiltrados useMemo`, `adicionarQuantidade` exige login senão `/login`.
- **Login**: `email,senha,lembrar,erro,carregando`; `login→setUsuario→navigate dashboard|client`; já-logado `<Navigate>`.
- **Register/Forgot/Reset**: hooks com validação (senhas iguais, força Fraca/Média/Forte), mensagens anti-enumeração.
- **Products (admin CRUD)**: `listar→normalizar+adaptar (nome→name, preco→price, categoria→Notebooks/Periféricos/Áudio, status estoque)`, filtro busca+categoria, `ProductModal` validação `nome,price>=0,stock int>=0`, `401/403` tratados, `recarregarCatalogo()` após mutação.
- **Cart**: `useCart → CartItemList (tabela Produto/Qtd/Subtotal, +/-/×) + CartSummary (subtotal, frete 'A calcular' + CEP inoperante, Total, link /checkout desabilitado se vazio)`.
- **Checkout**: `dadosEntrega{nome,endereco,numero,bairro,cidade,cep}` preenche nome, ViaCEP autocomplete, validação obrigatórios; `OrderSummary (Grátis, PIX único, Finalizar→abre modal)`; `PixPaymentModal (BR Code hardcoded, QR decorativo CSS, Copiar clipboard, criarPedido(uuid)→confirmarPagamento→comprovante id/status/total, <dialog open>)`.
- **Dashboard (mock visual, sem fetch)**: props `kpis,orders,stockAlerts` vazios; `Sidebar+KpiCards+OrdersTable+StockAlerts`.
- **Layout/common**: `Navbar (86px, logo, Loja/Suporte/Painel, ProductSearch startsWith, carrinho, perfil dropdown, logout API)`, `Sidebar (Dashboard/Estoque/Pedidos/Clientes/Pix + Sair)`, `Header (legado, import quebrado, morto)`, `Footer/PageLayout`, `Button/Input/Logo/PasswordVisibilityButton`.
- **Produto**: `ProductCard (BRL pt-BR, botão +)`, `ProductList (grid auto-fit)`, `ProductFilters (Todos/Áudio/Notebooks/Periféricos + slider preço)`, `ProductModal (name,sku,category,price,stock,image,description)`, `ProductSearch (dropdown absoluto, Link→/)`.
- **Checkout/dashboard**: `AddressForm, checkout/CartItemList, OrderSummary, PaymentMethods (só PIX), PixPaymentModal, CheckoutFooter, KpiCards, OrdersTable, StockAlerts`.
- Testes frontend: `productService.test (dedup+cache), orderService.test (header idempotência), Login.test (role=alert em erro)`. Comando: `yarn vitest run + yarn build`.

---

## 6. Infra, DevOps e Persistência

### 6.1. `docker-compose.yml` (Compose v2, sem `version`)

- **`db`**: `postgres:15, container techstore_db, restart unless-stopped`, env `POSTGRES_DB/USER/PASSWORD` via `${DB_*:-default}`, `ports 127.0.0.1:5434:5432`, `volume pg_data:/var/lib/postgresql/data`, `healthcheck pg_isready interval 2s/timeout 3s/retries 10/start 2s`, `network techstore_net`.
- **`backend`**: `build ./backend, image techstore-backend:latest`, `ports 127.0.0.1:3002:3000`, env centralizados (`NODE_ENV, PORT, TRUST_PROXY, LOGIN_RATE_LIMIT, FRONTEND_URL/ORIGINS, SEED_ON_START, SEED_*_PASSWORD, JWT_SECRET (vazio→gerado), DB_HOST=db, DB_USER/PASSWORD/NAME, DATABASE_URL`), `volumes ./backend:/app + /app/node_modules`, `healthcheck node fetch /health/ready interval 5s/retries 12/start 30s`, `depends_on db healthy`, `entrypoint sh /app/entrypoint.sh, command yarn dev`, `network techstore_net`.
- **`frontend`**: `build ./frontend`, `ports 127.0.0.1:3001:8080`, `depends_on backend healthy`, `network techstore_net`.
- **Volumes/redes**: `pg_data (local)`, `techstore_net (bridge)`.

### 6.2. `entrypoint.sh` (bootstrap determinístico)

1. Monta `DATABASE_URL` se ausente (defaults `techstore_user/techstore_password@db:5432/techstore_v2`).
2. `JWT_SECRET`: usa env, senão lê `./.jwt_secret (600)` ou gera `crypto.randomBytes(32).hex` e persiste.
3. Sempre: `npx prisma generate && npx prisma migrate deploy`.
4. Se `SEED_ON_START!=false` (default true): `node scripts/seed.js`.
5. `exec "$@"` ( `yarn dev` em Compose, `yarn start` em prod).

Ordem garantida: `Postgres → healthcheck → Prisma Client → Migrations → Seed → Express → Frontend`.

### 6.3. Variáveis de ambiente

Backend `.env.example`: `PORT=3000, TRUST_PROXY=false, LOGIN_RATE_LIMIT=5, FRONTEND_URL=http://localhost:3001, FRONTEND_ORIGINS=http://localhost,..., SEED_ON_START=true, SEED_*_PASSWORD=, JWT_SECRET= (openssl rand -hex 32), DB_HOST=db, DB_USER, DB_PASSWORD, DB_NAME=techstore_v2, DATABASE_URL=postgresql://...@db:5432/...`. Frontend `.env.example`: `VITE_API_URL=/api, NODE_ENV=development`. CI usa mocks efêmeros; prod deve usar Secrets. `.gitignore` protege `.env, .jwt_secret, backups/, backend/data/`.

### 6.4. Scripts `scripts/`

| Script | Função |
|---|---|
| `backup.sh` | `pg_dump --format=custom --no-owner` via `compose exec -T db` → `backups/techstore-TIMESTAMP.dump` (`umask 077`, trap cleanup, `BACKUP_FILE` override) |
| `restore.sh` | Valida arquivo + exige `CONFIRM_RESTORE=YES` + valida `TARGET_DB` regex → `pg_restore --no-owner --exit-on-error` (+ `--clean` se `RESTORE_CLEAN=true`) via stdin |
| `verify-backup.sh` | `backup → dropdb/createdb techstore_restore_test → restore TARGET_DB → compara COUNT usuarios,produtos,carrinhos,pedidos,pedido_itens` entre original e restore; trap limpa |
| `verify-persistence.sh` | `up -d → wait /health/ready (60×2s) → INSERT produto MARKER RETURNING id → down (preserva volume) → up -d → wait → SELECT id WHERE nome=MARKER`; falha se IDs diferirem; trap `up -d + DELETE marker` |

Validação de resiliência manual (README): `compose down (sem -v!) → up -d → SELECT COUNT usuarios/produtos → sh scripts/verify-persistence.sh`. **Aviso: `down -v` apaga `pg_data`.**

### 6.5. CI/CD (`.github/workflows/`)

- **`ci.yml`** (`push/PR main,develop + dispatch`):
  - `backend` (service `postgres:15`, env mock `JWT_SECRET=ci-only..., DATABASE_URL=...@127.0.0.1`): `checkout → setup-node 20 cache yarn → install --frozen-lockfile → prisma validate → generate → migrate deploy → seed → test --runInBand (bloqueante) → lint Biome (continue-on-error)`.
  - `frontend`: `checkout → setup Node → install --ignore-engines → vitest run → build → lint (continue-on-error)`.
- **`test-docker-stack.yml`** (`Smoke Tests`, timeout 20min): `up -d --build → wait 60×5s (curl :3001/ + :3002/health/ready + :3002/api/produtos) → smoke1 frontend 200 → smoke2 readiness 200 → smoke3 produtos 200 → smoke4 jq array length>0 → smoke5 verify-backup → smoke6 verify-persistence`; `on failure: compose ps + logs 300 linhas`.

---

## 7. Segurança, Autenticação e Autorização

- **Auth**: JWT 1h com `jti (uuid)` em cookie `sessionToken HttpOnly, Secure em prod, SameSite Strict, Path /, MaxAge 1h`. Login retorna `{usuario}`, logout revoga `jti` e limpa cookie.
- **Revogação**: tabela `sessoes_revogadas` + GC; `authMiddleware` nega `401` se revogada, `503` se DB indisponível.
- **RBAC**: `role` (`admin|user`, case-insensitive); `adminMiddleware` → `403` se não-admin. Rotas admin: `POST/PATCH/PUT/DELETE /produtos`.
- **Validação**: `validarLogin/validarCadastro` (regex e-mail, senha>=6), `validarProduto`, `validarEntrega/Carrinho/Pedido`, `express.json limit 100kb`.
- **Headers/CORS**: `helmet` + CSP, `cors allowlist + credentials:true`, `TRUST_PROXY` configurável.
- **Rate-limit**: login `15min / LOGIN_RATE_LIMIT (5) / skipSuccessfulRequests:true → {erro:'Muitas tentativas'}`.
- **Recuperação senha**: token `randomBytes(32)` + `sha256` armazenado + expira 1h (BigInt), anti-enumeração (resposta genérica), `bcrypt` para nova senha.
- **Segredos**: `JWT_SECRET` nunca versionado (gerado + `./.jwt_secret`); `SEED_*_PASSWORD` via env (throw em prod sem env); `.gitignore` bloqueia `.env/.jwt_secret/backups`.
- **DB**: `Restrict` em pedido_itens, `CHECKs`, `UNIQUEs`, transações com `FOR UPDATE` + `updateMany stock>=q` (sem oversell).

---

## 8. Fluxos Ponta-a-Ponta (lógica sequencial)

### 8.1. Registro → Login → Vitrine
`Register (validar senhas iguais) → POST /register → 201 → navigate /login (400ms) → Login (lembrar→localStorage senão sessionStorage) → POST /auth/login → cookie sessionToken + setUsuario → navigate /dashboard (admin) | /client (user) → Home (ProductCatalogContext listar /produtos com retry, filtros categoria/preço, ProductSearch)`.

### 8.2. Carrinho
`useHome.adicionar (exige login) → CartContext.adicionarProduto → POST /cart/items {produtoId,quantidade} → [auth → validar → transaction bloquearUsuario → check stock → upsert → resumo] → 200 {carrinho} → Cart (/cart: alterar +/-/× → POST/DELETE /cart/items) → CartSummary → /checkout`.

### 8.3. Checkout transacional + Pix simulado (fluxo crítico)
`Checkout (preenche entrega, ViaCEP autocomplete, valida obrigatórios) → Finalizar → PixPaymentModal (gera uuid Idempotency-Key) → criarPedido({entrega},uuid) → POST /orders + header → [auth → validar entrega/pagamento/itens/chave → transaction: bloquearUsuario → replay? → buscar carrinho → baixarEstoque (ordenado, updateMany stock>=q) → criarPedido pendente + snapshot → limpar carrinho] → 201 {pedido} → simularPagamento(id) → POST /orders/:id/simulate-payment → [bloquear → find → se mesmo status retorna → se pago e atual!=pendente throw → update pago] → 200 → comprovante → onPagamentoConfirmado (limparCarrinho local + recarregar catálogo)`. Replay: mesma chave+mesmo hash→retorna existente; mesma chave+hash diferente→`409`; sem chave→`400` sem alterar carrinho/estoque.

### 8.4. Admin produtos
`/products (AdminRoute) → listar /produtos → normalizar/adaptar → filtro busca+categoria → ProductModal (create/edit) → POST/PATCH /produtos (auth+admin) → limparCacheCatalogo + recarregar → DELETE (P2003→409 se em pedido)`.

### 8.5. Recuperação senha / Logout / Persistência
`Forgot (POST email → 200 genérico, backend cria hash+expira e loga link) → Reset (?token → POST {token,novaSenha} → 200) → Login. Logout: POST /auth/logout → revogar jti → clear cookie → setUsuario null → /login. Persistência: down (volume mantido) → up → entrypoint migrate+seed idempotente → dados intactos (verify-persistence prova com MARKER)`.

---

## 9. Documentação Existente, Testes e Qualidade

- **`docs/DOCUMENTACAO_TECNICA.md`** (738 linhas, 18 seções): identificação/equipe (Lays, Fellype, Ivan, Victor), problemática, análise 4 eixos, proposta 3 serviços, arquitetura portas, componentes, init, modelo/DER, tecnologias, justificativas, processo 3 fases (Estabilização→Consistência→Confiabilidade, git branches+PR→develop), DevOps (IaC, health, readiness, backup/restore, secrets), execução, testes (backend 9/32, frontend 3/4, infra compose/prisma/sh/git, smoke 7 itens), resultados, limitações, futuro, conclusão.
- **CI**: backend bloqueante (migrate+seed+Jest), frontend (vitest+build), lint informativo (`continue-on-error` por dívida formatação); smoke Docker (frontend/readiness/produtos/seed/backup/persistência).
- **Comandos qualidade**: `cd backend && yarn test --runInBand | yarn lint`, `cd frontend && yarn vitest run | yarn build | yarn lint`, `docker compose config, npx prisma validate, sh -n scripts/*, git diff --check`.

---

## 10. Limitações Conhecidas e Roadmap

**Limitações (assumidas na doc técnica):** pagamento apenas simulado (bloqueado em production); débito sem reserva expirável; Compose só dev; credenciais demo; sem backup externo/retenção/PITR; sem staging/prod; telas `Orders/Users/Pix/Profile(admin)` são placeholders; sem observabilidade (logs/métricas/tracing); lint CI informativo; `Header.jsx` com import quebrado (morto); links footers `/about` etc. sem rota; `checkoutService.js` placeholder; frete/CEP carrinho inoperante; `ProductDetail.jsx` stub sem rota.

**Futuro proposto:** reserva/expiração estoque, histórico pedidos/pagamentos, ledger estoque, backup avançado (retenção/cripto/PITR), migrações mais seguras, paginação/índices/auditoria/soft-delete, SKU/categorias, avaliar NoSQL complementar (cache/busca/auditoria) mantendo PG transacional, observabilidade, hardening prod.

---

## 11. Mapa Rápido de Arquivos-Chave (para manutenção/build)

- Orquestração: `docker-compose.yml`, `backend/entrypoint.sh`, `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`.
- Contrato dados: `backend/prisma/schema.prisma`, `backend/prisma/migrations/*/migration.sql`.
- Regras: `backend/src/services/orderService.js`, `cartService.js`, `authService.js`, `sessionService.js`, `backend/src/repositories/*`, `backend/src/database/transaction.js`.
- HTTP: `backend/src/app.js`, `src/routes/*`, `src/controllers/*`, `src/middlewares/*`.
- UI crítica: `frontend/src/routes/*`, `context/*`, `services/*`, `pages/Checkout.jsx`, `components/checkout/PixPaymentModal.jsx`, `pages/Products.jsx`, `pages/Home.jsx`.
- Prova: `scripts/*.sh`, `.github/workflows/*.yml`, `backend/tests/*`, `frontend/src/**/*.test.*`.

---

## 12. Como Funciona a Persistência de Dados no Projeto (detalhado)

Esta seção explica o mecanismo completo que garante que **destruir e recriar os contêineres não apaga os dados**.

### 12.1. Princípio: separar computação (efêmera) de estado (durável)

- Containers `techstore_backend` e `techstore_frontend` são descartáveis: `docker compose down` remove containers/redes, mas **não** remove volumes nomeados.
- Todo estado durável vive em **um único lugar**: PostgreSQL 15 (`db`) com arquivos físicos em `/var/lib/postgresql/data`.
- Esse diretório é montado no volume Docker nomeado `pg_data` (`docker-compose.yml:21`):
  ```yaml
  db:
    volumes:
      - pg_data:/var/lib/postgresql/data
  volumes:
    pg_data:
      driver: local
  ```
- Resultado: `down` → volume `techstore-db-mvp_pg_data` continua no host. `up` → novo container Postgres monta o mesmo volume e enxerga as mesmas tabelas/linhas. Só `down -v` apaga (por isso o README alerta para nunca usar `-v` em validação).

### 12.2. Arranque determinístico (ordem garantida)

Sem ordem, o backend tentaria migrar antes do banco estar pronto e falharia. Ordem em `docker-compose.yml`:

1. `db` expõe `healthcheck: pg_isready -U $POSTGRES_USER -d $POSTGRES_DB` a cada 2s (`interval/timeout/retries/start_period`).
2. `backend.depends_on.db.condition: service_healthy` → Docker só cria o backend após 1 `pg_isready` OK.
3. `frontend.depends_on.backend.condition: service_healthy` → Nginx só sobe após `GET /health/ready` do backend retornar 200 (que por sua vez faz `prisma.$queryRaw SELECT 1`).
4. Backend tem `healthcheck` próprio (`node -e fetch('http://127.0.0.1:3000/health/ready')`) para liberar o frontend.

Cadeia real: `Postgres → pg_isready OK → entrypoint backend → Express listen → /health/ready OK → frontend Nginx`.

### 12.3. Bootstrap automático e idempotente (`backend/entrypoint.sh:1-38`)

Toda subida do backend executa, nesta ordem:

1. **Monta `DATABASE_URL`** de `DB_USER/PASSWORD/HOST/PORT/NAME` se ausente (defaults `techstore_user/techstore_password@db:5432/techstore_v2`).
2. **Resolve `JWT_SECRET`**: usa env, senão lê `./.jwt_secret` (600) ou gera `crypto.randomBytes(32).hex` e persiste. Evita invalidar todos os cookies a cada restart.
3. **`npx prisma generate && npx prisma migrate deploy`** — aplica apenas migrações pendentes (`20260924_init`, `20260925_transactional_orders`, `20260926_idempotency_fingerprint`). `migrate deploy` nunca recria o banco, só avança; por isso re-subir é seguro.
4. **Seed condicional**: se `SEED_ON_START!=false` (default `true`), roda `node scripts/seed.js`.
5. **`exec "$@"`** → `yarn dev` (Compose) / `yarn start` (prod).

### 12.4. Por que o seed não duplica (idempotência)

`backend/scripts/seed.js:102-133` (`executarSeeds`):

- Usuários: `prisma.usuario.findUnique({where:{email}})` → só `bcrypt.hash(10)+create` se **ausente**. Nunca `update`.
- Produtos: `prisma.produto.findFirst({where:{nome}})` → só `create` se **ausente**.
- Senhas via `SEED_ADMIN_PASSWORD/SEED_CLIENTE_PASSWORD` ou fallback `Admin@123/Cliente@123` (com `throw` em `production` sem env).
- Efeito: primeira subida cria `2 usuários + 8 produtos`; segunda subida (após `down/up`) encontra tudo existente e não insere nada. Teste `seed.test.js` prova que re-executar não sobrescreve.

### 12.5. Integridade dentro do banco (não só "não apagar")

Persistir não basta; o dado precisa continuar **consistente** após restarts e concorrência:

- `UNIQUE usuarios.email`, `UNIQUE carrinhos(usuario_id,produto_id)`, `UNIQUE pedidos(usuario_id,idempotency_key)`.
- `CHECK stock>=0, preco>=0, total>=0, quantidade>0`.
- FK `pedido_itens.produto_id → RESTRICT`: impede deletar produto com histórico (vira `409 ProdutoEmUsoError`).
- Snapshot `pedido_itens.nome_produto + preco_unitario`: pedido preserva nome/preço da hora da compra.
- Transações Prisma com `SELECT ... FOR UPDATE` (`src/database/transaction.js:bloquearUsuario`) + `updateMany({where:{stock:{gte:q}}, data:{decrement}})` serializam carrinho→estoque→pedido e impedem oversell. Rollback automático se qualquer item falhar.

### 12.6. Prova automatizada (`scripts/verify-persistence.sh:1-59`)

Fluxo do script (idêntico ao smoke do CI):

1. `docker compose up -d` + `wait_until_ready` (poll `GET :3002/health/ready` 60×2s).
2. `INSERT INTO produtos (nome=MARKER, ...) RETURNING id` → `sentinel_id` (MARKER = `stage3-persistence-TIMESTAMP-PID`).
3. `docker compose down` (**sem `-v**, preserva `pg_data`) → `docker compose up -d` + wait.
4. `SELECT id WHERE nome=MARKER` → `persisted_id`.
5. Se `persisted_id != sentinel_id` → exit 1 (`Persistência falhou`); senão `Persistência verificada após down/up`.
6. `trap cleanup`: sempre `up -d + DELETE WHERE nome=MARKER` para não poluir.

Teste manual equivalente (README):
```bash
docker compose down
docker compose up -d
docker compose exec db psql -U techstore_user -d techstore_v2 \
  -c "SELECT COUNT(*) FROM usuarios; SELECT COUNT(*) FROM produtos;"
sh scripts/verify-persistence.sh
```

### 12.7. Backup / restore (segunda camada de persistência)

- `backup.sh`: `docker compose exec -T db pg_dump --format=custom --no-owner --no-privileges > backups/techstore-TIMESTAMP.dump` (`umask 077`).
- `restore.sh`: exige `CONFIRM_RESTORE=YES`, valida `TARGET_DB ^[A-Za-z0-9_]+$`, `pg_restore --no-owner --exit-on-error` via stdin (+ `--clean` se `RESTORE_CLEAN=true`).
- `verify-backup.sh`: `backup → dropdb/createdb techstore_restore_test → restore TARGET_DB → compara COUNT(usuarios,produtos,carrinhos,pedidos,pedido_itens)` origem vs restore. Garante que o dump é restaurável.
- `.gitignore` ignora `backups/` para nunca commitar dumps.

### 12.8. O que persiste e o que NÃO persiste

| Persiste em `pg_data` (sobrevive a `down/up`) | Não persiste (recriado a cada `up --build`) |
|---|---|
| `usuarios, produtos, carrinhos, pedidos, pedido_itens, sessoes_revogadas` + índices/sequences | código `backend/` (bind-mount `./backend:/app`, mas `node_modules` é volume anônimo) |
| migrações aplicadas (`_prisma_migrations`) | `dist/` do frontend (rebuild multi-stage) |
| estoque decrementado, pedidos pagos, carrinhos | cookies/sessões em memória (só `jti` revogados persistem) |
| `JWT_SECRET` **não** está no volume do banco — fica em `./.jwt_secret` no bind-mount do backend (sobrevive a `down/up` no host, mas não a clone limpo; por isso prod deve injetar via env/Secrets) | logs de container |

### 12.9. Resumo em uma frase

Persistência = **volume `pg_data` fora do ciclo de vida dos containers** + **healthcheck que ordena a subida** + **`migrate deploy` incremental** + **seed que só insere ausentes** + **constraints/transações que mantêm integridade** + **scripts que provam `down/up` e `backup/restore` no CI**.

### 12.10. Explicação didática para apresentação (como falar em 3–5 minutos)

> Esta subseção é um roteiro de fala. Pode ler em voz alta ou colar nos slides de speaker notes.

**Abertura — o problema em 20 segundos:**
"Container Docker é efêmero por natureza: quando ele morre, tudo que estava dentro dele morre junto. Se eu guardasse os dados dos clientes dentro do próprio container do backend ou do banco sem cuidado, um simples `docker compose down` apagaria a loja inteira. O desafio do MVP era exatamente esse: provar que dá para derrubar toda a infraestrutura e subir de novo sem perder nenhum usuário, produto, carrinho ou pedido."

**Analogia central — a barraca e o cofre:**
"Pensem assim: os containers são como barracas de feira — monto de manhã, desmonto à noite. O banco de dados é o cofre que fica no galpão. A barraca pode cair com o vento, mas o cofre continua lá. No projeto, o cofre é o volume Docker chamado `pg_data`. Ele mora fora dos containers, no disco do host. O Postgres escreve em `/var/lib/postgresql/data`, e esse caminho está plugado no volume. Então `down` remove as barracas, mas o cofre fica. `up` monta barracas novas em cima do mesmo cofre. A única forma de perder tudo é usar `down -v`, que é o comando que manda demolir o cofre junto — por isso a gente proíbe ele na demo."

**Os 4 pilares (mostre 4 dedos / 4 bullets no slide):**

1. **Cofre separado — volume `pg_data`:** "Nada de dado dentro do container. Uma linha no `docker-compose.yml` resolve: `pg_data:/var/lib/postgresql/data`. É a diferença entre guardar dinheiro no bolso da barraca ou no cofre do galpão."
2. **Fila ordenada — healthcheck:** "Não adianta abrir a loja antes do cofre estar destrancado. O banco avisa `estou pronto` via `pg_isready` a cada 2 segundos. Só aí o backend nasce (`depends_on: service_healthy`), aplica migrações e só aí o frontend sobe. É uma fila: banco → backend → frontend. Sem isso, o backend tentaria conectar num banco que ainda está acordando e quebraria."
3. **Montagem inteligente — entrypoint + seed que não duplica:** "Toda vez que o backend nasce, ele roda um checklist: monta a URL do banco, resolve o segredo JWT, roda `prisma migrate deploy` — que só aplica o que falta, nunca recria — e roda o seed. E o seed é educado: ele pergunta antes, `esse e-mail já existe? esse produto já existe?`. Se sim, ele não insere de novo. Primeira subida cria 2 usuários e 8 produtos; segunda, terceira, décima subida não criam nada. É idempotente: pode rodar quantas vezes quiser que o resultado é o mesmo."
4. **Prova ao vivo — teste do marcador:** "E a gente não pede para acreditar na palavra. O script `verify-persistence.sh` insere um produto com nome único, tipo uma etiqueta com código `stage3-persistence-DATA-PID`, anota o ID, derruba tudo com `down`, sobe de novo com `up` e procura a etiqueta. Se o ID é o mesmo, a persistência passou. É o que roda no CI e o que vou demonstrar agora ao vivo."

**Demonstração ao vivo (roteiro de 1 minuto):**
"Olhem: vou inserir, derrubar e subir. Primeiro `docker compose up -d`, espero o `/health/ready` ficar verde. Insiro o marcador e anoto o ID. Agora `docker compose down` — reparem, sem `-v`. Subo de novo, espero o ready, consulto o marcador — está lá, mesmo ID. Depois o próprio script apaga o marcador para não sujar a base. Se alguém quiser, mostro também o `SELECT COUNT(*) FROM usuarios, produtos` antes e depois."

**Fechamento — por que isso importa além do MVP:**
"Persistência não é só não apagar: é continuar consistente. Por isso temos travas no banco — e-mail único, estoque nunca negativo, produto com venda não pode ser deletado, pedido guarda foto do nome e preço da hora da compra — e transações que fazem carrinho virar pedido de uma vez ou desfazem tudo se algo falhar. E temos segunda camada: `backup.sh` com `pg_dump` e `restore.sh` com `pg_restore`, verificados automaticamente. O recado final: containers podem morrer, o dado não."

**Frases prontas para perguntas difíceis:**

- *"E se usar `down -v`?"* → "Aí apaga o volume por design do Docker. É como mandar demolir o cofre. Por isso o script e a doc proíbem `-v`, e em produção o volume teria snapshot/backup externo com retenção e PITR — está no roadmap."
- *"Por que não SQLite ou volume no backend?"* → "Porque precisamos de transações concorrentes, constraints e múltiplos escritores com integridade. Postgres dá ACID, `FOR UPDATE`, `CHECK` e `RESTRICT`. SQLite no container seria arquivo efêmero de novo."
- *"Seed não corre risco de sobrescrever?"* → "Não, porque ele só faz `find` + `create se ausente`, nunca `update/upsert` cego. E o teste `seed.test.js` roda ele duas vezes e confere que nada mudou."
- *"E se dois checkouts concorrerem?"* → "A linha do usuário é travada com `SELECT ... FOR UPDATE` e o estoque só decrementa com `WHERE stock >= quantidade`. Quem chega sem estoque recebe erro e nada é persistido pela metade — a transação faz rollback."
- *"Frontend guarda dado?"* → "Não. Frontend é estático (Nginx) + estado em memória/localStorage só para UX (usuário logado, carrinho exibido). Fonte da verdade é sempre o Postgres via API."

**Sugestão de 3 slides:**

- Slide 1 — Título "Persistência: o cofre fora da barraca" + diagrama `frontend → backend → postgres → pg_data` + bullet `down ≠ perda, down -v = perda`.
- Slide 2 — "4 pilares" (volume, fila/healthcheck, entrypoint+seed idempotente, prova MARKER) cada um com 1 linha e 1 arquivo (`docker-compose.yml:21`, `entrypoint.sh`, `seed.js:102`, `verify-persistence.sh:39`).
- Slide 3 — "Demo ao vivo" com os 4 comandos colados e o `SELECT COUNT(*)` antes/depois + QR/link para `scripts/verify-persistence.sh` e `docs/DOCUMENTACAO_TECNICA.md`.

---

<p align="center">TechStore · MVP de Persistência e Gestão de Dados — build.md gerado por inspeção de código</p>


