const languageAliases = new Map([
  ["bm", "Bahasa Melayu"],
  ["malay", "Bahasa Melayu"],
  ["bahasa melayu", "Bahasa Melayu"],
  ["bahasa malaysia", "Bahasa Melayu"],
  ["bi", "Bahasa Indonesia"],
  ["indonesian", "Bahasa Indonesia"],
  ["indo", "Bahasa Indonesia"],
  ["bahasa indonesia", "Bahasa Indonesia"],
  ["cn", "Mandarin"],
  ["zh", "Mandarin"],
  ["chinese", "Mandarin"],
  ["mandarin", "Mandarin"],
  ["en", "English"],
  ["eng", "English"],
  ["english", "English"],
  ["jp", "Japanese"],
  ["ja", "Japanese"],
  ["japanese", "Japanese"],
  ["th", "Thai"],
  ["thai", "Thai"],
  ["vn", "Vietnamese"],
  ["vi", "Vietnamese"],
  ["vietnamese", "Vietnamese"],
  ["km", "Khmer"],
  ["cambodian", "Khmer"],
  ["khmer", "Khmer"],
  ["kr", "Korean"],
  ["ko", "Korean"],
  ["korean", "Korean"],
  ["ar", "Arabic"],
  ["arabic", "Arabic"],
]);

/**
 * Normalizes a language alias to its canonical name.
 * @param {string} lang - Raw language string.
 * @returns {string} Canonical language name.
 */
export function normalizeLanguageAlias(lang) {
  if (!lang) return lang;
  const trimmed = lang.trim();
  const key = trimmed.toLowerCase();
  return languageAliases.get(key) || trimmed;
}

export function normalizeLanguage(text, savedProfile) {
  if (savedProfile.language) return null;
  const trimmed = text.trim();
  if (/^(中文|华语|普通话)$/.test(trimmed)) {
    return { field: "language", value: "Mandarin" };
  }
  const normalized = normalizeLanguageAlias(trimmed);
  const known = new Set([
    "English",
    "Mandarin",
    "Bahasa Melayu",
    "Bahasa Indonesia",
    "Japanese",
    "Thai",
    "Vietnamese",
    "Khmer",
    "Korean",
    "Arabic",
  ]);
  if (known.has(normalized)) {
    return { field: "language", value: normalized };
  }
  return null;
}
