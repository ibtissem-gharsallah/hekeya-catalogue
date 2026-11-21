import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useT } from "../../i18n/LanguageContext.jsx";

/*
  Hero, same look as before, lighter:
  - the text animation is shorter (the title is readable in about 1 s instead of 2, the paragraphs right after it)
  - no leaves / side yarn balls any more
  - nothing moves for visitors who asked for reduced motion
  - the animations only look inside the hero (scope), the arrow loads with low priority so the title and the yarn ball come first
*/

const Hero = () => {
    const { t, lang } = useT();
    const root = useRef(null);
    const firstRun = useRef(true);

    useGSAP(() => {
        const heroSplit = new SplitText(".title", {
            type: "chars, words",
        });

        // the burgundy colour of the letters: always applied, even when nothing is animated
        heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));
        if (heroSplit.chars[4]) heroSplit.chars[4].style.marginRight = "-0.21em";

        const mm = gsap.matchMedia();

        // everyone except visitors who asked for reduced motion
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(heroSplit.chars, {
                yPercent: 100,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.05,
            });

            // the yarn ball fades in while the title appears
            gsap.from(".yarn-ball", {
                opacity: 0,
                duration: 0.8,
                ease: "power1.inOut",
                delay: 0.3,
            });
        });

        return () => mm.revert();
    }, { scope: root });

    // the two text blocks are split into lines again every time the language changes
    // (they are re-created with key={lang}, so React never touches the split markup)
    useGSAP(() => {
        const paragraphSplit = new SplitText(".subtitle", {
            type: "lines",
        });

        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.from(paragraphSplit.lines, {
                opacity: 0,
                yPercent: 100,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.05,
                delay: firstRun.current ? 0.35 : 0,   // first visit: right after the title starts
            });
        });
        firstRun.current = false;

        return () => mm.revert();
    }, { dependencies: [lang], revertOnUpdate: true, scope: root });

    return (
        <section id="hero" ref={root}>
            <h1 className="title">HEKEYA</h1>

            <img
                src="/images-webp/yarn-ball.webp"
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                className="yarn-ball"
            />

            <div className="body">
                <img src="/images-webp/arrow2.webp" alt="" aria-hidden="true" decoding="async" fetchPriority="low" className="arrow h-20 w-4 shrink-0 lg:h-30 lg:w-5"/>

                <div className="content">
                    <div className="space-y-3">
                        <p className="hidden md:block"></p>
                        <p key={lang} className="subtitle text-red-800">
                            {t("hero.tagline1")} <br /> {t("hero.tagline2")}
                        </p>
                    </div>

                    <div className="view-cocktails">
                        <p key={lang} className="subtitle">
                            {t("hero.body1")}<br/> {t("hero.body2")}
                        </p>
                        <a href="#menu">{t("hero.explore")}</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;