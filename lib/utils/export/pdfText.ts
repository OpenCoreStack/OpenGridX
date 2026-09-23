/**
 * jsPDF's built-in fonts (Helvetica & co.) use WinAnsiEncoding. When a string contains a single
 * character outside it, jsPDF switches the whole string to 16-bit output drawn with the WinAnsi
 * font, so the entire cell comes out garbled, not just that character. `toWinAnsi` keeps every
 * character the font can draw, maps look-alikes (special spaces, dashes, minus) to ASCII and
 * replaces the rest with '?', so only the undrawable characters are lost.
 */

/** Characters above U+00FF that WinAnsiEncoding (Windows-1252) still contains. */
const WIN_ANSI_EXTRA = new Set<number>([
    0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160, 0x2039, 0x0152,
    0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014, 0x02dc, 0x2122, 0x0161, 0x203a,
    0x0153, 0x017e, 0x0178,
]);

function substitute(codePoint: number): string | null {
    // En quad … hair space, narrow no-break space (fr-FR thousands separator), math space, ideographic space
    if ((codePoint >= 0x2000 && codePoint <= 0x200a) || codePoint === 0x202f || codePoint === 0x205f || codePoint === 0x3000) return ' ';
    // Zero-width space / joiners, word joiner, BOM
    if ((codePoint >= 0x200b && codePoint <= 0x200d) || codePoint === 0x2060 || codePoint === 0xfeff) return '';
    // Hyphen, non-breaking hyphen, figure dash, minus sign (used for negatives by some locales)
    if (codePoint === 0x2010 || codePoint === 0x2011 || codePoint === 0x2012 || codePoint === 0x2212) return '-';
    return null;
}

export interface WinAnsiText {
    text: string;
    /** True when a character had to be replaced with '?'. */
    lossy: boolean;
}

export function toWinAnsi(input: string): WinAnsiText {
    let text = '';
    let lossy = false;
    for (const char of input) {
        const codePoint = char.codePointAt(0) ?? 0;
        if (codePoint <= 0xff || WIN_ANSI_EXTRA.has(codePoint)) {
            text += char;
            continue;
        }
        const replacement = substitute(codePoint);
        if (replacement !== null) {
            text += replacement;
        } else {
            text += '?';
            lossy = true;
        }
    }
    return { text, lossy };
}
