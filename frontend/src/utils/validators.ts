/**
 * Client-side validation utilities.
 * All validators return null when the value is valid,
 * or a descriptive error string when it is not.
 */

/** Matches most RFC-compliant email addresses. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pattern: lowercase alphanumeric characters and internal hyphens.
 * Must start and end with an alphanumeric character.
 * Minimum length: 3 characters (one char on each side of at least one middle char).
 */
const SUBDOMAIN_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

/**
 * Validates that a string is a properly formatted email address.
 *
 * @returns null if valid, error message string if invalid.
 *
 * @example
 * validateEmail('user@example.com') // null
 * validateEmail('not-an-email')     // "Please enter a valid email address"
 */
export function validateEmail(value: string): string | null {
  if (!value || !EMAIL_REGEX.test(value.trim())) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Validates that a password meets the minimum length requirement of 8 characters.
 *
 * @returns null if valid, error message string if invalid.
 *
 * @example
 * validatePassword('secret12')  // null
 * validatePassword('short')     // "Password must be at least 8 characters"
 */
export function validatePassword(value: string): string | null {
  if (!value || value.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

/**
 * Validates a subdomain against the pattern: lowercase alphanumeric + internal hyphens,
 * no leading or trailing hyphens, minimum 3 characters.
 *
 * Pattern: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/
 *
 * @returns null if valid, error message string if invalid.
 *
 * @example
 * validateSubdomain('my-company')  // null
 * validateSubdomain('-bad')        // error message
 * validateSubdomain('AB')          // error message (uppercase not allowed)
 */
export function validateSubdomain(value: string): string | null {
  if (!value || !SUBDOMAIN_REGEX.test(value)) {
    return 'Subdomain must be lowercase alphanumeric with optional internal hyphens (e.g. my-company)';
  }
  return null;
}

/**
 * Validates that a field is not empty or whitespace-only.
 *
 * @param fieldName - Optional label used in the error message (defaults to "This field").
 * @returns null if valid, error message string if invalid.
 *
 * @example
 * validateRequired('hello')      // null
 * validateRequired('')           // "This field is required"
 * validateRequired('  ')         // "This field is required"
 * validateRequired('', 'Name')   // "Name is required"
 */
export function validateRequired(value: string, fieldName = 'This field'): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}
