import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getItem, setItem, removeItem } from './storage';

// jsdom provides a real localStorage implementation; we use it directly.
beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// setItem / getItem round-trip
// ---------------------------------------------------------------------------
describe('setItem + getItem', () => {
  it('stores and retrieves a string value', () => {
    setItem('token', 'abc123');
    expect(getItem<string>('token')).toBe('abc123');
  });

  it('stores and retrieves a number value', () => {
    setItem('count', 42);
    expect(getItem<number>('count')).toBe(42);
  });

  it('stores and retrieves a boolean', () => {
    setItem('flag', true);
    expect(getItem<boolean>('flag')).toBe(true);
  });

  it('stores and retrieves an object', () => {
    const user = { id: 1, name: 'Alice', role: 'ADMIN' };
    setItem('user', user);
    expect(getItem<typeof user>('user')).toEqual(user);
  });

  it('stores and retrieves an array', () => {
    const items = [1, 2, 3];
    setItem('list', items);
    expect(getItem<number[]>('list')).toEqual(items);
  });

  it('stores null as a JSON null and retrieves it', () => {
    setItem('nullable', null);
    // JSON.stringify(null) → "null", JSON.parse("null") → null
    expect(getItem('nullable')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getItem
// ---------------------------------------------------------------------------
describe('getItem', () => {
  it('returns null for a missing key', () => {
    expect(getItem('nonexistent')).toBeNull();
  });

  it('returns null and warns when the stored value is malformed JSON', () => {
    localStorage.setItem('bad', '{not valid json}');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = getItem('bad');
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// removeItem
// ---------------------------------------------------------------------------
describe('removeItem', () => {
  it('removes an existing key', () => {
    setItem('token', 'abc');
    removeItem('token');
    expect(getItem('token')).toBeNull();
  });

  it('does not throw when the key does not exist', () => {
    expect(() => removeItem('ghost')).not.toThrow();
  });
});
