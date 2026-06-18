# Perfil direto + edição opcional

## Comportamento desejado
- Clicar em **MEU PERFIL** (navbar) leva direto para o perfil público do usuário (`/{username}`), não mais para a tela de edição.
- Se o usuário ainda não tem perfil configurado, o perfil público abre normalmente mostrando:
  - avatar placeholder (iniciais ou ícone padrão)
  - nome de exibição (vindo do `display_name` que já é criado no signup a partir do email)
  - um username gerado automaticamente (ex.: a partir do email, garantindo unicidade) — o usuário pode trocá-lo depois
  - bio/tags vazias (seções simplesmente não aparecem se vazias)
- No próprio perfil público, quando o visitante for o dono, mostrar um botão **EDITAR PERFIL** (estilo da marca) no topo, ao lado de Compartilhar, que leva para `/perfil/editar`.

## Mudanças

### 1. Roteamento (`src/App.tsx`)
- Renomear rota de edição: `/perfil` → `/perfil/editar` (mantém `EditProfile`).
- `/:handle` continua servindo `PublicProfile`.

### 2. Navbar (`src/components/Navbar.tsx`)
- Trocar os dois links `MEU PERFIL` (desktop e mobile) por um handler que:
  1. Busca `username` do perfil do usuário logado.
  2. Se existir → `navigate('/' + username)`.
  3. Se não existir → gera username default (ver passo 3), grava no perfil via `upsert`, e navega.

### 3. Geração de username default
Função utilitária no client: deriva base do email (`split_part(email,'@',1)` saneado a-z0-9_) e, se já existir, tenta sufixos numéricos (`name`, `name2`, `name3`...) usando consulta `select username from profiles where username like 'base%'`. Resultado é salvo no perfil antes de navegar.

### 4. PublicProfile (`src/pages/PublicProfile.tsx`)
- Detectar dono: comparar `session.user.id` com `profile.user_id`.
- Se dono → renderizar botão **EDITAR PERFIL** que leva para `/perfil/editar`.
- Garantir que avatar nulo mostra placeholder (iniciais sobre fundo cinza com borda preta, padrão da marca) em vez de quebrar.
- Esconder seções de bio e tags quando vazias (já deve ser o caso; confirmar).
- Página de perfil **não** retorna mais "não encontrado" para o próprio dono quando ele ainda não criou — mas isso só ocorre se o passo 2 falhar; o fluxo normal já garante criação antes de navegar.

### 5. EditProfile (`src/pages/EditProfile.tsx`)
- Após salvar, navega para `/{username}` (já faz).
- Botão "VER MEU PERFIL" continua igual.
- Adicionar link/botão "VOLTAR PARA O PERFIL" no topo.

## Fora de escopo
- Mudanças no schema do banco (a coluna `username` já existe e a unicidade já é validada).
- Trigger SQL para gerar username automaticamente no signup — a geração fica no client, no primeiro clique em "Meu perfil", para evitar nova migration.
