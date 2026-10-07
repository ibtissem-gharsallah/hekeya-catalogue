import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/*
  "Want a catalogue like this?" call-to-action section.
  The button links to the section with id="contact".
  Everything is styled with Tailwind classes right here — no CSS file changes needed.
  Needs: /images/yarn-ball-cta.webp   (font-numerals is the Abril Fatface token already in your index.css)
*/
const CatalogueCta = () => {
    const root = useRef(null);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("all", () => {   // "all" = always run, even if the phone has Reduce Motion on
                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: root.current, start: "top 65%", toggleActions: "restart none restart reset" },
                });

                tl.from(".cta-eyebrow", { opacity: 0, y: 16, duration: 0.8 })
                    .from(".cta-rule", { scaleX: 0, duration: 0.8 }, "-=0.5")
                    .from(".cta-line", { yPercent: 110, duration: 1.2, stagger: 0.12, ease: "expo.out" }, "-=0.5")
                    .from(".cta-sub", { opacity: 0, y: 20, duration: 0.9 }, "-=0.7")
                    .from(".cta-btn", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
                    .from(".cta-tags", { opacity: 0, y: 12, duration: 0.8 }, "-=0.5")
                    // the thread is "pulled" across from the left, then the ball rolls in
                    .fromTo(".cta-thread", { clipPath: "inset(-20% 100% -20% 0)" }, { clipPath: "inset(-20% 0% -20% 0)", duration: 2, ease: "power2.inOut" }, 0.3)
                    .from(".cta-ball", { xPercent: 35, rotate: -80, opacity: 0, duration: 1.6, ease: "power3.out" }, 0.6);

                // very slow float on the thread, and a light scroll parallax on the ball
                gsap.to(".cta-thread-float", { y: 8, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
                gsap.fromTo(
                    ".cta-ball-par",
                    { y: 40 },
                    { y: -40, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } }
                );
            });
        },
        { scope: root }
    );

    return (
        <section
            id="catalogue-cta"
            ref={root}
            aria-labelledby="cta-heading"
            className="relative w-full overflow-hidden px-5 pt-20 pb-6 lg:px-0 lg:pt-[7vw] lg:pb-0 lg:min-h-[50vw]"
        >
            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center lg:max-w-none">
                <p className="cta-eyebrow text-[11px] uppercase tracking-[0.32em] text-[#9B0209] lg:text-[clamp(11px,0.95vw,16px)]">
                    Like what you see?
                </p>
                <span className="cta-rule mt-5 block h-px w-12 bg-[#9B0209] lg:mt-[1.6vw] lg:w-[3.4vw]" />

                <h2
                    id="cta-heading"
                    className="font-numerals mt-8 text-[#9B0209] leading-[0.98] tracking-[-0.01em] text-[13vw] sm:text-7xl lg:mt-[2.4vw] lg:text-[6.4vw]"
                >
                    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                        <span className="cta-line block">Want a catalogue</span>
                    </span>
                    <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                        <span className="cta-line block">like this?</span>
                    </span>
                </h2>

                <p className="cta-sub font-serif mt-6 text-[#9B0209] text-[7vw] leading-tight sm:text-4xl lg:mt-[1.8vw] lg:text-[2.7vw]">
                    Let’s make yours.
                </p>

                <a
                    href="#contact"
                    className="cta-btn group mt-9 inline-flex items-center gap-4 rounded-full border border-[#9B0209] px-9 py-4 text-sm uppercase tracking-[0.24em] text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:mt-[2.8vw] lg:gap-[1.2vw] lg:px-[3vw] lg:py-[1.25vw] lg:text-[clamp(12px,0.95vw,16px)]"
                >
                    Contact me
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">
                        <path d="M4 12h16M14 6l6 6-6 6" />
                    </svg>
                </a>

                <p className="cta-tags mt-7 text-[13px] text-black/70 lg:mt-[1.8vw] lg:text-[clamp(12px,1vw,17px)]">
                    Web design <span className="mx-1">·</span> Interactive catalogues <span className="mx-1">·</span> E-commerce
                </p>
            </div>

            {/* thread + ball */}
            <div className="relative z-0 -mx-5 mt-10 h-[44vw] lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:h-[19.5vw] pointer-events-none" aria-hidden="true">
                <div className="cta-thread-float absolute inset-0">
                    <div className="cta-thread absolute inset-0">
                        <svg viewBox="0 0 1536 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
                            {/* twisted rope: dark base, light twist marks on top */}
                            <path
                                d="M -20 35 C 120 45, 220 130, 360 190 C 470 235, 560 250, 700 240 C 820 232, 880 282, 1000 280 C 1120 278, 1220 200, 1330 200 C 1400 200, 1440 205, 1490 205"
                                stroke="#a4192b"
                                strokeWidth="6"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                            />
                            <path
                                d="M -20 35 C 120 45, 220 130, 360 190 C 470 235, 560 250, 700 240 C 820 232, 880 282, 1000 280 C 1120 278, 1220 200, 1330 200 C 1400 200, 1440 205, 1490 205"
                                stroke="#e0606f"
                                strokeWidth="3"
                                strokeDasharray="2 5"
                                strokeLinecap="butt"
                                vectorEffect="non-scaling-stroke"
                                opacity="0.55"
                            />
                        </svg>
                    </div>
                </div>

                <div className="cta-ball-par absolute -right-[16vw] -bottom-[3vw] w-[40vw] lg:-right-[9vw] lg:bottom-[1vw] lg:w-[22vw]">
                    <img src="/images/yarn-ball-cta.webp" alt="" className="cta-ball block w-full h-auto" style={{ filter: "saturate(0.8) brightness(0.96)" }} />
                </div>
            </div>
        </section>
    );
};

export default CatalogueCta;