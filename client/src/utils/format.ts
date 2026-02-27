import i18n from 'i18next';

/**
 * Formats a number according to the current language's numbering system.
 * Specifically handles forcing Indic digits for Arabic.
 */
export function formatNumber(n: number | string): string {
    const num = typeof n === 'string' ? parseInt(n, 10) : n;
    if (isNaN(num)) return n.toString();

    if (i18n.language === 'ar-EG') {
        return new Intl.NumberFormat('ar-EG-u-nu-arab').format(num);
    }

    return num.toString();
}
