# URLs amigáveis de eventos

Trocar `/event/<uuid>` por `/evento/<slug>` (ex: `/evento/baile-dos-amores`), mantendo links antigos funcionando via redirect.

## 1. Banco de dados (migração)

- Adicionar coluna `slug TEXT UNIQUE` em `public.events`.
- Função `public.generate_event_slug(title text)`:
  - Normaliza (minúsculas, remove acentos via `unaccent`, troca não-alfanumérico por `-`, colapsa hífens, trim).
- Função `public.set_event_slug()` (trigger BEFORE INSERT/UPDATE):
  - Se `slug` nulo ou título mudou, gera base a partir do título.
  - Garante unicidade adicionando sufixo `-2`, `-3`, … se já existir.
- Trigger em `events` chamando `set_event_slug()`.
- Backfill: `UPDATE events SET slug = NULL` + rodar uma rotina que percorre linhas existentes e popula via trigger (ou um `DO $$ … $$` que atribui slug único por linha).
- `ALTER COLUMN slug SET NOT NULL` ao final.
- Extensão `unaccent` (criar se não existir).

## 2. Rotas (`src/App.tsx`)

- Adicionar `/evento/:slug` → `Index` (página de detalhe).
- Manter `/event/:id` apontando para um novo componente leve `EventRedirect` que:
  - Busca o evento pelo id, lê o `slug`, faz `<Navigate to={"/evento/"+slug} replace />`.
  - Se não existir, mostra NotFound.

## 3. Página de detalhe (`EventDetailPage.tsx`)

- Ler `slug` de `useParams` (preferir `slug`, cair para `id` por compatibilidade).
- `fetchEvent`: se `slug` presente, buscar `.eq('slug', slug)`; senão `.eq('id', id)`.
- Selecionar também `slug` no `select('*')` (já coberto).

## 4. Links internos

Atualizar todos os `navigate('/event/'+id)` / `to={'/event/'+id}` para usar slug:

- `src/components/EventsCarousel.tsx`
- `src/pages/Discover.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/MyEvents.tsx`
- `src/pages/Admin.tsx`
- Qualquer outro uso encontrado por busca de `/event/`.

Selects dessas páginas passam a incluir `slug`.

## 5. Edição / criação

- `CreateEvent` e `EditEvent`: nada a digitar manualmente — slug é gerado pelo trigger. Após salvar, redirecionar usando o `slug` retornado (`.select('slug').single()`).

## 6. SEO

- `SEOHead` já usa `window.location.href` como canonical, então o canonical passa a ser a URL com slug automaticamente.
- Sitemap (`public/sitemap.xml`): nenhuma mudança automática agora (estático). Pode ser tratado depois se desejado.

## 7. Validação

- Criar evento novo → URL `/evento/<slug>` funciona.
- Editar título → slug não muda por padrão (mantém estabilidade de URL); apenas gerado se vazio. Confirmar essa escolha durante implementação (default: **não regenerar** ao editar para não quebrar links).
- Abrir link antigo `/event/<uuid>` → redireciona para `/evento/<slug>`.
- Dois eventos com mesmo título → segundo recebe `-2`.

## Detalhes técnicos

```text
events
  + slug text unique not null
  + trigger set_event_slug BEFORE INSERT OR UPDATE OF title, slug
```

Rotas finais:
```
/evento/:slug         → Index (detalhe)
/event/:id            → EventRedirect (301-like via <Navigate replace />)
/event/:id/edit       → EditEvent (mantido)
```
