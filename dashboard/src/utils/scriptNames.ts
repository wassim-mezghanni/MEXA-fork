/** Human-readable names for every ISO 15924 script tag present in the FLORES and
 *  Bible (sPBC) corpora. Used by the script-level analysis charts. */
export const SCRIPT_NAMES: Record<string, string> = {
  Arab: 'Arabic',
  Armn: 'Armenian',
  Beng: 'Bengali',
  Cans: 'Canadian Syllabics',
  Copt: 'Coptic',
  Cyrl: 'Cyrillic',
  Deva: 'Devanagari',
  Ethi: 'Ethiopic (Geʿez)',
  Geor: 'Georgian',
  Grek: 'Greek',
  Gujr: 'Gujarati',
  Guru: 'Gurmukhi (Punjabi)',
  Hang: 'Hangul (Korean)',
  Hani: 'Han (Chinese)',
  Hans: 'Han (Simplified)',
  Hant: 'Han (Traditional)',
  Hebr: 'Hebrew',
  Jpan: 'Japanese',
  Khmr: 'Khmer',
  Knda: 'Kannada',
  Laoo: 'Lao',
  Latn: 'Latin',
  Limb: 'Limbu',
  Mlym: 'Malayalam',
  Mymr: 'Myanmar (Burmese)',
  Olck: 'Ol Chiki (Santali)',
  Orya: 'Odia (Oriya)',
  Sinh: 'Sinhala',
  Syrc: 'Syriac',
  Taml: 'Tamil',
  Telu: 'Telugu',
  Tfng: 'Tifinagh (Berber)',
  Thai: 'Thai',
  Tibt: 'Tibetan',
};

export function getScriptName(code: string): string {
  return SCRIPT_NAMES[code] || code;
}

/** Coarse grouping used for consistent coloring across the script charts. */
export function scriptGroup(code: string): 'Latin' | 'Arabic' | 'Other' {
  return code === 'Latn' ? 'Latin' : code === 'Arab' ? 'Arabic' : 'Other';
}
