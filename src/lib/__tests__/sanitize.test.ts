import { describe, expect, it } from 'vitest';
import { clean, isPlausibleContact, makeReceipt } from '../sanitize';

describe('clean', () => {
  it('drops undefined, null and blank values and trims strings', () => {
    expect(clean({ a: ' x ', b: undefined, c: '   ', d: null, e: 3 })).toEqual({ a: 'x', e: 3 });
  });
  it('caps lengths', () => {
    expect(clean({ a: 'abcdef' }, { a: 3 })).toEqual({ a: 'abc' });
  });
});

describe('receipts and contacts', () => {
  it('creates receipt codes that match the security rules pattern', () => {
    for (let i = 0; i < 50; i++) expect(makeReceipt('NOT')).toMatch(/^NR-[A-Z]{3}-[A-Z0-9]{6}$/);
  });
  it('accepts phone numbers and e-mail addresses only', () => {
    expect(isPlausibleContact('+250 788 123 456')).toBe(true);
    expect(isPlausibleContact('someone@example.com')).toBe(true);
    expect(isPlausibleContact('hello')).toBe(false);
  });
});
