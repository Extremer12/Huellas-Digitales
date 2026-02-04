import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translation files
import translationES from "./locales/es.json";
import translationES_AR from "./locales/es-AR.json";
import translationES_MX from "./locales/es-MX.json";

const resources = {
    es: {
        translation: translationES,
    },
    "es-AR": {
        translation: translationES_AR,
    },
    "es-MX": {
        translation: translationES_MX,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "es",
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
            caches: ["localStorage", "cookie"],
        },
    });

export default i18n;
