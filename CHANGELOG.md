# Changelog

Todas as mudanças relevantes deste projeto são registradas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/), e o
versionamento segue [SemVer](https://semver.org/lang/pt-BR/).

## [Não publicado]

## [1.0.0] - 2026-09-29

Entrega final do MVP de persistência e gestão de dados do TechStore, e-commerce
de demonstração com dados fictícios. A aplicação roda em contêineres e mantém os
dados em um volume dedicado, que sobrevive à recriação da stack.

### Adicionado

- Stack completa em Docker Compose, com PostgreSQL 15, Node.js e Express no
  backend, e React com Vite no frontend servido por Nginx.
- Volume nomeado `pg_data`, que preserva os dados fora do ciclo de vida dos
  contêineres.
- Rede dedicada `techstore_net`, com a porta do banco restrita ao localhost.
- `entrypoint.sh` com bootstrap automatizado: aplica migrações, popula o banco e
  só libera o tráfego após o healthcheck do PostgreSQL.
- Healthcheck e readiness da API, com sonda `pg_isready` para evitar corrida na
  subida dos serviços.
- Seed idempotente com 8 produtos e 2 usuários de demonstração, sem duplicar
  registros na reexecução.
- Checkout transacional com controle de concorrência, controle de estoque e
  idempotência por chave única, evitando oversell e pedido duplicado.
- Preservação de preço e nome do produto no momento da compra, como snapshot em
  `pedido_itens`.
- Autenticação com JWT em cookie `HttpOnly`, bcrypt para senhas, Helmet, CORS,
  rate limit e revogação de sessão persistida em `sessoes_revogadas`.
- Recuperação e redefinição de senha com token aleatório armazenado apenas como
  hash, com expiração de 1 hora. Sem serviço de e-mail no MVP, o link de
  redefinição é registrado no log do backend.
- Layout responsivo com menu móvel na navegação e adaptação dos fluxos principais
  a telas pequenas.
- Scripts operacionais de `scripts/`: `backup.sh`, `restore.sh`,
  `verify-backup.sh` e `verify-persistence.sh`.
- Suíte de 10 testes automatizados do backend, cobrindo autenticação, carrinho,
  pedidos, concorrência, seed, sessões, rate limit, recuperação de senha e
  integridade transacional.
- Smoke test da stack em Docker, que sobe a aplicação e valida interface e API.
- Integração contínua com GitHub Actions em três workflows: `ci.yml` para testes
  e build, `test-docker-stack.yml` para o smoke test e `protecao-main.yml`, que
  reprova Pull Requests enviados para a `main` a partir de qualquer branch
  diferente da `develop`.
- 5 constraints `CHECK` e 4 índices no PostgreSQL, com migrações versionadas.
- Documentação técnica em `docs/DOCUMENTACAO_TECNICA.md`, com análise do
  problema, arquitetura, modelo de dados e roadmap.
- Evidências visuais da persistência e do layout responsivo em `screenshots/`.
- Slides da apresentação em `docs/slides-apresentacao.pdf`.
- Arquivo `.github/CODEOWNERS` registrando o responsável principal pela revisão
  do repositório.

### Corrigido

- Inicialização dos contêineres travando por ordem de subida dos serviços.
- Sessões e carregamento do catálogo em ambiente novo.
- Scripts shell quebrados por fim de linha CRLF dentro dos contêineres.
- `.gitignore` sobrescrito durante a migração para o Docker, restaurado para a
  versão da branch principal.

### Removido

- `frontend/package-lock.json`, incompatível com o uso de yarn, que conflita com
  o `frontend/yarn.lock` do projeto.
- `build.md` e a página de support, que ficaram sem função no MVP e foram
  removidos antes da entrega.
- READMEs das subpastas de backend e frontend, consolidados na documentação raiz.

[Não publicado]: https://github.com/laas26/techstore-db-mvp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/laas26/techstore-db-mvp/releases/tag/v1.0.0
