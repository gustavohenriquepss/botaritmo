import { supabase } from '@/integrations/supabase/client';

const sanitize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24) || 'user';

/**
 * Ensures the logged-in user has a profile row with a username.
 * Returns the username (existing or newly generated).
 */
export async function ensureProfileUsername(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const user = session.user;

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id, username, display_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.username) return profile.username;

  const base = sanitize(
    (user.email ?? '').split('@')[0] || user.user_metadata?.display_name || 'user'
  );

  // Find unique candidate
  const { data: taken } = await supabase
    .from('profiles_public')
    .select('username')
    .like('username', `${base}%`);

  const used = new Set((taken ?? []).map((r: any) => r.username));
  let candidate = base;
  let i = 2;
  while (used.has(candidate)) {
    candidate = `${base}${i}`;
    i++;
  }

  const payload = {
    user_id: user.id,
    username: candidate,
    display_name:
      profile?.display_name ??
      user.user_metadata?.display_name ??
      (user.email ? user.email.split('@')[0] : 'Usuário'),
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('ensureProfileUsername error', error);
    return null;
  }
  return candidate;
}
