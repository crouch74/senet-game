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

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
