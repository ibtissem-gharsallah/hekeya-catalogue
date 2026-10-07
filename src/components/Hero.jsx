import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";

const Hero = () => {
    useGSAP(() => {
        const heroSplit = new SplitText(".title", {
            type: "chars, words",
        });

        const paragraphSplit = new SplitText(".subtitle", {
            type: "lines",
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

        gsap.from(paragraphSplit.lines, {
            opacity: 0,
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06,
            delay: 1,
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
                        <p className="subtitle text-red-800">
                            Made To Be Carried <br /> Made To Be Yours
                        </p>
                    </div>

                    <div className="view-cocktails">
                        <p className="subtitle">
                            Crafted slowly, with simple materials, careful details,<br/> and a little bit of personality
                            because your bag shouldn't feel like everyone else's.
                        </p>
                        <a href="#menu">Explore Bags</a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;