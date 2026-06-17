## Objetivo
Adicionar duas novas informações aos eventos: **venue** (local/organizador) e **preço do ingresso** (gratuito ou valor em R$).

## Mudanças

### 1. Banco de dados (migração)
Adicionar duas colunas à tabela `events`:
- `venue` (text, nullable) — nome livre da venue, ex: "Jungle Discos"
- `price_cents` (integer, nullable) — valor em centavos; `NULL` = gratuito, `0+` = valor pago

### 2. Criação/edição de evento (`CreateEvent.tsx` e `EditEvent.tsx`)
- Novo campo de texto: **Venue** (ex: "Jungle Discos") — opcional
- Novo bloco **Ingresso**:
  - Toggle "Gratuito"
  - Quando desmarcado, input numérico de valor em R$ (ex: 40,00)
- Validação Zod: se não gratuito, valor > 0

### 3. Página de detalhe do evento (`EventDetailPage.tsx` + `EventHeader.tsx`)
- Exibir venue logo abaixo do título (ex: "por Jungle Discos") seguindo a tipografia uppercase 11px do projeto
- Exibir preço numa nova seção/badge: "GRATUITO" ou "R$ 40,00"

### 4. Cards de descoberta (`Discover.tsx` e `EventsCarousel.tsx`)
- Adicionar **apenas o preço** nos cards (badge "GRATUITO" ou "R$ 40")
- Seguir o mesmo estilo dos badges existentes de data/hora (border preta, 11px uppercase, cantos retos)
- **Não** adicionar venue nos cards (conforme escolhido)

### 5. SEO (Event JSON-LD)
- Incluir `offers.price` e `offers.priceCurrency: "BRL"` no JSON-LD do evento (ou `"0"` quando gratuito), e `location.name` usando a venue quando presente

## Notas técnicas
- Como `venue` e `price_cents` são opcionais, eventos existentes continuam funcionando sem migração de dados
- Formatação de preço via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`
- Mantém o design system: bordas pretas, `rounded-none`, uppercase 11px nos badges