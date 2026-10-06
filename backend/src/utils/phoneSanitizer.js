/**
 * Phone Number Sanitizer & Formatter Utility
 * Normalizes phone numbers for Meta WhatsApp Cloud API and CRM storage.
 */

/**
 * Strips formatting, non-digit characters, and standardizes to country-coded format.
 * Defaults to country code 91 (India) if a 10-digit number is provided.
 *
 * @param {string|number} phone - Raw input phone number
 * @param {string} [defaultCountryCode='91'] - Default prefix if only national digits are provided
 * @returns {string} Digits-only phone number ready for Meta WhatsApp Cloud API
 */
export function sanitizePhoneNumber(phone, defaultCountryCode = '91') {
  if (!phone) return '';
  let clean = String(phone).replace(/[^0-9]/g, '');

  // Strip leading zero if 11 digits (e.g. 09876543210 -> 9876543210)
  if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.slice(1);
  }

  // If 10 digits, prepend default country code (India 91)
  if (clean.length === 10) {
    clean = defaultCountryCode + clean;
  }

  return clean;
}

/**
 * Returns international E.164 format with leading '+'
 * e.g. "919791471277" -> "+919791471277"
 *
 * @param {string|number} phone
 * @param {string} [defaultCountryCode='91']
 * @returns {string} E.164 formatted string
 */
export function formatE164(phone, defaultCountryCode = '91') {
  const clean = sanitizePhoneNumber(phone, defaultCountryCode);
  if (!clean) return '';
  return `+${clean}`;
}

/**
 * Extracts the last 10 significant digits of a phone number.
 * Useful for matching contacts regardless of country code variations (+91, 0, etc.)
 *
 * @param {string|number} phone
 * @returns {string} 10-digit string
 */
export function extractLast10Digits(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/[^0-9]/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Validates if the phone number meets ITU-T E.164 length limits (10 to 15 digits).
 *
 * @param {string|number} phone
 * @returns {boolean}
 */
export function isValidPhoneNumber(phone) {
  const clean = sanitizePhoneNumber(phone);
  return clean.length >= 10 && clean.length <= 15;
}

export default {
  sanitizePhoneNumber,
  formatE164,
  extractLast10Digits,
  isValidPhoneNumber,
};
