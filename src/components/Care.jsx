import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";

/*
  "Hekeya Care" — after-sale care section.
  Text lives in i18n/en.js and i18n/fr.js  ->  care.*
  Uses images you already have: /images/yarn-left.webp, /images/yarn-right.webp
  The button links to the section with id="contact".
*/

const Check = () => (
    <svg viewBox="0 0 24 24" className="mt-[3px] h-[18px] w-[18px] shrink-0 lg:h-[1.3vw] lg:w-[1.3vw] lg:min-h-[16px] lg:min-w-[16px]" fill="none" stroke="#9B0209" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12.5l5 5L20 6.5" />
    </svg>
);

const Cross = () => (
    <svg viewBox="0 0 24 24" className="mt-[3px] h-[18px] w-[18px] shrink-0 lg:h-[1.3vw] lg:w-[1.3vw] lg:min-h-[16px] lg:min-w-[16px]" fill="none" stroke="#9B0209" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const Care = () => {
    const { t } = useT();
    const root = useRef(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: { trigger: root.current, start: "top 70%", toggleActions: "play none none none" },
            });
            tl.from(".care-bow", { opacity: 0, y: 14, duration: 0.7 })
                .from(".care-title", { opacity: 0, y: 24, duration: 0.9 }, "-=0.4")
                .from(".care-intro", { opacity: 0, y: 20, duration: 0.8, stagger: 0.12 }, "-=0.5")
                .from(".care-pill", { opacity: 0, y: 20, scale: 0.97, duration: 0.8 }, "-=0.4")
                .from(".care-col", { opacity: 0, y: 24, duration: 0.8, stagger: 0.15 }, "-=0.4")
                .from(".care-btn", { opacity: 0, y: 20, duration: 0.7 }, "-=0.4");

            gsap.to(".care-yarn", { y: 10, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
        },
        { scope: root }
    );

    const covered = t("care.covered.items");
    const notCovered = t("care.notCovered.items");

    return (
        <section
            id="care"
            ref={root}
            aria-labelledby="care-heading"
            className="relative w-full overflow-hidden px-5 py-20 lg:px-0 lg:py-[6vw]"
        >
            {/* decorative yarn, hidden on small screens so text never overlaps */}
            <img src="/images/yarn-left.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"
                 className="care-yarn pointer-events-none absolute -left-[22vw] top-4 hidden w-[28vw] opacity-90 md:block lg:-left-[8vw] lg:top-[3vw] lg:w-[20vw]" />
            <img src="/images/yarn-right.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"
                 className="care-yarn pointer-events-none absolute -right-[22vw] bottom-4 hidden w-[28vw] opacity-90 md:block lg:-right-[8vw] lg:bottom-[3vw] lg:w-[20vw]" />

            <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center lg:max-w-[62vw]">
                {/* little bow */}
                <svg className="care-bow h-8 w-16 text-[#9B0209] lg:h-[2.6vw] lg:w-[5.2vw]" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M32 14c-6-9-18-12-24-6s0 14 10 12c6-1 11-4 14-6zM32 14c6-9 18-12 24-6s0 14-10 12c-6-1-11-4-14-6z" />
                    <path d="M32 14l-8 14M32 14l8 14" />
                </svg>

                <h2 id="care-heading" className="care-title font-serif mt-4 text-[#9B0209] text-5xl leading-tight sm:text-6xl lg:mt-[1vw] lg:text-[5vw]">
                    {t("care.title")} <span aria-hidden="true">♡</span>
                </h2>

                <p className="care-intro mt-5 max-w-xl text-[16px] leading-relaxed text-[#6b0a14] sm:text-lg lg:mt-[1.6vw] lg:max-w-none lg:text-[clamp(16px,1.45vw,26px)]">
                    {t("care.intro1")}
                </p>
                <p className="care-intro mt-4 max-w-xl text-[15px] leading-relaxed text-[#6b0a14] sm:text-[17px] lg:mt-[1.2vw] lg:max-w-none lg:text-[clamp(15px,1.4vw,25px)]">
                    {t("care.intro2")}
                </p>

                <p className="care-pill font-serif italic mt-8 w-full max-w-md rounded-full bg-[#f1c9c6] px-8 py-5 text-[17px] leading-snug text-[#9B0209] sm:text-xl lg:mt-[2.4vw] lg:max-w-[46vw] lg:px-[3vw] lg:py-[1.5vw] lg:text-[clamp(18px,1.9vw,34px)]">
                    {t("care.pill")}
                </p>
                <a
                    href="#contact"
                    className="care-btn mt-12 flex w-full max-w-sm flex-col items-center rounded-full bg-[#7a0a1c] px-8 py-4 text-[#f7f2ea] transition-colors duration-300 hover:bg-[#9B0209] lg:mt-[4vw] lg:max-w-[26vw] lg:px-[2vw] lg:py-[1.2vw]"
                >
                    <span className="font-serif text-xl lg:text-[clamp(18px,1.7vw,30px)]">{t("care.btnTitle")}</span>
                    <span className="mt-1 text-[13px] lg:text-[clamp(12px,1vw,18px)]">{t("care.btnSub")}</span>
                </a>
            </div>
        </section>
    );
};

export default Care;