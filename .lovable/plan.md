## Diagnóstico

O usuário está autenticado e o evento pertence ao mesmo `user_id` (`273fbe37-9404-4a7f-8686-e5de0d04c586`), então o erro não é falta de login nem evento de outro criador.

As permissões técnicas (`GRANT`) já estão presentes. O ponto mais provável é a política de atualização de `events`, que hoje está definida para `roles: {public}` e sem `WITH CHECK`. Vou substituir por uma política explícita para `authenticated`, com validação do dono também no resultado da atualização.

## Plano

1. Atualizar a RLS de `events`
   - Remover a política antiga `Users can update their own events`.
   - Criar uma nova política explícita para usuários logados.
   - Permitir editar apenas eventos onde `created_by = auth.uid()`.
   - Garantir que o evento continue pertencendo ao mesmo usuário depois do update com `WITH CHECK (created_by = auth.uid())`.

2. Proteger o código contra mudança acidental de dono
   - Revisar o update em `EditEvent.tsx` para garantir que ele não envie `created_by`.
   - Manter apenas os campos editáveis do formulário, incluindo `broadcasts_brazil_game`.

3. Validar
   - Confirmar no banco que a nova policy está ativa.
   - Confirmar que o evento problemático pertence ao usuário logado.
   - Se necessário, orientar um refresh/login novo para o navegador usar a sessão atualizada.

## Detalhes técnicos

Migration proposta:

```sql
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;

CREATE POLICY "Authenticated users can update their own events"
ON public.events
FOR UPDATE
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);
```

Isso não libera edição de eventos de terceiros e não torna dados privados públicos.