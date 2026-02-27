import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import arEG from './locales/ar-EG.json';
import fr from './locales/fr.json';

const resources = {
    en: {
        translation: en
    },
    "ar-EG": {
        translation: arEG
    },
    fr: {
        translation: fr
    }
};

const savedLng = typeof window !== 'undefined' ? localStorage.getItem('senet_lang') : 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLng || "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
            format: (value, _format, lng) => {
                if (typeof value === 'number' && lng === 'ar-EG') {
                    return new Intl.NumberFormat('ar-EG-u-nu-arab').format(value);
                }
                return value;
            }
        }
    });

i18n.on('languageChanged', (lng) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('senet_lang', lng);
    }
});

export default i18n;
