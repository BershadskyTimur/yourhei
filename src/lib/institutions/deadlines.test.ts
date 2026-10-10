import { describe, expect, it } from 'vitest';
import { visibleDeadlines } from './deadlines';

const d = (intake: string, appliesTo: string, date: string | null) => ({ intake, appliesTo, date });

describe('visibleDeadlines', () => {
  it('shows a date that is the same for EU and international students only once', () => {
    const r = visibleDeadlines([d('2027-09', 'international', '2027-05-01'), d('2027-09', 'eu', '2027-05-01')]);
    expect(r).toHaveLength(1);
    expect(r[0].appliesTo).toBe('international');
  });

  it('prefers the international date over the EU one when they differ', () => {
    const r = visibleDeadlines([d('2027-09', 'eu', '2027-07-01'), d('2027-09', 'international', '2027-05-01')]);
    expect(r.map((x) => x.date)).toEqual(['2027-05-01']);
  });

  it('keeps an "all" date and sorts several intakes by date', () => {
    const r = visibleDeadlines([d('2027-09', 'all', '2027-06-01'), d('2027-02', 'all', '2026-11-15')]);
    expect(r.map((x) => x.date)).toEqual(['2026-11-15', '2027-06-01']);
  });

  it('falls back to the EU date when nothing else is known', () => {
    expect(visibleDeadlines([d('2027-09', 'eu', '2027-07-01')]).map((x) => x.date)).toEqual(['2027-07-01']);
  });

  it('ignores deadlines without a date', () => {
    expect(visibleDeadlines([d('2027-09', 'all', null)])).toEqual([]);
  });
});
