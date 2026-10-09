import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadMatchData } from './load';

const row = (n: number) => ({
  id: `p${n}`, names: { en: `Programme ${n}` }, level: 'bachelor', languages: ['en'], tuition: [], free: false,
  institutions: { id: `i${Math.floor(n / 2)}`, slug: `uni-${n}`, type: 'university', country: 'GE', city: {}, names: { en: 'Uni' }, rankings: [] },
});

/** A tiny fake of the database client: rpc() answers by pages, from() answers the older query and the country table. */
function fakeClient(options: { rpc: (args: Record<string, unknown>) => { data?: unknown; error?: { code: string; message: string } }; table?: unknown[] }) {
  const calls: Record<string, unknown>[] = [];
  const table = {
    select: () => table,
    eq: () => table,
    in: () => table,
    or: () => table,
    order: () => table,
    range: async () => ({ data: options.table ?? [], error: null }),
    then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
  };
  const client = {
    rpc: async (name: string, args: Record<string, unknown>) => {
      calls.push({ name, ...args });
      return { data: null, error: null, ...options.rpc(args) };
    },
    from: () => table,
  } as unknown as SupabaseClient;
  return { client, calls };
}

describe('loadMatchData', () => {
  it('asks the database function with the filters and returns the programmes', async () => {
    const { client, calls } = fakeClient({ rpc: () => ({ data: [row(1), row(2)] }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE', 'AM'], types: ['university'], fieldPrefixes: ['041'] });
    expect(r.programs.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(calls[0]).toMatchObject({ name: 'match_programs', p_level: 'bachelor', p_countries: ['GE', 'AM'], p_types: ['university'], p_prefixes: ['041'], p_after_institution: null });
  });

  it('sends empty filters as null', async () => {
    const { client, calls } = fakeClient({ rpc: () => ({ data: [] }) });
    await loadMatchData(client, {});
    expect(calls[0]).toMatchObject({ p_level: null, p_countries: null, p_types: null, p_prefixes: null });
  });

  it('reads the next page after the last row of the previous one', async () => {
    const full = Array.from({ length: 1000 }, (_, n) => row(n));
    let call = 0;
    const { client, calls } = fakeClient({ rpc: () => ({ data: call++ === 0 ? full : [row(5000)] }) });
    const r = await loadMatchData(client, { level: 'bachelor' });
    expect(r.programs).toHaveLength(1001);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toMatchObject({ p_after_institution: 'i499', p_after_program: 'p999' });
  });

  it('falls back to the older query when the function is not installed yet', async () => {
    const { client } = fakeClient({ rpc: () => ({ error: { code: 'PGRST202', message: 'Could not find the function public.match_programs' } }), table: [row(7)] });
    const r = await loadMatchData(client, { level: 'bachelor' });
    expect(r.programs.map((p) => p.id)).toEqual(['p7']);
  });

  it('tries again when the first read hits the time limit (cold cache)', async () => {
    let call = 0;
    const timeout = { code: '57014', message: 'canceling statement due to statement timeout' };
    const { client } = fakeClient({ rpc: () => (call++ === 0 ? { error: timeout } : { data: [row(1)] }) });
    const r = await loadMatchData(client, { level: 'bachelor' });
    expect(r.programs.map((p) => p.id)).toEqual(['p1']);
  });

  it('shows a real database error instead of hiding it', async () => {
    const { client } = fakeClient({ rpc: () => ({ error: { code: '57014', message: 'canceling statement due to statement timeout' } }) });
    await expect(loadMatchData(client, { level: 'bachelor' })).rejects.toMatchObject({ code: '57014' });
  });
});
