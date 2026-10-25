import type { Block } from '@/lib/blog/types';

// Short builders for the blocks of a translated article (the structure must be the same as in the English article: a test checks it).
export const p = (text: string): Block => ({ t: 'p', text });
export const h2 = (id: string, text: string): Block => ({ t: 'h2', id, text });
export const ul = (...items: string[]): Block => ({ t: 'ul', items });
export const ol = (...items: string[]): Block => ({ t: 'ol', items });
export const cta = (href: string, text: string): Block => ({ t: 'cta', href, text });
export const rules = (topic: 'work' | 'after'): Block => ({ t: 'rules', topic });
export const funds: Block = { t: 'funds' };
export const fullFunding = (level: 'bachelor' | 'master' | 'phd'): Block => ({ t: 'scholarships', covers: 'full', level });
export const scholarshipsFor = (...countries: string[]): Block => ({ t: 'scholarshipsFor', countries });
