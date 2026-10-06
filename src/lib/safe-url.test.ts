import { describe, expect, it } from 'vitest';
import { safeHttpUrl } from './safe-url';

describe('safeHttpUrl', () => {
  it('keeps normal web addresses', () => {
    expect(safeHttpUrl('https://nu.edu.kz/admissions')).toBe('https://nu.edu.kz/admissions');
    expect(safeHttpUrl('  http://example.com  ')).toBe('http://example.com/');
  });
  it('drops anything that is not http or https', () => {
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:x', 'file:///etc/passwd', '//evil.example', 'ftp://example.com']) {
      expect(safeHttpUrl(bad), bad).toBeNull();
    }
  });
  it('drops empty, huge and non-string values', () => {
    expect(safeHttpUrl('')).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
    expect(safeHttpUrl(42)).toBeNull();
    expect(safeHttpUrl('https://example.com/' + 'a'.repeat(3000))).toBeNull();
  });
});
