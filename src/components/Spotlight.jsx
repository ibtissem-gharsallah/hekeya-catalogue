import React, { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import useProducts from "../hooks/useProducts.js";

const money = (n) => `${n} DT`;

const SpotlightContent = ({ bag, discount }) => {
    const { t, tr, colorName } = useT();
    const root = useRef(null);
    const firstColorRun = useRef(true);
    const [colorIndex, setColorIndex] = useState(0);

    const colors = bag.colors || [];
    const image = colors[colorIndex]?.image || bag.image;

    // prices: discount ON -> old price crossed out + new price + badge; OFF -> just the regular (old) price
    const { oldPrice, newPrice, dimensions } = bag;
    const onSale = discount?.active && oldPrice != null && newPrice != null && newPrice < oldPrice;
    const regularPrice = oldPrice ?? newPrice;

    useGSAP(
        () => {
            gsap
                .timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
                })
                .fromTo(".sp-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 })
                .fromTo(".sp-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, "-=0.5")
                .fromTo(".sp-title-in", { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: "expo.out" }, "-=0.5")
                .fromTo(".sp-bag-wrap", { opacity: 0, y: 50, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.4 }, "-=0.9")
                .fromTo(".sp-kicker", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, "-=1.1")
                .fromTo(".sp-name-in", { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: "expo.out" }, "-=0.9")
                .fromTo(".sp-fade", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.9 }, "-=0.7")
                .fromTo(".sp-swatch", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.6, ease: "back.out(2)" }, "-=0.9")
                .fromTo(".sp-thread", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" }, 0.4);

            // very slow floating on the bag
            gsap.to(".sp-bag-float", { y: -10, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });

            // the yarn ball drifts down while you scroll
            gsap.to(".sp-yarn", {
                y: 120,
                ease: "none",
                scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
            });
        },
        { scope: root }
    );

    // same slide-in as the Menu photo, replayed when a swatch is clicked
    useGSAP(
        () => {
            if (firstColorRun.current) { firstColorRun.current = false; return; }
            gsap.fromTo(
                ".sp-bag-img",
                { opacity: 0, xPercent: -10 },
                { opacity: 1, xPercent: 0, duration: 0.8, ease: "power2.out", overwrite: "auto" }
            );
        },
        { dependencies: [colorIndex], scope: root }
    );

    return (
        <section id="spotlight" ref={root} aria-labelledby="spotlight-heading">
            <img src="/images-webp/hero-right-leaf.webp" alt="" aria-hidden="true" className="sp-yarn" />

            <header className="sp-head">
                <p className="sp-eyebrow">{t("spotlight.eyebrow")}</p>
                <span className="sp-rule" aria-hidden="true" />
                <h2 id="spotlight-heading" className="sp-title">
                    <span className="sp-mask"><span className="sp-title-in block">{t("spotlight.title")}</span></span>
                </h2>
            </header>

            <div className="sp-grid">
                <div className="sp-bag">
                    <div className="sp-bag-wrap">
                        <div className="sp-bag-float">
                            {/* key = a new <img> per photo, so the previous colour never lingers while the next one loads */}
                            <img key={image} className="sp-bag-img" src={image} alt={t("spotlight.bagAlt", { name: bag.name })} />
                        </div>
                    </div>
                </div>

                <div className="sp-text">
                    <p className="sp-kicker">{t("spotlight.kicker", { name: bag.name })}</p>
                    <h3 className="sp-name">
                        <span className="sp-mask"><span className="sp-name-in block">{bag.name}</span></span>
                    </h3>

                    {(onSale || regularPrice != null) && (
                        <div className="sp-price sp-fade">
                            {onSale ? (
                                <>
                                    <span className="price-old">{money(oldPrice)}</span>
                                    <span className="price-new">{money(newPrice)}</span>
                                    <span className="price-badge">{t("menu.badge", { percent: discount.percent })}</span>
                                </>
                            ) : (
                                <span className="price-new">{money(regularPrice)}</span>
                            )}
                        </div>
                    )}

                    {tr(bag, "description") && <p className="sp-desc sp-fade">{tr(bag, "description")}</p>}

                    {(dimensions?.height || dimensions?.width) && (
                        <p className="sp-meta sp-fade">
                            {dimensions.height && <span>{t("menu.height")} {dimensions.height}</span>}
                            {dimensions.height && dimensions.width && <span aria-hidden="true"> · </span>}
                            {dimensions.width && <span>{t("menu.width")} {dimensions.width}</span>}
                        </p>
                    )}

                    {colors.length > 1 && (
                        <div className="sp-swatches" role="group" aria-label={t("menu.colours")}>
                            {colors.map((color, i) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    aria-label={colorName(color.name)}
                                    aria-pressed={i === colorIndex}
                                    onClick={() => setColorIndex(i)}
                                    style={{ backgroundColor: color.hex }}
                                    className={`sp-swatch ${i === colorIndex ? "is-active" : ""}`}
                                />
                            ))}
                        </div>
                    )}

                    <a href="#menu" className="sp-cta sp-fade">
                        {t("spotlight.meet", { name: bag.name })}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 12h16M14 6l6 6-6 6" />
                        </svg>
                    </a>

                    <p className="sp-tagline sp-fade">{t("spotlight.tagline")}</p>
                </div>
            </div>

            {/* loose red thread along the bottom (draws itself in) */}
            <div className="sp-wave" aria-hidden="true">
                <svg viewBox="0 0 1600 140" preserveAspectRatio="none" fill="none">
                    <path
                        className="sp-thread"
                        d="M -20 14 C 220 22, 420 104, 720 112 C 1000 120, 1240 84, 1420 62 C 1500 52, 1570 44, 1640 38"
                        stroke="#9B0209"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        pathLength="1"
                        strokeDasharray="1"
                    />
                </svg>
            </div>
        </section>
    );
};

// the newest bag comes from Supabase (the one with the most recent featured_at); nothing renders if there is none
const Spotlight = () => {
    const { featured, discount, loading } = useProducts();
    if (loading || !featured) return null;
    return <SpotlightContent bag={featured} discount={discount} />;
};

export default Spotlight;