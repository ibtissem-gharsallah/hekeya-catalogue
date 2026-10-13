import React from "react";
import { useT } from "./LanguageContext.jsx";

// EN | FR toggle. Uses <span>/<button> on purpose: the nav CSS styles every <div> and <a> inside <nav>.
const LanguageSwitcher = ({ className = "" }) => {
    const { lang, setLang } = useT();

    return (
        <span className={`inline-flex items-center gap-2 text-[13px] tracking-[0.12em] ${className}`} role="group" aria-label="Language">
            {["en", "fr"].map((code, i) => (
                <React.Fragment key={code}>
                    {i > 0 && <span aria-hidden="true" className="text-black/30">|</span>}
                    <button
                        type="button"
                        onClick={() => setLang(code)}
                        aria-pressed={lang === code}
                        lang={code}
                        className={`cursor-pointer uppercase transition-colors ${
                            lang === code ? "font-semibold text-[#9B0209]" : "text-black/50 hover:text-[#9B0209]"
                        }`}
                    >
                        {code}
                    </button>
                </React.Fragment>
            ))}
        </span>
    );
};

export default LanguageSwitcher;