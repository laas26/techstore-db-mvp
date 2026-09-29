> Este template resume o que este projeto considera importante. As regras
> completas e o motivo de cada uma estão em `CONTRIBUTING.md`.

## Descrição

O que muda e por quê.

## Tipo

- [ ] Funcionalidade nova
- [ ] Correção de defeito
- [ ] Documentação
- [ ] Testes
- [ ] Infraestrutura, Docker e CI
- [ ] Segurança e autenticação
- [ ] Banco de dados e migrations

## Escopo

Marque o que o PR toca, para lembrar o que precisa ser verificado além dos testes.

- [ ] Backend (`backend/src`)
- [ ] Frontend (`frontend/src`)
- [ ] Banco de dados (`backend/prisma`)
- [ ] Docker (`docker-compose.yml`, `Dockerfile`, `nginx.conf`, `entrypoint.sh`)
- [ ] Esteira (`.github/workflows`)
- [ ] Documentação (`README.md`, `docs/`, `DESIGN.md`, `CONTRIBUTING.md`)
- [ ] Interface visual (tokens e componentes, veja `DESIGN.md`)

## Verificação

- [ ] `yarn test` e `yarn lint` passam no backend
- [ ] `yarn test`, `yarn build` e `yarn lint` passam no frontend
- [ ] `docker compose up -d` sobe a stack sem erro
- [ ] A interface foi conferida em 640px e 400px de largura

## Pontos que exigem atenção

- [ ] Nenhuma migration já commitada foi alterada
- [ ] Nenhum segredo ou valor de credencial entrou no commit
- [ ] Nenhum arquivo local foi adicionado
- [ ] Se mexeu em autenticação, rate limit ou porta exposta, avaliei o impacto
- [ ] Se mexeu em `docker-compose.yml`, `Dockerfile`, `nginx.conf` ou
      `entrypoint.sh`, subi a stack do zero e conferi a aplicação

## Migration

- [ ] Não há alteração de schema

Se houver, descreva o que mudou no modelo e por quê. Migration é aplicada na
próxima subida, não sob demanda, e o `migrate deploy` não tem rollback.

## Registro

- [ ] A documentação foi atualizada, se o comportamento mudou
- [ ] O `CHANGELOG.md` foi atualizado, se a mudança é perceptível
- [ ] A estratégia de merge é a mesma do PR anterior, veja `CONTRIBUTING.md`
