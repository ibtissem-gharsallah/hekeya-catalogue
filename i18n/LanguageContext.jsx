import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.js";
import fr from "./fr.js";

const DICTS = { en, fr };
const STORAGE_KEY = "hekeya-lang";

// "hero.tagline1" -> DICTS[lang].hero.tagline1
const get = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);

// English unless the visitor already chose French on an earlier visit
const readSaved = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) === "fr" ? "fr" : "en";
    } catch {
        return "en";
    }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [lang, setLangState] = useState(readSaved);

    const setLang = useCallback((code) => {
        const next = code === "fr" ? "fr" : "en";
        setLangState(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode: just don't remember it */ }
    }, []);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const value = useMemo(() => {
        // t("menu.badge", { percent: 20 }) -> text in the current language (falls back to English, then to the key)
        const t = (key, vars) => {
            let text = get(DICTS[lang], key) ?? get(DICTS.en, key) ?? key;
            if (vars) text = text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
            return text;
        };

        // text that comes from Supabase: bag.fr = { description, detail, price }. Missing French -> the English value.
        const tr = (item, field) => (lang === "fr" && item?.fr?.[field]) || item?.[field];

        // swatch colour names
        const colorName = (name) => (lang === "fr" && DICTS.fr.colors?.[String(name).toLowerCase()]) || name;

        return { lang, setLang, t, tr, colorName };
    }, [lang, setLang]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useT = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useT() must be used inside <LanguageProvider> (wrap <App /> in main.jsx)");
    return ctx;
};