-- YourHEI: sign-in with Google. Run AFTER 0001-0007. Safe to run again.
-- Paste into Supabase -> SQL Editor -> Run.
--
-- A person who signs up with Google sees the Privacy Policy / Terms notice next to the button; when they
-- come back from Google the site calls this function to record that acceptance (once).

create or replace function public.accept_terms()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;
  update public.profiles
     set privacy_accepted_at = coalesce(privacy_accepted_at, now()),
         terms_accepted_at   = coalesce(terms_accepted_at, now())
   where id = auth.uid();
end $$;

revoke all on function public.accept_terms() from public, anon;
grant execute on function public.accept_terms() to authenticated;
