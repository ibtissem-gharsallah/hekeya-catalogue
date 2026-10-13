import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useT } from "../../i18n/LanguageContext.jsx";

const Hero = () => {
    const { t, lang } = useT();
    const firstRun = useRef(true);

    useGSAP(() => {
        const heroSplit = new SplitText(".title", {
            type: "chars, words",
        });

        // Apply text-gradient class once before animating
        heroSplit.chars.forEach((char) => char.classList.add("text-gradient"));
        heroSplit.chars[4].style.marginRight = "-0.21em";
        gsap.from(heroSplit.chars, {
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06,
        });

        // ADDED: yarn ball fades in after the title has appeared
        gsap.from(".yarn-ball", {
            opacity: 0,
            duration: 1.5,
            ease: "power1.inOut",
            delay: 1.4,
        });

        gsap
            .timeline({
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            })
            .to(".right-leaf", { y: 200 }, 0)
            .to(".left-leaf", { y: -200 }, 0)
            .to(".arrow", { y: 100 }, 0);
    }, []);

    // the two text blocks are split into lines again every time the language changes
    // (they are re-created with key={lang}, so React never touches the split markup)
    useGSAP(() => {
        const paragraphSplit = new SplitText(".subtitle", {
            type: "lines",
        });

        gsap.from(paragraphSplit.lines, {
            opacity: 0,
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06,
            delay: firstRun.current ? 1 : 0,
        });
        firstRun.current = false;
    }, { dependencies: [lang], revertOnUpdate: true });

    return (
        <section id="hero">
            <h1 className="title">HEKEYA</h1>

            <img
                src="/images-webp/hero-left-leaf.webp"
                alt="left-leaf"
                className="left-leaf"
            />
            <img
                src="/images-webp/hero-right-leaf.webp"
                alt="right-leaf"
                className="right-leaf"
            />

            <img
                src="/images-webp/yarn-ball.webp"
                alt="yarn ball"
                className="yarn-ball"
            />

            <div className="body">
                <img src="/images-webp/arrow2.webp" alt="arrow" className="arrow h-20 w-4 shrink-0 md:h-30 md:w-5"/>

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