# Tag "Brasil na Copa" para eventos

Feature temporária e simples: criadores marcam o evento como "transmite jogo do Brasil na Copa", ganhando destaque visual no app e um filtro dedicado no Discover.

## 1. Banco de dados (migration)

Adicionar coluna na tabela `events`:

- `broadcasts_brazil_game BOOLEAN NOT NULL DEFAULT false`

Sem mudanças em RLS — segue as policies existentes de `events`.

## 2. Criar/Editar evento

Em `src/pages/CreateEvent.tsx` e `src/pages/EditEvent.tsx`:

- Novo toggle (Switch shadcn) com label **"Transmite jogo do Brasil na Copa"** e um subtítulo curto tipo "Aparece com destaque e filtro especial durante a Copa".
- Posicionado numa seção própria perto do final do form, antes do botão de salvar.
- Salva no campo `broadcasts_brazil_game`.

## 3. Destaque visual (badge)

Novo componente `src/components/BrazilCupBadge.tsx`:

- Texto: **"BRASIL AO VIVO"** com emoji 🇧🇷
- Estilo seguindo o design system do projeto (`rounded-none`, borda preta, uppercase 11px), mas com fundo amarelo Brasil (`#FFDF00`) e texto preto para destacar dos demais badges brancos.
- Variante pequena para cards e variante destaque para a página do evento.

Onde aparecer:

- **`EventsCarousel.tsx`**: badge no topo, junto com data/hora/preço.
- **`Discover.tsx`**: badge sobreposto no card do evento.
- **`Calendar.tsx`**: badge no card do evento.
- **`MyEvents.tsx`**: badge no card.
- **`EventDetailPage.tsx`** (`EventHeader`): badge em destaque junto ao título.

## 4. Filtro no Discover

Em `src/pages/Discover.tsx`:

- Novo chip/botão de filtro **"🇧🇷 Brasil na Copa"** na barra de filtros existente, no estilo dos outros filtros do Discover.
- Quando ativo, mostra apenas eventos com `broadcasts_brazil_game = true`.
- Toggle on/off (clicar de novo desativa).

## 5. Queries

Adicionar `broadcasts_brazil_game` no `.select()` de todos os componentes que listam eventos e nas interfaces `Event`:

- `EventsCarousel.tsx`
- `Discover.tsx`
- `Calendar.tsx`
- `MyEvents.tsx`
- `EventDetailPage.tsx`

## Detalhes técnicos

- Migration única adicionando a coluna com default `false` (não quebra eventos existentes).
- Tipos do Supabase serão regenerados automaticamente após a migration.
- Sem mudanças em RLS, auth ou edge functions.
- Por ser feature temporária: a coluna fica no schema mesmo depois da Copa; basta os criadores não marcarem mais. Se quiser remover depois, é só dropar a coluna e o componente do badge.
