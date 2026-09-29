# Contribuindo com o TechStore

Para executar o projeto, veja o `README.md`. O modelo de dados e as
justificativas técnicas estão em `docs/DOCUMENTACAO_TECNICA.md`, e os tokens
visuais em `DESIGN.md`. Este guia cobre o processo de contribuição.

---

## Fluxo de trabalho

```text
branch de trabalho  →  develop  →  main
```

A `develop` recebe todo trabalho. A `main` é a branch de entrega e só aceita
merge vindo da `develop`, por Pull Request.

Um ruleset no GitHub reprova qualquer PR para a `main` que não tenha `develop`
como origem. O check é feito por `.github/workflows/protecao-main.yml`, e o merge
fica bloqueado enquanto ele falhar. Não existe bypass para administrador.

O recurso de restrição de acesso do GitHub não está disponível aqui, porque
restringir quem faz push só funciona em repositório de organização, e este está
em conta pessoal.

### Criando a branch

```bash
git switch develop
git pull
git switch -c tipo/descricao-curta
```

| Prefixo    | Uso                                          |
| ---------- | -------------------------------------------- |
| `feat/`    | nova funcionalidade                         |
| `fix/`     | correção de defeito                          |
| `docs/`    | documentação                                 |
| `chore/`   | manutenção sem mudança de comportamento     |
| `test/`    | testes                                       |
| `ci/`      | ajuste na esteira                            |

O PR tem destino `develop`.

### Estratégia de merge

Use a mesma opção de merge nos dois PRs, o que vai para a `develop` e o que vai
para a `main`.

```text
Squash and merge         junta os commits da branch em um só, com a mensagem
                         do PR, e mantém o log legível
Create a merge commit    preserva os commits individuais da branch, mas enche o
                         log de nós de merge sem descrição
```

Misturar as duas deixa a `main` com histórico diferente do da `develop`, e o que
está na `main` deixa de refletir o que foi feito na `develop`.

`Squash and merge` é o padrão do projeto, e também o padrão do GitHub ao abrir um
pull request. `Create a merge commit` também serve, desde que seja usado nos dois
lados.

---

## Convenção de commits

O projeto segue [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```text
tipo: descrição curta no imperativo
```

Exemplos que existem no histórico:

```text
feat: implementa checkout transacional e idempotente
fix: mantem os scripts shell em lf para rodar no docker
docs: detalha integridade, indices e limitacoes do modelo de dados
```

```text
✓  escreva no imperativo: "adiciona", não "adicionado"
✓  mantenha a linha em até 72 caracteres
✓  um assunto por commit
```

```text
✗  não misture backend e frontend no mesmo commit
✗  não use "wip" no histórico definitivo
```

Commitar bastante é melhor que commitar demais: um commit é uma mudança que
sozinha faz sentido.

O PR é merged com squash, então a mensagem do PR é o que aparece no histórico.
Escreva um título de PR que descreva a mudança inteira, no mesmo formato acima.
Commitar com cuidado durante o trabalho serve para você revisar e para desfazer
com facilidade, não para encher o log.

---

## Verificações

A CI roda quatro checks, e todos precisam passar.

| Check                            | O que faz                              |
| -------------------------------- | -------------------------------------- |
| `backend`                        | testes e lint do backend                |
| `frontend`                       | testes e build de produção              |
| `Sobe a stack e valida frontend, API e seed` | smoke test da stack em Docker |
| `Origem do PR permitida`          | só na `main`, e só vindo da `develop`  |

O lint é informativo e não bloqueia o pipeline, porque o projeto ainda tem dívida
de formatação. Vale corrigir o que aparecer.

### Rodando localmente

```bash
cd backend
yarn install --frozen-lockfile
yarn test
yarn lint
```

```bash
cd frontend
yarn install --frozen-lockfile
yarn test
yarn build
yarn lint
```

---

## Banco de dados e migrations

`backend/prisma/schema.prisma` é a fonte de verdade do modelo. As migrations em
`backend/prisma/migrations/` são o histórico do que já foi aplicado, e são geradas
a partir do schema.

Vale saber por que isso exige cuidado: `prisma migrate deploy` roda a cada
subida, no `entrypoint.sh` e na CI, e o banco registra quais migrations já
foram aplicadas. Uma migration não é aplicada sob demanda, ela se aplica sozinha
na próxima subida, e o `migrate deploy` não tem rollback. Se uma migration com
SQL inválido for registrada como aplicada, corrigir passa a exigir intervenção
manual no banco.

### Gere com comando

```bash
cd backend
npx prisma migrate dev --name nome_da_migration
```

```text
✗  não crie arquivo em migrations/ manualmente
✗  não edite migration já commitada
```

Se o schema está errado, gere uma nova migration. Para recriar o banco do zero em
desenvolvimento, `prisma migrate reset`, e apenas localmente.

---

## Interface

Antes de criar componente visual, leia o `DESIGN.md`. Os tokens de cor,
espaçamento, tipografia e raio já estão em `frontend/src/styles/theme.css`.

```text
✓  reutilize Button e Input de frontend/src/components/common/
✓  use var(--color-primary), e não o valor literal
✓  mantenha o estado de foco visível em todo elemento interativo
```

Qualquer token novo entra no `DESIGN.md` junto com a origem no `theme.css`. Se o
valor não está no CSS, ele não existe.

---

## Arquivos locais

O `.gitignore` já cobre o que não deve ser versionado, e nenhum deles exige
`git add -f`:

```text
.env, .env.*          configuração com credencial
.jwt_secret           segredo de sessão, gerado na primeira subida
node_modules/         dependências instaladas
logs, *.log           saída de execução
backend/data/         dados locais
```

O `.jwt_secret` é criado na primeira subida, com permissão `600`, e nunca é
commitado. Para usar um valor fixo em desenvolvimento, defina `JWT_SECRET` no
`.env`.

---

## Reportando problemas

Abra uma issue com o que acontece, o que deveria acontecer, como reproduzir e o
ambiente: navegador, sistema operacional e versão do Docker.

Para defeito de segurança, não abra issue pública. Fale direto com o responsável
pelo repositório.
