import { beforeEach, describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { clearMatchCache, loadMatchData, resetFieldCheck, resetSlimCheck } from './load';

const row = (n: number) => ({
  id: `p${n}`, names: { en: `Programme ${n}` }, level: 'bachelor', languages: ['en'], tuition: [], free: false,
  institutions: { id: `i${Math.floor(n / 2)}`, slug: `uni-${n}`, type: 'university', country: 'GE', city: {}, names: { en: 'Uni' }, rankings: [] },
});

/** A tiny fake of the database client: rpc() answers by pages, from() answers the older query and the country table. */
function fakeClient(options: { rpc: (args: Record<string, unknown>) => { data?: unknown; error?: { code: string; message: string } }; table?: unknown[]; counts?: { country: string; n: number }[]; slim?: boolean; field?: boolean }) {
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
      if (name === 'programme_country_counts') {
        // without `counts` the function "is not installed yet": the loader then reads one long list, as before
        return options.counts ? { data: options.counts, error: null } : { data: null, error: { code: 'PGRST202', message: 'Could not find the function public.programme_country_counts' } };
      }
      // the lighter function (migration 0037) is "not installed" unless a test asks for it
      if (name === 'match_programs_slim' && !options.slim) return { data: null, error: { code: 'PGRST202', message: 'Could not find the function public.match_programs_slim' } };
      if (name === 'match_programs_field' && !options.field) return { data: null, error: { code: 'PGRST202', message: 'Could not find the function public.match_programs_field' } };
      calls.push({ name, ...args });
      const answer = { data: null, error: null, ...options.rpc(args) };
      if ((name === 'match_programs_slim' || name === 'match_programs_field') && Array.isArray(answer.data)) {
        // turn the older rows into the lighter shape: the institutions once, the programmes pointing to them
        const rows = answer.data as { institutions: { id: string } }[];
        const institutions = Object.fromEntries(rows.map((r) => [r.institutions.id, r.institutions]));
        return { ...answer, data: { programs: rows.map(({ institutions: i, ...rest }) => ({ ...rest, institution_id: i.id })), institutions } };
      }
      return answer;
    },
    from: () => table,
  } as unknown as SupabaseClient;
  return { client, calls };
}

describe('loadMatchData', () => {
  beforeEach(() => {
    clearMatchCache();
    resetSlimCheck();
    resetFieldCheck();
  });

  it('asks the database function with the filters and returns the programmes', async () => {
    const { client, calls } = fakeClient({ rpc: () => ({ data: [row(1), row(2)] }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE', 'AM'], types: ['university'], fieldPrefixes: ['041'] });
    expect(r.programs.map((p) => p.id)).toEqual(['p1', 'p2', 'p1', 'p2']); // the fake answers the same for both countries
    // every country is its own search (they run at the same time); the sizes are unknown here, so the field is asked in the database
    expect(calls.map((c) => c.p_countries)).toEqual([['GE'], ['AM']]);
    expect(calls[0]).toMatchObject({ name: 'match_programs', p_level: 'bachelor', p_types: ['university'], p_prefixes: ['041'], p_after_institution: null });
  });

  it('sends empty filters as null', async () => {
    const { client, calls } = fakeClient({ rpc: () => ({ data: [] }) });
    await loadMatchData(client, {});
    // no country chosen and no count function: the countries of the data files, each its own search
    expect(calls.length).toBeGreaterThan(5);
    expect(calls[0]).toMatchObject({ p_level: null, p_types: null, p_prefixes: null });
    expect(calls[0].p_countries).toHaveLength(1);
  });

  it('reads the next page after the last row of the previous one', async () => {
    const full = Array.from({ length: 1000 }, (_, n) => row(n));
    let call = 0;
    const { client, calls } = fakeClient({ rpc: () => ({ data: call++ === 0 ? full : [row(5000)] }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] });
    expect(r.programs).toHaveLength(1001);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toMatchObject({ p_after_institution: 'i499', p_after_program: 'p999' });
  });

  it('falls back to the older query when the function is not installed yet', async () => {
    const { client } = fakeClient({ rpc: () => ({ error: { code: 'PGRST202', message: 'Could not find the function public.match_programs' } }), table: [row(7)] });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] });
    expect(r.programs.map((p) => p.id)).toEqual(['p7']);
  });

  it('tries again when the first read hits the time limit (cold cache)', async () => {
    let call = 0;
    const timeout = { code: '57014', message: 'canceling statement due to statement timeout' };
    const { client } = fakeClient({ rpc: () => (call++ === 0 ? { error: timeout } : { data: [row(1)] }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] });
    expect(r.programs.map((p) => p.id)).toEqual(['p1']);
  });

  it('shows a real database error instead of hiding it', async () => {
    const { client } = fakeClient({ rpc: () => ({ error: { code: '42501', message: 'permission denied' } }) });
    await expect(loadMatchData(client, { level: 'bachelor', countries: ['GE'] })).rejects.toMatchObject({ code: '42501' });
  });

  it('a search that always runs into the time limit gives an empty, partial result (the page then says the server is slow)', async () => {
    const { client } = fakeClient({ rpc: () => ({ error: { code: '57014', message: 'canceling statement due to statement timeout' } }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] });
    expect(r.programs).toHaveLength(0);
    expect(r.partial).toBe(true);
  });

  it('keeps what it has read when a later page keeps timing out, and says the result is partial', async () => {
    const full = Array.from({ length: 1000 }, (_, n) => row(n));
    let call = 0;
    const timeout = { code: '57014', message: 'canceling statement due to statement timeout' };
    const { client } = fakeClient({ rpc: () => (call++ === 0 ? { data: full } : { error: timeout }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] });
    expect(r.programs).toHaveLength(1000);
    expect(r.partial).toBe(true);
  });

  it('stops asking for more pages when the time budget is used up', async () => {
    const full = Array.from({ length: 1000 }, (_, n) => row(n));
    const { client, calls } = fakeClient({ rpc: () => ({ data: full }) });
    const r = await loadMatchData(client, { level: 'bachelor', countries: ['GE'] }, Date.now() - 1); // the budget is over from the start
    expect(calls).toHaveLength(1); // the first page is always read
    expect(r.programs).toHaveLength(1000);
    expect(r.partial).toBe(true);
  });

  it('a complete read is not marked partial', async () => {
    const { client } = fakeClient({ rpc: () => ({ data: [row(1)] }) });
    expect((await loadMatchData(client, { level: 'bachelor', countries: ['GE'] })).partial).toBe(false);
  });

  describe('with the country counts (migration 0036)', () => {
    const counts = [{ country: 'US', n: 4000 }, { country: 'GE', n: 2 }, { country: 'DE', n: 1 }];
    const inCountry = (c: string, n: number) => ({ ...row(n), institutions: { ...row(n).institutions, country: c } });

    it('reads every country with programmes as its own search, the biggest first', async () => {
      const { client, calls } = fakeClient({ counts, rpc: (a) => ({ data: [inCountry((a.p_countries as string[])[0], 1)] }) });
      const r = await loadMatchData(client, { level: 'bachelor' });
      expect(calls.map((c) => c.p_countries)).toEqual([['US'], ['GE'], ['DE']]);
      expect(r.programs.map((p) => p.institution.country)).toEqual(['US', 'GE', 'DE']);
    });

    it('reads only the chosen countries and skips those with no programmes', async () => {
      const { client, calls } = fakeClient({ counts, rpc: () => ({ data: [] }) });
      await loadMatchData(client, { level: 'bachelor', countries: ['GE', 'AM'] });
      expect(calls.map((c) => c.p_countries)).toEqual([['GE']]);
    });

    it('asks the database for the field only in a big country; small ones are cut here', async () => {
      const mk = (id: string, f: string, c: string) => ({ ...inCountry(c, 1), id, isced_f: f });
      const { client, calls } = fakeClient({
        counts: [{ country: 'US', n: 4000 }, { country: 'GE', n: 2 }],
        rpc: (a) => ({ data: (a.p_countries as string[])[0] === 'US' ? [mk('us1', '0613', 'US')] : [mk('ge1', '0613', 'GE'), mk('ge2', '0231', 'GE')] }),
      });
      const r = await loadMatchData(client, { level: 'bachelor', fieldPrefixes: ['061'] });
      expect(calls.find((c) => c.p_countries?.toString() === 'US')).toMatchObject({ p_prefixes: ['061'] });
      expect(calls.find((c) => c.p_countries?.toString() === 'GE')).toMatchObject({ p_prefixes: null });
      expect(r.programs.map((p) => p.id).sort()).toEqual(['ge1', 'us1']);
    });

    it('reads a big country whole when its field search runs into the time limit', async () => {
      const timeout = { code: '57014', message: 'canceling statement due to statement timeout' };
      const mk = (id: string, f: string) => ({ ...inCountry('US', 1), id, isced_f: f });
      const { client, calls } = fakeClient({
        counts: [{ country: 'US', n: 4000 }],
        rpc: (a) => (a.p_prefixes ? { error: timeout } : { data: [mk('a', '0613'), mk('b', '0231')] }),
      });
      const r = await loadMatchData(client, { level: 'bachelor', fieldPrefixes: ['061'] });
      expect(r.programs.map((p) => p.id)).toEqual(['a']);
      expect(calls.some((c) => c.p_prefixes === null)).toBe(true);
    });

    it('leaves out a country the database cannot answer in time and marks the result partial', async () => {
      const timeout = { code: '57014', message: 'canceling statement due to statement timeout' };
      const { client } = fakeClient({ counts, rpc: (a) => ((a.p_countries as string[])[0] === 'US' ? { error: timeout } : { data: [inCountry((a.p_countries as string[])[0], 1)] }) });
      const r = await loadMatchData(client, { level: 'bachelor' });
      expect(r.programs.map((p) => p.institution.country).sort()).toEqual(['DE', 'GE']);
      expect(r.partial).toBe(true);
    });

    it('reuses what was read a moment ago and does not read twice', async () => {
      const { client, calls } = fakeClient({ counts, rpc: (a) => ({ data: [inCountry((a.p_countries as string[])[0], 1)] }) });
      await loadMatchData(client, { level: 'bachelor' });
      const before = calls.length;
      const again = await loadMatchData(client, { level: 'bachelor' });
      expect(calls).toHaveLength(before);
      expect(again.programs).toHaveLength(3);
    });

    it('does not keep a partial read', async () => {
      const full = Array.from({ length: 1000 }, (_, n) => inCountry('US', n));
      const { client, calls } = fakeClient({ counts: [{ country: 'US', n: 5000 }], rpc: () => ({ data: full }) });
      await loadMatchData(client, { level: 'bachelor' }, Date.now() - 1);
      const before = calls.length;
      await loadMatchData(client, { level: 'bachelor' }, Date.now() - 1);
      expect(calls.length).toBeGreaterThan(before);
    });

    it('samples a big country when no country was chosen, and reads it fully when it was chosen', async () => {
      const full = Array.from({ length: 1000 }, (_, n) => inCountry('US', n));
      const big = [{ country: 'US', n: 50000 }];
      const a = fakeClient({ counts: big, rpc: () => ({ data: full }) });
      await loadMatchData(a.client, { level: 'bachelor' });
      expect(a.calls).toHaveLength(3);
      clearMatchCache();
      const b = fakeClient({ counts: big, rpc: () => ({ data: full }) });
      await loadMatchData(b.client, { level: 'bachelor', countries: ['US'] });
      expect(b.calls).toHaveLength(20);
    });

    it('uses the lighter database function when it exists and gives the same programmes', async () => {
      // the programmes of one institution carry the same institution (as in the database)
      const mk = (c: string) => [1, 2, 3].map((n) => ({ ...row(n), institutions: { ...row(n).institutions, id: 'i1', slug: 'uni', country: c } }));
      const slim = fakeClient({ counts: [{ country: 'GE', n: 10 }], slim: true, rpc: () => ({ data: mk('GE') }) });
      const old = fakeClient({ counts: [{ country: 'GE', n: 10 }], rpc: () => ({ data: mk('GE') }) });
      const a = await loadMatchData(slim.client, { level: 'bachelor' });
      clearMatchCache();
      resetSlimCheck();
      const b = await loadMatchData(old.client, { level: 'bachelor' });
      expect(slim.calls.every((c) => c.name === 'match_programs_slim')).toBe(true);
      expect(old.calls.every((c) => c.name === 'match_programs')).toBe(true);
      expect(a.programs).toEqual(b.programs);
      expect(a.programs).toHaveLength(3);
    });

    it('remembers that the lighter function is missing and does not ask for it again', async () => {
      const { client, calls } = fakeClient({ counts: [{ country: 'GE', n: 10 }, { country: 'DE', n: 5 }], rpc: () => ({ data: [] }) });
      await loadMatchData(client, { level: 'bachelor' });
      expect(calls.filter((c) => c.name === 'match_programs_slim')).toHaveLength(0);
      expect(calls.filter((c) => c.name === 'match_programs').length).toBeGreaterThan(0);
    });

    it('reads each chosen field of a big country from its index (migration 0039), and only the big ones', async () => {
      const mk = (id: string, f: string, c: string) => ({ ...inCountry(c, 1), id, isced_f: f });
      const { client, calls } = fakeClient({
        counts: [{ country: 'US', n: 9000 }, { country: 'GE', n: 5 }],
        field: true,
        rpc: (a) => ((a.p_countries as string[])[0] === 'US' ? { data: [mk(`us-${a.p_prefix ?? 'x'}`, `${a.p_prefix}1`, 'US')] } : { data: [mk('ge1', '0613', 'GE'), mk('ge2', '0231', 'GE')] }),
      });
      const r = await loadMatchData(client, { level: 'bachelor', fieldPrefixes: ['041', '061', '04'] });
      const field = calls.filter((c) => c.name === 'match_programs_field');
      // "041" lies inside "04": only "04" and "061" are asked
      expect(field.map((c) => c.p_prefix).sort()).toEqual(['04', '061']);
      expect(calls.filter((c) => c.p_countries?.toString() === 'GE' && c.name !== 'match_programs_field')[0]).toMatchObject({ p_prefixes: null });
      expect(r.programs.map((p) => p.id).sort()).toEqual(['ge1', 'us-04', 'us-061']);
    });

    it('goes back to the older field search when the field function is not installed', async () => {
      const mk = (id: string, f: string) => ({ ...inCountry('US', 1), id, isced_f: f });
      const { client, calls } = fakeClient({ counts: [{ country: 'US', n: 9000 }], rpc: () => ({ data: [mk('a', '0613')] }) });
      const r = await loadMatchData(client, { level: 'bachelor', fieldPrefixes: ['061'] });
      expect(calls.some((c) => c.name !== 'match_programs_field' && c.p_prefixes?.toString() === '061')).toBe(true);
      expect(r.programs.map((p) => p.id)).toEqual(['a']);
    });
  });
});
