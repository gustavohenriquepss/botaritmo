## Problema
Em `src/components/EventDescription.tsx`, a descrição é renderizada em um `<p>` sem preservar quebras de linha (`\n` viram espaço). Descrições longas também ocupam muito espaço na sidebar.

## Mudanças (apenas `src/components/EventDescription.tsx`)

1. **Respeitar quebras de linha**
   - Adicionar `whitespace-pre-line` no parágrafo, para preservar `\n` digitados pelo organizador sem permitir HTML.

2. **Botão "Mostrar mais / Mostrar menos"**
   - Limite: se a descrição passar de ~280 caracteres (ou tiver mais de 6 linhas), renderizar colapsada.
   - Estado local `expanded` (useState).
   - Quando colapsada: usar `line-clamp-6` com `whitespace-pre-line` e fade opcional; mostrar botão "MOSTRAR MAIS".
   - Quando expandida: mostrar texto completo + botão "MOSTRAR MENOS".
   - Botão segue o design system da marca: texto 11px, uppercase, `font-display`, underline on hover, cor `#1A1A1A`, sem bordas/arredondamento (alinhado ao restante da página de evento).
   - Se a descrição for curta, não renderiza o botão — comportamento atual preservado.

3. **Sem alterações** em backend, rotas, outros componentes, ou no campo `description` salvo no banco.

## Validação
- Abrir um evento com descrição multi-parágrafo: confirmar que as quebras aparecem.
- Abrir um evento com descrição longa: confirmar truncamento + botão expandindo/recolhendo.
- Abrir um evento com descrição curta: confirmar que o botão não aparece.
