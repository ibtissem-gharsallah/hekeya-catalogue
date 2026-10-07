import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/* Offer ends October 31, 2026 at 23:59:59 Tunisia time (Africa/Tunis = UTC+1, no daylight saving) */
const TARGET = new Date("2026-10-31T23:59:59+01:00").getTime();

const pad = (n) => String(n).padStart(2, "0");

const getTimeLeft = () => {
    const diff = TARGET - Date.now();
    if (diff <= 0) return null;
    const total = Math.floor(diff / 1000);
    return {
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
};

/* one countdown cell: the number slides in softly every time it changes */
const Unit = ({ value, label }) => {
    const numRef = useRef(null);
    const first = useRef(true);

    useEffect(() => {
        if (first.current) { first.current = false; return; }
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        gsap.fromTo(
            numRef.current,
            { yPercent: 35, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.45, ease: "power2.out" }
        );
    }, [value]);

    return (
        <div className="offer-unit">
            <span ref={numRef} className="offer-num">{value}</span>
            <span className="offer-label">{label}</span>
        </div>
    );
};

const LaunchOffer = () => {
    const root = useRef(null);
    // undefined = not mounted yet (renders 00, so no layout shift), null = offer ended
    const [left, setLeft] = useState(undefined);

    useEffect(() => {
        setLeft(getTimeLeft());
        const id = setInterval(() => {
            const t = getTimeLeft();
            setLeft(t);
            if (!t) clearInterval(id);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    useGSAP(() => {
        const mm = gsap.matchMedia();

        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap
                .timeline({
                    defaults: { ease: "power3.out" },
                    // plays every time you scroll into the section (and again when you come back to it)
                    scrollTrigger: { trigger: root.current, start: "top 65%", toggleActions: "restart none restart reset" },
                })
                .from(".offer-eyebrow", { opacity: 0, y: 20, duration: 0.8 })
                .from(".offer-pct", { yPercent: 110, duration: 1.4, ease: "expo.out" }, "-=0.4")
                .from(".offer-off", { yPercent: 110, duration: 1.2, ease: "expo.out" }, "-=1.1")
                .from(".offer-sub", { yPercent: 110, duration: 1.2, ease: "expo.out" }, "-=0.9")
                .from(".offer-script", { opacity: 0, y: 20, duration: 1 }, "-=0.7")
                .from(".offer-copy p", { opacity: 0, y: 20, stagger: 0.12, duration: 0.9 }, "-=0.6")
                .from(".offer-count", { opacity: 0, y: 30, duration: 1 }, "-=0.6")
                .from(".offer-cta", { opacity: 0, y: 20, duration: 0.8 }, "-=0.6")
                .from(".offer-features li", { opacity: 0, y: 10, stagger: 0.1, duration: 0.8 }, "-=0.4")
                .from(".offer-yarn-main", { opacity: 0, xPercent: 12, duration: 1.6, ease: "power2.out" }, 0.2);

            // parallax: every yarn moves at its own speed while you scroll
            const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
            gsap.to(".offer-yarn-main", { y: -60, ease: "none", scrollTrigger: scrub });
            // same scroll movement as the hero leaves: right one goes down, left one goes up
            gsap.to(".offer-yarn-rose", { y: 200, ease: "none", scrollTrigger: scrub });
            gsap.to(".offer-yarn-beige", { y: -200, ease: "none", scrollTrigger: scrub });
            gsap.to(".offer-pct", { y: -14, ease: "none", scrollTrigger: scrub });

            // very slow floating on the main yarn ball
            gsap.to(".offer-yarn-main", { rotate: 1.2, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 });
        });
    }, { scope: root });

    return (
        <section id="offer" ref={root} aria-labelledby="offer-heading">
            <img src="/images/launch-yarn-rose.webp" alt="" aria-hidden="true" className="offer-yarn-rose" />
            <img src="/images/launch-yarn-beige.webp" alt="" aria-hidden="true" className="offer-yarn-beige" />

            <div className="offer-inner">
                <div className="offer-text">
                                       <h2 id="offer-heading" className="offer-title">
                        <span className="mask"><span className="offer-pct">−20%</span></span>{" "}
                        <span className="mask"><span className="offer-off">OFF</span></span>
                        <span className="mask block"><span className="offer-sub">On All Bags</span></span>
                    </h2>

                    <p className="offer-script">
                        Until the end of October.
                        <svg viewBox="0 0 340 10" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M2 7 C 90 2, 210 9, 338 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                    </p>

                    <div className="offer-copy">
                        <p>
                            To celebrate the launch of the Hekeya catalogue,
                            enjoy 20% off every bag until the end of October.
                        </p>
                        <p>Every piece is handmade to order.</p>
                    </div>

                    <div className="offer-count" role="timer" aria-label="Time left to enjoy the launch offer">
                        {left === null ? (
                            <p className="offer-ended">OFFER ENDED</p>
                        ) : (
                            <>
                                <Unit value={pad(left?.days ?? 0)} label="Days" />
                                <Unit value={pad(left?.hours ?? 0)} label="Hours" />
                                <Unit value={pad(left?.minutes ?? 0)} label="Minutes" />
                                <Unit value={pad(left?.seconds ?? 0)} label="Seconds" />
                            </>
                        )}
                    </div>


                </div>

                <div className="offer-visual">
                    <img src="/images/launch-yarn.webp" alt="A ball of black handmade yarn" className="offer-yarn-main" />
                </div>

                <div className="offer-note" aria-hidden="true">
                    <span>Same quality.<br />Better vibes.<br />−20%</span>
                    <svg viewBox="0 0 60 70" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M48 4 C 50 28, 38 48, 12 60 M12 60 l10 -1 M12 60 l4 -9" />
                    </svg>
                </div>



            </div>
        </section>
    );
};

export default LaunchOffer;