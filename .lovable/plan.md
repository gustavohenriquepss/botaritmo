## Diagnóstico

Dois problemas separados aparecem ao criar evento:

### 1. "Falha ao criar evento" — permissão de função no banco
O upload da imagem para o bucket `event-images` está retornando:

> `permission denied for function has_role`

As policies de storage (`Users can upload/update/delete event images`) chamam `public.has_role(auth.uid(), 'admin')`. Verifiquei as permissões da função e ela **não tem EXECUTE concedido para `authenticated`/`anon`** — apenas `sandbox_exec`. Provavelmente uma migração recente de segurança revogou o `EXECUTE` padrão de `PUBLIC` sem reconceder aos roles do Supabase. Resultado: qualquer policy (de tabela ou storage) que use `has_role` falha para o usuário logado.

### 2. Endereço não funciona — Google Maps `RefererNotAllowedMapError`
O console mostra:

> Google Maps JavaScript API error: RefererNotAllowedMapError
> Your site URL to be authorized: `https://0ef04c1e-ddd2-4774-97a7-79eb22622b9b.lovableproject.com/create-event`

Isso é uma restrição da **chave da API do Google Maps** no Google Cloud Console — não é algo que dá para corrigir por código. A chave precisa ter o domínio do preview da Lovable autorizado nas restrições de HTTP referrer.

## Correções

### Migração (corrige a criação de evento)
Reconceder `EXECUTE` em `public.has_role` para os roles do Supabase, garantindo que policies que dependem dela funcionem:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO authenticated, anon, service_role;
```

Isso restaura o upload de imagem ao criar/editar evento e qualquer outra checagem de admin que use a função.

### Ação que você precisa fazer (Google Maps)
Na chave `AIzaSyA4Mxe-L7q0HXFtkIVBY19NBrsvsBDg46A` do Google Cloud Console → APIs & Services → Credentials → restrições de HTTP referrer, adicionar:

- `https://*.lovableproject.com/*`
- `https://*.lovable.app/*`
- `https://botaritmo.com/*`

Sem isso o autocomplete de endereço continua bloqueado mesmo após o fix do backend.

## Fora do escopo
- Não vou mexer em outras policies, código de upload, formulário de evento ou design — apenas a migração de GRANT.
