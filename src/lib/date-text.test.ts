import { describe, expect, it } from 'vitest';
import { dateBeforeStop } from './date-text';

describe('dateBeforeStop', () => {
  it('drops the dot that ends a Russian long date, so "{date}." ends in one dot', () => {
    const date = new Intl.DateTimeFormat('ru', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date('2026-10-23T00:00:00Z'));
    expect(`Данные проверены ${dateBeforeStop(date)}.`).toBe('Данные проверены 23 октября 2026 г.');
  });

  it('leaves dates without a final dot as they are', () => {
    const date = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date('2026-10-23T00:00:00Z'));
    expect(dateBeforeStop(date)).toBe('October 23, 2026');
  });
});
