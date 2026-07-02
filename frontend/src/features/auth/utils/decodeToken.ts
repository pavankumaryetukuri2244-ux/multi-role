/**
 * Decodes a JWT token and returns the payload as an object.
 * Returns null if the token is malformed or decoding fails.
 */
export function decodeToken(
  token: string
): { role: string; sub?: string; userId?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );
    return JSON.parse(atob(padded)) as {
      role: string;
      sub?: string;
      userId?: number;
    };
  } catch {
    return null;
  }
}
