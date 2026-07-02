import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateSubdomain,
  validateRequired,
} from './validators';

// ---------------------------------------------------------------------------
// validateEmail
// ---------------------------------------------------------------------------
describe('validateEmail', () => {
  it('returns null for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('first.last+tag@sub.domain.org')).toBeNull();
  });

  it('returns an error for a missing @ symbol', () => {
    expect(validateEmail('notanemail')).not.toBeNull();
  });

  it('returns an error for a missing domain', () => {
    expect(validateEmail('user@')).not.toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validateEmail('')).not.toBeNull();
  });

  it('returns an error for whitespace-only input', () => {
    expect(validateEmail('   ')).not.toBeNull();
  });

  it('returns an error for an email with spaces', () => {
    expect(validateEmail('user @example.com')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validatePassword
// ---------------------------------------------------------------------------
describe('validatePassword', () => {
  it('returns null for a password with exactly 8 characters', () => {
    expect(validatePassword('12345678')).toBeNull();
  });

  it('returns null for a password longer than 8 characters', () => {
    expect(validatePassword('supersecretpassword')).toBeNull();
  });

  it('returns an error for a 7-character password', () => {
    expect(validatePassword('1234567')).not.toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validatePassword('')).not.toBeNull();
  });

  it('returns an error for a single character', () => {
    expect(validatePassword('a')).not.toBeNull();
  });

  it('error message mentions 8 characters', () => {
    const msg = validatePassword('short');
    expect(msg).toMatch(/8/);
  });
});

// ---------------------------------------------------------------------------
// validateSubdomain
// ---------------------------------------------------------------------------
describe('validateSubdomain', () => {
  it('returns null for a valid subdomain', () => {
    expect(validateSubdomain('my-company')).toBeNull();
    expect(validateSubdomain('acme123')).toBeNull();
    expect(validateSubdomain('a1b2c3')).toBeNull();
  });

  it('returns null for a subdomain with multiple internal hyphens', () => {
    expect(validateSubdomain('my-great-company')).toBeNull();
  });

  it('returns an error for a leading hyphen', () => {
    expect(validateSubdomain('-badstart')).not.toBeNull();
  });

  it('returns an error for a trailing hyphen', () => {
    expect(validateSubdomain('badend-')).not.toBeNull();
  });

  it('returns an error for uppercase letters', () => {
    expect(validateSubdomain('MyCompany')).not.toBeNull();
  });

  it('returns an error for special characters other than hyphens', () => {
    expect(validateSubdomain('my_company')).not.toBeNull();
    expect(validateSubdomain('my.company')).not.toBeNull();
  });

  it('returns an error for a single character (too short for pattern)', () => {
    // Pattern requires at least 2 chars to satisfy [a-z0-9][...]*[a-z0-9]
    // Actually the regex requires start + end chars = min 2; let's test boundary
    expect(validateSubdomain('a')).not.toBeNull(); // single char doesn't match *[a-z0-9]$ end
  });

  it('returns null for a two-character subdomain (boundary case)', () => {
    // "ab" -> 'a' matches [a-z0-9], '' matches [a-z0-9-]*, 'b' matches [a-z0-9]
    expect(validateSubdomain('ab')).toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validateSubdomain('')).not.toBeNull();
  });

  it('returns an error for spaces', () => {
    expect(validateSubdomain('my company')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// validateRequired
// ---------------------------------------------------------------------------
describe('validateRequired', () => {
  it('returns null for a non-empty string', () => {
    expect(validateRequired('hello')).toBeNull();
  });

  it('returns null for a string with meaningful content', () => {
    expect(validateRequired('  hello  ')).toBeNull();
  });

  it('returns an error for an empty string', () => {
    expect(validateRequired('')).not.toBeNull();
  });

  it('returns an error for whitespace-only input', () => {
    expect(validateRequired('   ')).not.toBeNull();
    expect(validateRequired('\t\n')).not.toBeNull();
  });

  it('includes the default field name in the error message', () => {
    const msg = validateRequired('');
    expect(msg).toMatch(/This field/i);
  });

  it('includes a custom field name in the error message', () => {
    const msg = validateRequired('', 'Email');
    expect(msg).toMatch(/Email/);
  });

  it('returns an error with custom field name for whitespace-only', () => {
    const msg = validateRequired('  ', 'Company Name');
    expect(msg).toMatch(/Company Name/);
  });
});
