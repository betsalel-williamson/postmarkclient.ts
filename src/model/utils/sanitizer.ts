import sanitize from 'sanitize-html';

/**
 * Recursively sanitizes all string values within an object using sanitize-html.
 * This is useful for cleaning user-provided data before it's used in templates
 * to prevent XSS vulnerabilities.
 *
 * @param obj The object to sanitize.
 * @returns A new object with all string values sanitized.
 */
export function sanitizeObjectStrings<T extends Record<string, unknown>>(obj: T): T {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (typeof value === 'string') {
        newObj[key] = sanitize(value, { allowedTags: [] });
      } else if (typeof value === 'object' && value !== null) {
        newObj[key] = sanitizeObjectStrings(value as Record<string, unknown>);
      } else {
        newObj[key] = value;
      }
    }
  }
  return newObj as T;
}
