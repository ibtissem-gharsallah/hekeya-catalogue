import React, { useId, useState } from "react";
import { useT } from "../../i18n/LanguageContext.jsx";

/*
  "Custom design card" option for the keychains: a switch (same look as the "Perfect gift" page).
  Used in the Keychains section and on the keychain product page. The price lives here, in ONE place.
  The option is hidden in a dropdown (closed by default); opening it shows the switch card.
  Props: checked (true / false) and onChange(newValue), the page keeps the state and adds the fee to the price.
  Texts: i18n  ->  keychains.customTitle / keychains.customText
*/

export const CUSTOM_CARD_PRICE = 5;   // DT

const CustomCardBadge = ({ checked, onChange, className = "" }) => {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const panelId = useId();

    return (
        <div className={`w-full max-w-xl lg:max-w-[34vw] ${className}`}>
            {/* the dropdown header (always visible) */}
            <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#9B0209]/30 bg-white/40 px-4 py-3 text-left transition-colors duration-300 hover:border-[#9B0209] lg:px-[1.2vw] lg:py-[0.8vw]"
            >
                <span className="flex items-center gap-2 text-[15px] font-medium text-[#9B0209] lg:gap-[0.5vw] lg:text-[clamp(14px,1.1vw,19px)]">
                    {t("keychains.customTitle", { fee: `${CUSTOM_CARD_PRICE} DT` })}
                    {checked && <span className="size-2 rounded-full bg-[#9B0209] lg:size-[0.5vw] lg:min-w-2" aria-hidden="true" />}
                </span>
                <svg viewBox="0 0 24 24" className={`size-5 shrink-0 text-[#9B0209] transition-transform duration-300 lg:size-[1.4vw] lg:min-w-4 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* the panel: closed by default, opens smoothly */}
            <div
                id={panelId}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
                <div className="overflow-hidden">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={checked}
                        onClick={() => onChange(!checked)}
                        className={`mt-3 flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-300 lg:mt-[0.7vw] lg:gap-[1vw] lg:px-[1.2vw] lg:py-[0.9vw] ${
                            checked ? "border-[#9B0209] bg-[#9B0209]/10" : "border-[#9B0209]/30 bg-white/40 hover:border-[#9B0209]"
                        }`}
                    >
                        <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 lg:h-[clamp(24px,1.9vw,32px)] lg:w-[clamp(42px,3.3vw,56px)] ${checked ? "bg-[#9B0209]" : "bg-black/25"}`} aria-hidden="true">
                            <span className={`absolute left-1 top-1 size-5 rounded-full bg-[#f7f2ea] shadow transition-transform duration-300 lg:size-[clamp(16px,1.3vw,22px)] ${checked ? "translate-x-5 lg:translate-x-[clamp(18px,1.4vw,24px)]" : ""}`} />
                        </span>
                        <span className="flex-1">
                            <span className="block text-[15px] font-medium text-[#9B0209] lg:text-[clamp(14px,1.1vw,19px)]">{t("keychains.customTitle", { fee: `${CUSTOM_CARD_PRICE} DT` })}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-black/70 lg:text-[clamp(12px,0.9vw,15px)]">{t("keychains.customText")}</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomCardBadge;