// The citizenships saved in the signed-in person's profile (to preselect filters). Read once per page load.
let pending: Promise<string[]> | null = null;

export function fetchMyCitizenships(): Promise<string[]> {
  pending ??= (async () => {
    try {
      const { getSupabaseBrowser } = await import('./client');
      const supabase = getSupabaseBrowser();
      if (!supabase) return [];
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return [];
      const { data } = await supabase.from('profiles').select('citizenships').eq('id', userId).maybeSingle();
      const list = data?.citizenships;
      return Array.isArray(list) ? list.filter((c): c is string => typeof c === 'string') : [];
    } catch {
      return [];
    }
  })();
  return pending;
}
