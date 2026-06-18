# Perfil público de criadores

Página pública compartilhável onde cada criador/curador/produtor mostra seus eventos para seguidores.

## URL
`/@:username` (ex: `botaritmo.com/@yeon`)

## Banco de dados (migration)
Adicionar à tabela `profiles`:
- `username` (text, unique, lowercase, regex `^[a-z0-9_]{3,30}$`)
- `avatar_url` (text)
- `bio` (text, máx 280 chars)
- `tags` (text[]) — tags livres tipo "techno", "house", "curadoria"

RLS:
- `SELECT` público em `profiles` (anon + authenticated) para permitir página pública
- `UPDATE` continua restrito ao dono (`auth.uid() = user_id`)

Storage:
- Reutilizar bucket `event-images` (já público) com pasta `avatars/{user_id}/...` — evita criar bucket novo

## Páginas / Componentes

**1. `/perfil` (edição — autenticado)**
Formulário para editar avatar, nome, username, bio, tags. Validação de username único.
- Upload de avatar via input file → storage
- Tags via input com chips (separadas por enter/vírgula)

**2. `/@:username` (público)**
Layout:
```text
┌─────────────────────────────────┐
│  [Avatar]  Nome                 │
│            @username            │
│            Bio                  │
│            [tag] [tag] [tag]    │
│            [Compartilhar]       │
├─────────────────────────────────┤
│  CALENDÁRIO (mês atual,         │
│  marcando dias com eventos)     │
├─────────────────────────────────┤
│  PRÓXIMOS EVENTOS               │
│  [card] [card] [card]           │
├─────────────────────────────────┤
│  EVENTOS PASSADOS               │
│  [card] [card]                  │
└─────────────────────────────────┘
```
- Reutiliza os mesmos cards de evento usados em Discover
- Calendário no estilo da home (componente `Calendar` shadcn já em uso)
- Divisão entre próximos/passados baseada em `target_date` vs `now()`
- Botão "Compartilhar" copia o link `/@username`

**3. Navegação**
- No header (quando logado): link "Meu Perfil" → `/perfil`
- Em cada card/página de evento: nome do criador vira link clicável → `/@username` do dono (`events.created_by` → `profiles`)

## Estilo
Segue identidade Bota Ritmo: cantos retos (`rounded-none`), bordas pretas, fundo branco, botões uppercase 11px. Avatar quadrado (sem `rounded-full`) para manter a linguagem visual.

## Fora de escopo (intencionalmente)
- Sistema de "seguir" (compartilhamento é via link)
- Mensagens, comentários
- Estatísticas/analytics no perfil

## Pontos a confirmar
1. URL no formato `/@username` está OK, ou prefere `/perfil/:username`?
2. Avatar quadrado (alinhado à identidade) ou redondo?
