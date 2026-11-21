import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useT } from "../../i18n/LanguageContext.jsx";
import useHomeBanner from "../hooks/useHomeBanner.js";

/*
  Home-page banner (used for the bags AND the keychains): text on the left, a transparent-background photo on the right.
  - ONE Supabase call per banner (a table with one row, see bag-banner.sql): its own photo + texts EN/FR
  - the photo sits in a fixed-ratio box and is lazy-loaded, so the page never jumps
  - phones: text first, photo under it. Computers: side by side.
  - the title is split on its first space: first word dark, the rest burgundy  ("Nos" + "Sacs")
  - props: table (Supabase table), to (where the button goes), id (section id, so the navbar link scrolls here),
    inlineTitle (true = both words on one line, good for short titles)
    bigPhoto (true = wider and taller photo, it can even go a little past the page margin)
    splitLast (true = the title is split at its LAST space: "Le cadeau" dark + "parfait" burgundy)
    titleHeart (true = a small hand-drawn heart after the title)
    centerPhoto (true = for a tall photo: it is centred in its column, a bit smaller, never pushed to the page edge)
    trimPhoto (true = the empty transparent margins of the photo are cut off automatically, so no empty space is left around it)
  - no CSS file changes: everything is Tailwind classes
*/

const Heart = ({ className = "" }) => (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className} fill="none" stroke="#9B0209" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 31 C 8 22 6 12 13 9.5 C 17 8 19.5 10.5 20 13 C 20.5 10.5 24 8 28 9.5 C 35 12 32 22 20 31 Z" />
        <path d="M6 36 C 12 35 17 33 20 31" />
    </svg>
);

// finds the part of a transparent photo that is really drawn (ignores the empty margins around it)
const findContent = (img) => {
    try {
        const W = img.naturalWidth, H = img.naturalHeight;
        const k = Math.min(1, 500 / Math.max(W, H));                  // look at a small copy: fast
        const cw = Math.max(1, Math.round(W * k)), ch = Math.max(1, Math.round(H * k));
        const canvas = document.createElement("canvas");
        canvas.width = cw; canvas.height = ch;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, cw, ch);
        const px = ctx.getImageData(0, 0, cw, ch).data;
        let x0 = cw, y0 = ch, x1 = -1, y1 = -1;
        for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
                if (px[(y * cw + x) * 4 + 3] > 16) {
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                }
            }
        }
        if (x1 < 0) return null;
        const pad = Math.round(cw * 0.01);
        x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad);
        x1 = Math.min(cw - 1, x1 + pad); y1 = Math.min(ch - 1, y1 + pad);
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
        return { ratio: bw / bh, left: -(x0 / bw) * 100, top: -(y0 / bh) * 100, width: (cw / bw) * 100 };
    } catch {
        return null;   // the browser does not let us read the image: keep the normal box
    }
};

const HomeBanner = ({ table, to, id, inlineTitle = false, bigPhoto = false, trimPhoto = false, splitLast = false, titleHeart = false, centerPhoto = false }) => {
    const { tr } = useT();
    const { banner, loading } = useHomeBanner(table);
    const root = useRef(null);
    const [imgFailed, setImgFailed] = useState(false);
    const [crop, setCrop] = useState(null);   // where the real photo content is (trimPhoto only)

    useGSAP(
        () => {
            if (!banner) return;
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap
                    .timeline({
                        defaults: { ease: "power3.out" },
                        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
                    })
                    .fromTo(".kb-eyebrow", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 })
                    .fromTo(".kb-title-in", { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: "expo.out" }, "-=0.5")
                    .fromTo(".kb-fade", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.9 }, "-=0.8")
                    .fromTo(".kb-photo", { opacity: 0, x: 70, rotate: 4 }, { opacity: 1, x: 0, rotate: 0, duration: 1.4 }, 0.3)
                    .fromTo(".kb-thread", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" }, 0.6)
                    .fromTo(".kb-heart", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)" }, 1.8);

                // slow float on the keychains + the yarn drifts while scrolling
                gsap.to(".kb-float", { y: -10, rotate: 1, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
                gsap.to(".kb-yarn", {
                    y: 90,
                    ease: "none",
                    scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
                });
            });
        },
        { scope: root, dependencies: [banner] }
    );

    // while loading keep the section's space, so nothing below jumps when the banner appears
    if (loading) return <section id={id} aria-hidden="true" className="min-h-[560px] lg:min-h-[30vw]" />;
    if (!banner) return null;   // hidden in Supabase or error: the home page simply continues

    const title = (tr(banner, "title") || "").trim();
    const space = splitLast ? title.lastIndexOf(" ") : title.indexOf(" ");
    const first = space > 0 ? title.slice(0, space) : "";
    const rest = space > 0 ? title.slice(space + 1) : title;

    return (
        <section id={id} ref={root} aria-labelledby={`${id}-heading`} className="relative w-full overflow-hidden px-5 pb-6 pt-8 lg:h-auto! lg:px-[8vw]! lg:pb-[0.5vw]! lg:pt-[1.5vw]! 2xl:px-[8vw]!">
            {/* yarn ball cropped by the top-right corner */}
            <img src="/images-webp/hero-right-leaf.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="kb-yarn pointer-events-none absolute right-0 top-2 z-0 w-[20vw] lg:top-[-2vw] lg:w-[10vw]" />

            <div className={`relative z-10 grid items-center gap-0 lg:min-h-[28vw] lg:gap-[2vw] ${centerPhoto ? "lg:grid-cols-[1fr_1fr]" : bigPhoto ? "lg:grid-cols-[0.8fr_1.3fr]" : "lg:grid-cols-[1fr_1.1fr]"}`}>
                {/* text */}
                <div className="flex flex-col items-start">
                    <p className="kb-eyebrow text-[11px] font-medium uppercase tracking-[0.34em] text-[#9B0209] lg:text-[clamp(11px,0.85vw,15px)]">{tr(banner, "eyebrow")}</p>

                    <h2 id={`${id}-heading`} className={`font-serif mt-4 text-[17vw] leading-[0.92] tracking-[-0.02em] sm:text-8xl lg:mt-[1.2vw] lg:text-[clamp(64px,7.2vw,140px)] ${inlineTitle ? "flex flex-wrap gap-x-[0.28em]" : ""}`}>
                        {first && (
                            <span className={`overflow-hidden pb-[0.12em] -mb-[0.12em] ${inlineTitle ? "inline-block" : "block"}`}><span className="kb-title-in block text-[#161616]">{first}</span></span>
                        )}
                        <span className={`overflow-hidden pb-[0.14em] -mb-[0.14em] ${inlineTitle ? "inline-block" : "block"}`}><span className="kb-title-in block text-[#9B0209]">
                            {rest}
                            {titleHeart && <Heart className="ml-[0.18em] inline-block h-[0.5em] w-[0.5em] align-[0.1em]" />}
                        </span></span>
                    </h2>

                    {tr(banner, "subtitle") && (
                        <p className="kb-fade mt-5 max-w-[36ch] text-lg leading-snug text-black/85 lg:mt-[1.6vw] lg:max-w-[31vw] lg:text-[clamp(16px,1.6vw,28px)]">
                            {tr(banner, "subtitle")}
                            <Heart className="ml-2 inline-block size-7 align-[-0.45em] lg:size-[2.4vw] lg:min-w-7" />
                        </p>
                    )}

                    <Link
                        to={to}
                        className="kb-fade group mt-7 inline-flex items-center gap-4 rounded-full border border-[#9B0209] px-8 py-4 text-xs font-medium uppercase tracking-[0.25em] text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:mt-[2.2vw] lg:px-[2.2vw] lg:py-[1.1vw] lg:text-[clamp(11px,0.85vw,14px)]"
                    >
                        {tr(banner, "button")}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-4 transition-transform duration-300 group-hover:translate-x-1.5 lg:w-[1.1vw] lg:min-w-4">
                            <path d="M4 12h16M14 6l6 6-6 6" />
                        </svg>
                    </Link>

                </div>

                {/* photo (transparent background) + loose thread behind it */}
                <div
                    className={`relative ${centerPhoto ? "mx-auto" : "-mr-5"} ${
                        crop
                            ? `${centerPhoto ? "mx-auto [--mh:105vw] lg:[--mh:36vw]" : "ml-auto [--mh:80vw] lg:[--mh:38vw]"} w-[min(100%,calc(var(--mh)*var(--r)))]`      // trimmed photo: its own shape, height capped
                            : `w-full ${bigPhoto ? "aspect-[4/3]" : "aspect-[3/2] lg:aspect-[16/11]"}`
                    } ${centerPhoto ? "lg:mr-auto" : bigPhoto ? "lg:-mr-[4vw]" : "lg:mr-0"}`}
                    style={crop ? { aspectRatio: crop.ratio, "--r": crop.ratio } : undefined}
                >
                    <svg viewBox="0 0 800 640" preserveAspectRatio="xMidYMid meet" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
                        {/* the thread runs in from the left and disappears behind the keychains */}
                        <path className="kb-thread" d="M -60 540 C 80 450 240 410 400 440" stroke="#9B0209" strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength="1" strokeDasharray="1" />
                        {/* a small heart tied in the thread */}
                        <g className="kb-heart" transform="translate(262 396) scale(0.95)" stroke="#9B0209" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                            <path d="M20 31 C 8 22 6 12 13 9.5 C 17 8 19.5 10.5 20 13 C 20.5 10.5 24 8 28 9.5 C 35 12 32 22 20 31 Z" vectorEffect="non-scaling-stroke" />
                        </g>
                    </svg>
                    <div className="kb-photo absolute inset-0 z-10">
                        <div className="kb-float h-full w-full">
                            {banner.image && !imgFailed && (
                                <img
                                    src={banner.image}
                                    alt={title}
                                    loading="lazy"
                                    decoding="async"
                                    draggable="false"
                                    crossOrigin={trimPhoto ? "anonymous" : undefined}
                                    onLoad={trimPhoto ? (e) => {
                                        const c = findContent(e.currentTarget);
                                        if (c) { setCrop(c); requestAnimationFrame(() => ScrollTrigger.refresh()); }
                                    } : undefined}
                                    onError={() => setImgFailed(true)}
                                    className={crop ? "absolute max-w-none select-none" : "h-full w-full select-none object-contain object-right"}
                                    style={crop ? { left: `${crop.left}%`, top: `${crop.top}%`, width: `${crop.width}%`, height: "auto" } : undefined}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomeBanner;