// Is the signed-in person an administrator? Read once per page load (the answer is kept) and only for people who
// are signed in. It is used to decide what to show (the "Admin" link, the ad places); the admin pages themselves are
// protected by the database.
let pending: Promise<boolean> | null = null;

export function fetchIsAdmin(): Promise<boolean> {
  pending ??= (async () => {
    try {
      const { getSupabaseBrowser } = await import('./client');
      const supabase = getSupabaseBrowser();
      if (!supabase) return false;
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return false;
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      return data?.role === 'admin';
    } catch {
      return false;
    }
  })();
  return pending;
}

/** Forget the answer (after signing in or out). */
export function resetIsAdmin() {
  pending = null;
}
