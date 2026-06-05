export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', geminiCode: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', geminiCode: 'Hindi' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ', geminiCode: 'Kannada' },
};

/**
 * Get language info by code.
 * @param {string} code - Language code (e.g., 'en', 'hi')
 * @returns {object|null} Language info or null
 */
export function getLanguage(code) {
  return SUPPORTED_LANGUAGES[code] || null;
}

/**
 * Check if a language code is supported.
 * @param {string} code 
 * @returns {boolean}
 */
export function isValidLanguage(code) {
  return code in SUPPORTED_LANGUAGES;
}

/**
 * Get all supported language codes.
 * @returns {string[]}
 */
export function getLanguageCodes() {
  return Object.keys(SUPPORTED_LANGUAGES);
}
