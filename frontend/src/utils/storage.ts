/**
 * Typed localStorage helpers.
 * Values are serialized to/from JSON automatically.
 * All operations are safe — exceptions are caught and logged rather than thrown.
 */

/** Key used to store the JWT access token. */
export const TOKEN_KEY = 'token';

/** Key used to persist the user's preferred theme mode. */
export const THEME_KEY = 'theme-mode';

/**
 * Retrieves and deserializes a value from localStorage.
 *
 * @returns The parsed value typed as T, or null if the key is absent or parsing fails.
 *
 * @example
 * const token = getItem<string>('token');
 * const user  = getItem<{ id: number; name: string }>('current-user');
 */
export function getItem<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Failed to read key "${key}":`, err);
    return null;
  }
}

/**
 * Serializes and stores a value in localStorage.
 *
 * @example
 * setItem('token', 'eyJhbGc...');
 * setItem('settings', { theme: 'dark' });
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Failed to write key "${key}":`, err);
  }
}

/**
 * Removes a key from localStorage.
 *
 * @example
 * removeItem('token');
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Failed to remove key "${key}":`, err);
  }
}
