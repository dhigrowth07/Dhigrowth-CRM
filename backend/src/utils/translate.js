/**
 * Google Translate Utility with Dual-Endpoint Failover
 * Automatically fails over between Google Translate public mirrors (gtx & clients5)
 * to prevent 429 rate-limiting.
 */

/**
 * Translates input text to target language with automatic endpoint failover
 *
 * @param {Object} options
 * @param {string} options.text - Input text to translate
 * @param {string} [options.targetLang='hi'] - Target language code (e.g. 'hi', 'ta', 'te', 'es', 'en')
 * @param {string} [options.sourceLang='auto'] - Source language code or 'auto'
 * @returns {Promise<{success: boolean, originalText: string, translatedText: string, targetLang: string, error?: string}>}
 */
export async function translateText({ text, targetLang = 'hi', sourceLang = 'auto' }) {
  if (!text || !text.trim()) {
    return {
      success: false,
      originalText: text || '',
      translatedText: '',
      targetLang,
      error: 'Text is required for translation',
    };
  }

  const cleanText = text.trim();

  // Endpoint 1: Primary Google Translate Client GTX
  try {
    const url1 = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    const res1 = await fetch(url1);

    if (res1.ok) {
      const data1 = await res1.json();
      if (Array.isArray(data1?.[0])) {
        const translatedText = data1[0].map((segment) => (segment ? segment[0] : '')).join('');
        if (translatedText) {
          return {
            success: true,
            originalText: cleanText,
            translatedText,
            targetLang,
            provider: 'google-gtx',
          };
        }
      }
    }
  } catch (err1) {
    console.warn(`[Translate] Primary mirror note: ${err1.message}`);
  }

  // Endpoint 2: Fallback Google Chrome Extension Translation Mirror (handles 429 failover)
  try {
    const url2 = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}&q=${encodeURIComponent(cleanText)}`;
    const res2 = await fetch(url2);

    if (res2.ok) {
      const data2 = await res2.json();
      let translatedText = '';

      if (Array.isArray(data2)) {
        if (Array.isArray(data2[0]) && typeof data2[0][0] === 'string') {
          translatedText = data2[0][0];
        } else if (typeof data2[0] === 'string') {
          translatedText = data2[0];
        }
      }

      if (translatedText) {
        return {
          success: true,
          originalText: cleanText,
          translatedText,
          targetLang,
          provider: 'google-clients5-failover',
        };
      }
    }
  } catch (err2) {
    console.warn(`[Translate] Secondary mirror note: ${err2.message}`);
  }

  // Fallback: Return original text gracefully if all network mirrors fail
  return {
    success: false,
    originalText: cleanText,
    translatedText: cleanText,
    targetLang,
    error: 'All translation mirrors temporarily unavailable. Original text preserved.',
  };
}

export default { translateText };
