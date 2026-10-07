import { describe, expect, it } from 'vitest';
import { pickInternationalTuition, totalYearly, yearlyLiving, yearlyTuition } from './cost';

const rates = { EUR: 0.9, GEL: 2.7 };

describe('yearlyTuition', () => {
  it('takes the international line and converts it', () => {
    const p = yearlyTuition(
      [{ amount: 100, currency: 'EUR', period: 'year', appliesTo: 'domestic' }, { amount: 900, currency: 'EUR', period: 'year', appliesTo: 'international' }],
      4, 'USD', rates,
    );
    expect(p?.currency).toBe('USD');
    expect(p?.amount).toBeCloseTo(1000);
    expect(p?.converted).toBe(true);
  });
  it('keeps the published currency when a rate is unknown', () => {
    const p = yearlyTuition([{ amount: 500, currency: 'XYZ', period: 'semester', appliesTo: 'all' }], null, 'USD', rates);
    expect(p).toEqual({ amount: 1000, currency: 'XYZ', converted: false });
  });
  it('turns a total price into a yearly one and refuses a price per credit', () => {
    expect(yearlyTuition([{ amount: 9000, currency: 'USD', period: 'total', appliesTo: 'all' }], 3, 'USD', rates)?.amount).toBe(3000);
    expect(yearlyTuition([{ amount: 9, currency: 'USD', period: 'credit', appliesTo: 'all' }], 3, 'USD', rates)).toBeNull();
  });
  it('is null without a price', () => {
    expect(yearlyTuition([], 3, 'USD', rates)).toBeNull();
    expect(pickInternationalTuition([{ amount: null, currency: 'USD', period: 'year', appliesTo: 'all' }])).toBeNull();
  });
});

describe('living and total cost', () => {
  const list = [
    { city: { en: 'Tbilisi' }, amountPerMonth: 270, currency: 'USD' },
    { city: { en: 'Batumi' }, amountPerMonth: null, currency: 'USD' },
  ];
  it('uses the city when known, otherwise the first known city', () => {
    expect(yearlyLiving(list, { en: 'Tbilisi' }, 'USD', rates)).toBe(3240);
    expect(yearlyLiving(list, { en: 'Kutaisi' }, 'USD', rates)).toBe(3240);
    expect(yearlyLiving([], { en: 'Tbilisi' }, 'USD', rates)).toBeNull();
  });
  it('adds tuition and living only when both are known', () => {
    const tuition = { amount: 2000, currency: 'USD', converted: false };
    expect(totalYearly(tuition, false, 3240, 'USD')).toEqual({ tuition: 2000, living: 3240, total: 5240, currency: 'USD' });
    expect(totalYearly(null, true, 3240, 'USD')?.total).toBe(3240);
    expect(totalYearly(null, false, 3240, 'USD')).toBeNull();
    expect(totalYearly(tuition, false, null, 'USD')).toBeNull();
  });
});
