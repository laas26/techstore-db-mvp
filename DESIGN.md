---
name: TechStore
description: Design system da interface do e-commerce de demonstração
version: 1.0.0
status: estável
scope: frontend
tokens: frontend/src/styles/theme.css
---

# DESIGN — TechStore

Guia de estilo da interface do TechStore. Todos os tokens citados aqui estão
declarados em `frontend/src/styles/theme.css` e devem ser usados por referência,
nunca por valor literal.

---

## 1. Overview

Interface de e-commerce de produtos eletrônicos, limpa e funcional. A prioridade
é que a hierarquia de compra funcione: ver produto, adicionar ao carrinho, fechar
pedido. O visual existe para não competir com essa hierarquia.

Tom e estilo:

- **limpo**, sem ornamentação;
- **funcional**, cada elemento justifica sua presença;
- **consistente**, tokens em vez de valores avulsos;
- **acessível**, contraste suficiente e estado de foco sempre visível.

A interface é responsiva por padrão. O menu de navegação vira botão em telas
menores, e os fluxos principais se adaptam sem exigir trabalho extra do
desenvolvedor.

---

## 2. Colors

Tema claro é o padrão. O tema escuro existe como override
`[data-theme="dark"]` e está preparado, mas ainda não é ativado na interface.

### Tema claro (padrão)

| Token                  | Hex       | Uso                                    |
| ---------------------- | --------- | -------------------------------------- |
| `--color-primary`      | `#2563eb` | ação principal, link, foco             |
| `--color-secondary`    | `#7c3aed` | apoio visual, destaque secundário       |
| `--color-background`   | `#f8fafc` | fundo da página                        |
| `--color-surface`      | `#ffffff` | cards, inputs, área de conteúdo        |
| `--color-border`       | `#e2e8f0` | borda de card e input                   |
| `--color-text`         | `#0f172a` | texto principal                        |
| `--color-text-muted`   | `#64748b` | rótulo, texto de apoio, placeholder    |
| `--color-success`      | `#22c55e` | confirmação, estoque disponível        |
| `--color-error`        | `#ef4444` | erro de validação, ação destrutiva     |

### Tema escuro (override)

| Token                  | Hex       |
| ---------------------- | --------- |
| `--color-background`   | `#0f172a` |
| `--color-surface`      | `#1e293b` |
| `--color-border`       | `#334155` |
| `--color-text`         | `#f1f5f9` |
| `--color-text-muted`   | `#94a3b8` |

`--color-primary`, `--color-secondary`, `--color-success` e `--color-error` são
compartilhados entre os dois temas.

### Estados de badge

Badges do painel administrativo usam pares próprios, com texto e fundo:

```text
dash-badge-blue    #1d4ed8 sobre #dbeafe
dash-badge-green   #15803d sobre #dcfce7
dash-badge-grey    texto e fundo neutros
```

---

## 3. Typography

```text
--font-family: "Inter", system-ui, sans-serif
```

A Inter é a fonte de referência. `system-ui` e `sans-serif` são fallback, para
que a interface continue legível se a fonte não carregar.

### Tamanhos

| Token                    | Tamanho | Uso                          |
| ------------------------ | ------- | ---------------------------- |
| `--font-size-h1`         | 32px    | título de página             |
| `--font-size-h2`         | 24px    | título de seção              |
| `--font-size-body`       | 16px    | texto corrente e botões      |
| `--font-size-caption`    | 14px    | rótulo de input, descrição   |

Pesos em uso:

```text
600  label de input, badge, botão
700  título de card, botão, destaque
800  título de página
```

Altura de linha: o corpo usa `1.5`, e os títulos entre `1.1` e `1.2`. Texto de
apoio pode descer para `1.4`, nunca abaixo disso.

Rótulos de input usam `--font-size-caption` com `font-weight: 600` e
`--color-text-muted`, sempre ligados ao campo por `htmlFor`.

---

## 4. Layout & Spacing

### Escala de espaçamento

Base 8px, com quatro degraus declaradas:

```text
--space-1:  8px
--space-2: 16px
--space-3: 24px
--space-4: 32px
```

Uso: `--space-1` para padding interno de botão e badge, `--space-2` para gap
entre campos e marginamento padrão de input, `--space-3` para gap de card e
marginamento de título, `--space-4` para separadores de seção.

### Container

```text
--container-max: 1200px
```

Com `margin: 0 auto`. Nenhuma página deve ultrapassar essa largura, e nenhuma
deve ter largura fixa menor que `container-max` em desktop.

### Grid

Grade do painel administrativo, com `minmax(0, 1fr)` para permitir que a coluna
encolha sem estourar:

```text
grid-template-columns: repeat(4, minmax(0, 1fr));
gap: 16px;
```

### Breakpoints

```text
--breakpoint-mobile:   640px
--breakpoint-desktop: 1024px
```

As media queries em uso no projeto são `max-width: 640px`, `900px` e `400px`.
Três pontos de quebra cobrem mobile, tablet e telas muito estreitas, e evitam
media query entre 640px e 900px, que é onde a interface costuma ficar apertada
sem quebrar.

---

## 5. Elevation & Depth

A profundidade é baixa. A interface é plana por padrão, e sombra é reservada
para o que realmente sobrepõe ou precisa de destaque.

| Situação                     | Sombra                                        |
| ---------------------------- | --------------------------------------------- |
| card em repouso              | `0 1px 3px rgba(15, 23, 42, 0.06)`            |
| elemento com foco            | `0 0 0 2px rgba(37, 99, 235, 0.3)`            |
| modal ou overlay             | `0 20px 50px rgb(15 23 42 / 20%)`             |

Card em repouso é a única sombra usada com frequência. Se um elemento está
recebendo sombra para parecer elevado sem função, questione o agrupamento antes
de manter.

---

## 6. Shapes

```text
--radius: 8px
```

O raio base é 8px e vale para botão, input e card. Variações em uso:

| Elemento        | Raio       | Motivo                                  |
| --------------- | ---------- | ---------------------------------------- |
| botão           | `8px`      | `--radius`                              |
| input           | `8px`      | `--radius`                              |
| card            | `8px`      | `--radius`                              |
| badge           | `999px`    | pílula, para leitura como etiqueta      |
| item de menu    | `6px`      | interno a um container maior            |
| card de destaque| `12px`     | quando precisa de separação do padrão   |

Nada acima de `12px` em card. Arredondamento excessivo sugere que o elemento
está sendo tratado como cápsula, e isso só vale para badge.

---

## 7. Components

### Botão

Componente único, em `frontend/src/components/common/Button.jsx`, com duas
variantes:

```text
btn-primary    fundo --color-primary, texto branco, sem borda
btn-secondary  fundo transparente, texto --color-primary, borda de 1px na cor
```

Ambas usam `--radius`, `padding: var(--space-1) var(--space-2)` e
`font-size: var(--font-size-body)`.

Estados:

```text
:hover      opacity 0.9
:disabled   opacity 0.5, cursor not-allowed
```

A transição é de `opacity` em `0.2s`. Não animar cor nem tamanho, para evitar
deslocamento de layout.

Todo botão precisa de `type` explícito. O padrão é `type="button"`, e
`type="submit"` só em formulário de verdade.

### Input

Componente único, em `frontend/src/components/common/Input.jsx`, com label
obrigatória quando há texto a explicar, `id` gerado por `useId` quando não
passado, e `marginBottom: var(--space-2)`.

O placeholder nunca substitui o label. Placeholder é apoio visual e some assim
que o usuário digita, o que o torna inútil como instrução.

### Badge

Usado no painel administrativo, com três variantes: azul para information, verde
para confirmação, cinza para neutro. Padding `4px 8px`, `font-size: 12px`,
`font-weight: 600`, raio `999px`.

### Modal

Overlay com a sombra de `0 20px 50px`. Não há componente reutilizável para modal no
projeto ainda, e a ausência é intencional enquanto houver só um caso de uso.

---

## 8. Do's and Don'ts

### Faça

```text
✓  use var(--color-primary) em vez de #2563eb
✓  use var(--space-2) em vez de 16px
✓  mantenha a escala de 8px
✓  vincule label e input com htmlFor e id
✓  garanta estado de foco visível em todo elemento interativo
✓  reutilize Button e Input em vez de criar elemento novo
✓  mantenha o contraste de texto em pelo menos 4.5:1
✓  teste a interface em 640px e 400px de largura
```

### Não faça

```text
✗  não escreva valor de cor ou espaço literal em componente novo
✗  não crie um segundo botão quando btn-secondary resolve
✗  não use placeholder como rótulo de campo
✗  não use âncoras em texto corrido; a navegação é por botão
✗  não invente um raio ou sombra fora da escala deste documento
✗  não remova o estado de foco, mesmo que pareça duplicado
✗  não fixe largura de container em vez de usar --container-max
✗  não adicione dependência de UI para resolver algo que token resolve
```

### Regra de adição

Qualquer token novo deve entrar neste documento junto com a origem em
`theme.css`. Se o valor não está lá, ele não existe. Isso vale para toda
alteração neste repositório, inclusive as feitas por quem apenas está
contribuindo. A regra mantém o guia e o código como uma coisa só, e evita que
alguém copie um valor deste arquivo para um componente e o valor se desincronize
depois.
