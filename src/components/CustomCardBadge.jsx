import React from "react";
import { useT } from "../../i18n/LanguageContext.jsx";

/*
  Badge "Custom design card +5 DT". Used in the Keychains section and on the keychain product page.
  The price lives here, in ONE place. Texts: i18n  ->  keychains.custom / keychains.customNote
*/

export const CUSTOM_CARD_PRICE = 5;   // DT

const CustomCardBadge = () => {
    const { t } = useT();
    return (
        <div className="kc-badge-in inline-flex items-center gap-3 rounded-full border-2 border-dashed border-[#9B0209]/60 bg-[#fffaf6] py-2 pl-5 pr-2 text-[#9B0209] shadow-[0_0.6rem_1.2rem_-0.6rem_rgba(106,3,9,0.45)] lg:gap-[0.9vw] lg:py-[0.5vw] lg:pl-[1.6vw] lg:pr-[0.5vw]">
            <span className="text-left text-[11px] font-semibold uppercase leading-tight tracking-[0.16em] lg:text-[clamp(11px,0.85vw,15px)]">
                {t("keychains.custom")}
                <span className="block font-normal normal-case tracking-normal text-[#9B0209]/75 lg:text-[clamp(11px,0.8vw,14px)]">
                    {t("keychains.customNote", { price: CUSTOM_CARD_PRICE })}
                </span>
            </span>
            <span className="font-numerals flex size-12 shrink-0 items-center justify-center rounded-full bg-[#9B0209] text-center text-[15px] leading-none text-[#f7f2ea] lg:size-[clamp(48px,3.6vw,66px)] lg:text-[clamp(15px,1.2vw,21px)]">
                +{CUSTOM_CARD_PRICE}<span className="ml-0.5 text-[0.6em]">DT</span>
            </span>
        </div>
    );
};

export default CustomCardBadge;