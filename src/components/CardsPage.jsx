import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import useCardsProduct from "../hooks/useCardsProduct.js";
import OrderSheet from "./OrderSheet.jsx";
import { CONTACT_EMAIL } from "../../constants/contact.js";

/*
  "Perfect gift" page (/cards): couples' custom playing cards.
  - everything comes from Supabase (cards_product, cards_variants)
  - 9 / 18 / 27 / 36 cards: the sizes only change the price and the text; the photos are the same for all sizes (cards_product):
    1 simple photo, 2 the box (turns), 3 a card (front/back), 4 simple photo
  - the BOX photo turns: left / right / back, with a flip animation
  - a card photo with a back photo flips when tapped
  - custom design = + design_fee DT (texts are always free to personalise)
  - text lives in i18n/en.js and fr.js  ->  cards.*
*/

const money = (n) => `${n} DT`;

const FACES = ["front", "left", "right", "back"];
// how the photo turns to reach a side: [axis, direction] (left / right / back turn sideways)
const MOVES = { left: ["Y", 1], right: ["Y", -1], back: ["Y", 1] };
const flipTo = (from, to) => {
    if (to !== "front") return MOVES[to];
    const m = MOVES[from] || MOVES.back;       // coming back to the front = the opposite turn
    return [m[0], -m[1]];
};

const ArrowIcon = ({ dir = "right", className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d={dir === "left" ? "M20 12H4M10 6l-6 6 6 6" : "M4 12h16M14 6l6 6-6 6"} />
    </svg>
);

const FaceIcon = ({ face, className = "" }) => {
    const d = {
        front: "M5 5h14v14H5z",
        back: "M5 5h14v14H5zM9 9l6 6M15 9l-6 6",
        left: "M20 12H5M11 6l-6 6 6 6",
        right: "M4 12h15M13 6l6 6-6 6",
    }[face];
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}><path d={d} /></svg>;
};

const CubeIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
);

const FlipIcon = ({ className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
    </svg>
);

/*
  The photo that FLIPS. When `src` changes, the photo turns around one axis (Y = left/right, X = up/down)
  and the new photo appears on its other side. Two faces + backface-visibility = no tricks, smooth on phones.
*/
const FlipStage = ({ src, alt, axis = "Y", sign = 1, enterDir = 1 }) => {
    const [shown, setShown] = useState(src);
    const [incoming, setIncoming] = useState(null);
    const outer = useRef(null);
    const wrap = useRef(null);
    const back = useRef(null);
    const busy = useRef(false);

    // entrance of a new slide
    useGSAP(() => {
        gsap.fromTo(outer.current, { opacity: 0, xPercent: enterDir * 10 }, { opacity: 1, xPercent: 0, duration: 0.7, ease: "power3.out", clearProps: "transform" });
    }, { scope: outer });

    // 1) src changed -> load it, then show it on the hidden face
    useEffect(() => {
        if (!src || src === shown || busy.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(src); return; }
        busy.current = true;
        const img = new Image();
        img.src = src;
        const go = () => setIncoming(src);
        (img.decode ? img.decode() : Promise.resolve()).then(go, go);
    }, [src, shown]);

    // 2) the other face is ready -> turn
    useEffect(() => {
        if (!incoming) return;
        const prop = axis === "X" ? "rotationX" : "rotationY";
        gsap.set(back.current, { rotationX: 0, rotationY: 0 });
        gsap.set(back.current, { [prop]: 180 });
        gsap.timeline({
            onComplete: () => {
                flushSync(() => { setShown(incoming); setIncoming(null); });   // same frame: no flash
                gsap.set(wrap.current, { rotationX: 0, rotationY: 0, scale: 1 });
                busy.current = false;
            },
        })
            .to(wrap.current, { [prop]: 180 * sign, duration: 0.95, ease: "power3.inOut" }, 0)
            .to(wrap.current, { scale: 1.07, duration: 0.475, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [incoming]);

    useEffect(() => () => { gsap.killTweensOf([wrap.current, back.current]); }, []);

    const face = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" };
    const imgClass = "h-full w-full object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.18)]";

    return (
        <div ref={outer} className="h-full w-full" style={{ perspective: 1400 }}>
            <div ref={wrap} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute inset-0" style={face}>
                    {shown && <img src={shown} alt={alt} fetchPriority="high" decoding="async" draggable="false" className={imgClass} />}
                </div>
                <div ref={back} className="absolute inset-0" style={face} aria-hidden="true">
                    {incoming && <img src={incoming} alt="" decoding="async" draggable="false" className={imgClass} />}
                </div>
            </div>
        </div>
    );
};

/* a dropdown, closed by default (the height animates with CSS: no JS needed) */
const Drop = ({ title, accent = false, children }) => {
    const [open, setOpen] = useState(false);
    const id = useId();
    return (
        <div className={`rounded-2xl border transition-colors duration-300 ${accent ? "border-[#9B0209]/25 bg-white/50" : "border-black/10 bg-white/30"} ${open ? "shadow-sm" : ""}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls={id}
                className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-left lg:px-[1.2vw] lg:py-[0.9vw]"
            >
                <span className={`text-[11px] font-semibold uppercase tracking-[0.2em] lg:text-[clamp(10px,0.8vw,13px)] ${accent ? "text-[#9B0209]" : "text-black/65"}`}>{title}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke={accent ? "#9B0209" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                     className={`size-4 shrink-0 text-black/60 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>
            <div id={id} role="region" className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`} inert={!open ? "" : undefined}>
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 lg:px-[1.2vw] lg:pb-[1vw]">{children}</div>
                </div>
            </div>
        </div>
    );
};

const CardsView = ({ product, variants }) => {
    const { t, tr } = useT();
    const root = useRef(null);
    const drag = useRef(null);
    const dir = useRef(1);
    const [vi, setVi] = useState(() => Math.min(1, variants.length - 1));   // opens on the 2nd size (18)
    const [si, setSi] = useState(0);            // slide: 1 simple photo, 2 box, 3 card
    const [face, setFace] = useState("front");  // side of the box
    const [turn, setTurn] = useState(["Y", 1]);
    const [flipped, setFlipped] = useState(false);
    const [custom, setCustom] = useState(false);
    const [orderOpen, setOrderOpen] = useState(false);

    const variant = variants[vi];
    const name = tr(product, "name");
    const tagline = tr(product, "tagline");
    const fee = product.designFee;

    // the 4 slides (the same for every size): 1) a simple photo  2) the box (turns: front / left / right / back)
    // 3) a card (front / back)  4) a simple photo
    const ph = product.photos;
    const slides = useMemo(() => {
        const s = [];
        if (ph.main) s.push({ id: "main", type: "photo", src: ph.main });
        if (ph.box.front) s.push({ id: "box", type: "box" });
        if (ph.card.front) s.push({ id: "card", type: "photo", src: ph.card.front, back: ph.card.back });
        if (ph.extra) s.push({ id: "extra", type: "photo", src: ph.extra });
        return s;
    }, [ph]);
    const slide = slides[Math.min(si, slides.length - 1)];
    const boxFaces = FACES.filter((f) => ph.box[f]);

    const photoAlt = (p) => t(p.back ? "cards.cardAlt" : "cards.photoAlt", { name });
    const stageSrc = !slide ? "" : slide.type === "box" ? ph.box[face] : flipped && slide.back ? slide.back : slide.src;
    const stageAlt = !slide ? name : slide.type === "box" ? t("cards.boxAlt", { name, face: t(`cards.face.${face}`) }) : photoAlt(slide);
    const canFlip = slide?.type === "photo" && !!slide.back;

    const price = variant.price + (custom ? fee : 0);

    // ---- actions ----
    const pickVariant = (i) => {
        if (i === vi) return;
        setVi(i);        // only the price and the text change: the photos stay as they are
    };
    const goSlide = (i) => {
        const next = (i + slides.length) % slides.length;
        if (next === si) return;
        dir.current = i > si ? 1 : -1;
        setSi(next);
        setFace("front");
        setFlipped(false);
    };
    const goFace = (f) => {
        if (f === face) return;
        setTurn(flipTo(face, f));
        setFace(f);
    };
    const flipCard = () => {
        setTurn(["Y", 1]);
        setFlipped((v) => !v);
    };

    // swipe = change slide, tap = flip the card
    const onPointerDown = (e) => { drag.current = e.target.closest("button") ? null : { x: e.clientX, y: e.clientY }; };
    const onPointerUp = (e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current = null;
        if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) goSlide(si + (dx < 0 ? 1 : -1));
        else if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && canFlip) flipCard();
    };
    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); goSlide(si + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); goSlide(si - 1); }
        if ((e.key === "Enter" || e.key === " ") && canFlip) { e.preventDefault(); flipCard(); }
    };

    // ---- the order message ----
    const photoUrl = `${window.location.origin}/cards`;
    const message = [
        t("order.msg.hello"),
        t("order.msg.intro"),
        "",
        `• ${t("cards.msg.product", { name })}`,
        `• ${t("cards.msg.count", { n: variant.count })}`,
        `• ${t("cards.msg.design", { answer: custom ? t("cards.msg.yes", { fee: money(fee) }) : t("cards.msg.no") })}`,
        `• ${t("cards.msg.total", { price: money(price) })}`,
        `• ${t("cards.msg.jokers")}`,
        `• ${t("cards.msg.backText")}`,
        `• ${t(product.leadDays === 1 ? "cards.readyOne" : "cards.ready", { days: product.leadDays })}`,
        `• ${t("order.msg.link", { url: photoUrl })}`,
        "",
        t("cards.msg.photos"),
        t("order.msg.thanks"),
    ].join("\n");
    const emailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("cards.orderSubject", { name }))}&body=${encodeURIComponent(message)}`;

    useEffect(() => {
        document.title = `${name} · Hekeya`;
        return () => { document.title = "Hekeya"; };
    }, [name]);

    // load every photo in the background, so flipping never shows a blank
    useEffect(() => {
        const urls = [ph.main, ph.extra, ph.card.front, ph.card.back, ...Object.values(ph.box)].filter(Boolean);
        const load = () => urls.forEach((u) => { const img = new Image(); img.decoding = "async"; img.src = u; });
        const id = "requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 4000 }) : setTimeout(load, 1500);
        return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id));
    }, [ph]);

    // entrance + floating
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                gsap
                    .timeline({ defaults: { ease: "power3.out" } })
                    .from(".cp-bgname span", { opacity: 0, y: 60, scale: 0.92, duration: 1.2 }, 0.1)
                    .from(".cp-float", { opacity: 0, x: 80, rotate: 4, scale: 0.94, duration: 1.3 }, 0.15)
                    .from(".cp-eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.3)
                    .from(".cp-name-in", { yPercent: 110, duration: 1.2, ease: "expo.out" }, 0.4)
                    .from(".cp-fade", { opacity: 0, y: 20, stagger: 0.09, duration: 0.8 }, 0.8)
                    .from(".cp-pill", { scale: 0.8, opacity: 0, stagger: 0.08, duration: 0.5, ease: "back.out(2)" }, 1.0);
                gsap.to(".cp-bob", { y: -10, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
                gsap.to(".cp-yarn-a", { y: 120, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
                gsap.to(".cp-yarn-b", { y: -120, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
                // the "ready in 2 days" badge breathes
                gsap.to(".cp-ready-dot", { scale: 1.6, opacity: 0.35, duration: 1.1, ease: "sine.inOut", yoyo: true, repeat: -1 });
            });
            return () => mm.revert();
        },
        { scope: root }
    );

    // the price and the text change with the size
    useGSAP(
        () => {
            gsap.fromTo(".cp-price", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        },
        { dependencies: [vi, custom], scope: root }
    );
    useGSAP(
        () => {
            gsap.fromTo(".cp-desc", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        },
        { dependencies: [vi], scope: root }
    );

    const lead = t(product.leadDays === 1 ? "cards.readyOne" : "cards.ready", { days: product.leadDays });
    const chosen = ["choose1", "choose2", "choose3", "choose4"];

    return (
        <section id="cards-page" ref={root} className="relative w-full overflow-hidden px-5 pb-20 pt-24 lg:px-[7vw] lg:pb-[6vw] lg:pt-[6.5vw]">
            <img src="/images/yarn-left.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="cp-yarn-a pointer-events-none absolute left-0 top-[40%] z-0 w-[8vw] lg:top-[20vw] lg:h-[16vw] lg:w-auto" />
            <img src="/images/yarn-right.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="cp-yarn-b pointer-events-none absolute right-0 top-[18vw] z-0 hidden h-[15vw] w-auto lg:block" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-[5vw]">
                {/* ---------- photos ---------- */}
                <div>
                    <div
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerCancel={() => { drag.current = null; }}
                        onPointerLeave={() => { drag.current = null; }}
                        onKeyDown={onKeyDown}
                        tabIndex={0}
                        role="group"
                        aria-roledescription="carousel"
                        aria-label={name}
                        className={`relative mx-auto flex aspect-[4/5] w-full max-w-[520px] touch-pan-y select-none items-center justify-center outline-none lg:aspect-auto lg:h-[36vw] lg:max-w-none ${canFlip ? "cursor-pointer" : ""}`}
                    >
                        <div className="cp-bgname pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-[4%]" aria-hidden="true">
                            <span className="font-modern-negra whitespace-nowrap text-[13vw] uppercase leading-none text-[#9B0209]/15 sm:text-[100px] lg:text-[5.6vw]">{name}</span>
                        </div>

                        <div className="cp-float relative z-10 h-full w-full px-10 lg:px-[3vw]">
                            <div className="cp-bob h-full w-full">
                                {slide ? (
                                    <FlipStage
                                        key={slide.id}
                                        src={stageSrc}
                                        alt={stageAlt}
                                        axis={turn[0]}
                                        sign={turn[1]}
                                        enterDir={dir.current}
                                    />
                                ) : null}
                            </div>
                        </div>

                        {/* a card with a back: say that it can be turned */}
                        {canFlip && (
                            <button type="button" onClick={flipCard} aria-label={t("cards.flipHint")}
                                    className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#f7f2ea]/95 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#9B0209] shadow-sm transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea]">
                                <FlipIcon className="size-4" />
                                {flipped ? t("cards.seeFront") : t("cards.seeBack")}
                            </button>
                        )}

                        {slides.length > 1 && (
                            <>
                                <button type="button" onClick={() => goSlide(si - 1)} aria-label={t("product.prevPhoto")}
                                        className="absolute left-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#9B0209]/60 bg-[#f7f2ea]/90 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:size-[clamp(40px,3.2vw,56px)]">
                                    <ArrowIcon dir="left" className="size-4" />
                                </button>
                                <button type="button" onClick={() => goSlide(si + 1)} aria-label={t("product.nextPhoto")}
                                        className="absolute right-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#9B0209]/60 bg-[#f7f2ea]/90 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:size-[clamp(40px,3.2vw,56px)]">
                                    <ArrowIcon className="size-4" />
                                </button>
                                <p className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#f7f2ea]/90 px-3 py-1 text-[11px] tracking-[0.2em] text-[#9B0209]" aria-live="polite">
                                    {si + 1} / {slides.length}
                                </p>
                            </>
                        )}
                    </div>

                    {/* turn the box */}
                    {slide?.type === "box" && boxFaces.length > 1 && (
                        <div className="cp-fade mt-6 lg:mt-[1.6vw]">
                            <p className="mb-3 text-center text-[11px] uppercase tracking-[0.2em] text-black/60 lg:text-[clamp(10px,0.8vw,13px)]">{t("cards.turnBox")}</p>
                            <div className="flex flex-wrap justify-center gap-2 lg:gap-[0.6vw]" role="group" aria-label={t("cards.turnBox")}>
                                {boxFaces.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => goFace(f)}
                                        aria-pressed={f === face}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 lg:px-[1vw] lg:py-[0.5vw] lg:text-[clamp(10px,0.78vw,13px)] ${
                                            f === face ? "border-[#9B0209] bg-[#9B0209] text-[#f7f2ea]" : "border-[#9B0209]/40 text-[#9B0209] hover:border-[#9B0209] hover:bg-[#9B0209]/10"
                                        }`}
                                    >
                                        <FaceIcon face={f} className="size-3.5" />
                                        {t(`cards.face.${f}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* thumbnails */}
                    {slides.length > 1 && (
                        <div className="mt-6 flex flex-wrap justify-center gap-3 lg:mt-[1.6vw] lg:gap-[0.9vw]" role="group" aria-label={t("product.photos")}>
                            {slides.map((s, i) => {
                                const thumb = s.type === "box" ? ph.box.front : s.src;
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => goSlide(i)}
                                        aria-pressed={i === si}
                                        aria-label={s.type === "box" ? t("cards.boxLabel") : t("product.photoLabel", { n: i + 1 })}
                                        className={`cp-fade relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#fffaf6] transition-shadow duration-300 lg:size-[clamp(60px,5.4vw,96px)] ${
                                            i === si ? "ring-2 ring-[#9B0209] ring-offset-2 ring-offset-[#f7f2ea]" : "ring-1 ring-black/10 hover:ring-[#9B0209]/50"
                                        }`}
                                    >
                                        <img src={thumb} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" className="h-full w-full object-contain p-1.5" />
                                        {(s.type === "box" || s.back) && (
                                            <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-[#9B0209] text-[#f7f2ea]">
                                                {s.type === "box" ? <CubeIcon className="size-3" /> : <FlipIcon className="size-3" />}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ---------- information ---------- */}
                <div className="flex flex-col items-start">
                    <p className="cp-eyebrow text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9B0209] lg:text-[clamp(11px,0.85vw,15px)]">{t("cards.eyebrow")}</p>

                    <h1 className="font-modern-negra mt-2 text-[15vw] uppercase leading-[0.95] text-[#9B0209] md:text-7xl lg:mt-[0.6vw] lg:text-[clamp(56px,5.8vw,110px)]">
                        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                            <span className="cp-name-in block">{name}</span>
                        </span>
                    </h1>


                    {/* size */}
                    <div className="cp-fade mt-5 w-full lg:mt-[0.6vw]">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-black/60 lg:text-[clamp(10px,0.8vw,13px)]">{t("cards.sizeLabel")}</p>
                        <div className="mt-3 grid max-w-md grid-cols-4 gap-2 lg:max-w-[32vw] lg:gap-[0.7vw]" role="group" aria-label={t("cards.sizeLabel")}>
                            {variants.map((v, i) => (
                                <button
                                    key={v.id}
                                    type="button"
                                    onClick={() => pickVariant(i)}
                                    aria-pressed={i === vi}
                                    className={`cp-pill flex flex-col items-center rounded-2xl border px-2 py-3 transition-colors duration-300 lg:px-[0.6vw] lg:py-[0.9vw] ${
                                        i === vi ? "border-[#9B0209] bg-[#9B0209] text-[#f7f2ea]" : "border-[#9B0209]/40 bg-white/40 text-[#9B0209] hover:border-[#9B0209]"
                                    }`}
                                >
                                    <span className="font-numerals text-3xl leading-none lg:text-[clamp(26px,2.4vw,44px)]">{v.count}</span>
                                    <span className="mt-1 text-[10px] uppercase tracking-[0.18em] lg:text-[clamp(9px,0.7vw,12px)]">{t("cards.cardsWord")}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* price + ready in 2 days */}
                    <div className="cp-fade mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[#9B0209] lg:mt-[1.6vw] lg:gap-x-[1.5vw]">
                        <span className="cp-price font-numerals text-5xl leading-none lg:text-[clamp(40px,3.6vw,64px)]">{money(price)}</span>
                        <p className="inline-flex items-center gap-3 rounded-full border border-[#9B0209]/30 bg-white/50 px-4 py-2 text-[13px] text-[#9B0209] lg:px-[1.1vw] lg:py-[0.5vw] lg:text-[clamp(12px,0.95vw,16px)]">
                            <span className="relative flex size-2.5 items-center justify-center" aria-hidden="true">
                                <span className="cp-ready-dot absolute size-2.5 rounded-full bg-[#9B0209]" />
                                <span className="size-2 rounded-full bg-[#9B0209]" />
                            </span>
                            {lead}
                        </p>
                    </div>

                    {/* description: the tagline is its first line */}
                    <div className="cp-desc mt-4 max-w-[46ch] text-base leading-relaxed text-black/85 lg:mt-[1.2vw] lg:max-w-[32vw] lg:text-[clamp(15px,1.2vw,21px)]">
                        {tagline && <p className="font-serif mb-2 text-lg italic text-[#9B0209] lg:mb-[0.5vw] lg:text-[clamp(16px,1.3vw,22px)]">{tagline}</p>}
                        <p>{tr(variant, "description")}</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setOrderOpen(true)}
                        className="cp-fade group mt-6 inline-flex cursor-pointer items-center gap-4 rounded-full bg-[#9B0209] px-9 py-4 text-sm uppercase tracking-[0.22em] text-[#f7f2ea] transition-colors duration-300 hover:bg-[#6f0107] lg:mt-[1.6vw] lg:gap-[1.1vw] lg:px-[2.6vw] lg:py-[1.15vw] lg:text-[clamp(12px,0.9vw,16px)]"
                    >
                        {t("cards.order")} · {money(price)}
                        <ArrowIcon className="w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </button>

                    {/* what the client chooses / what is fixed: two dropdowns, closed by default */}
                    <div className="cp-fade mt-6 flex w-full max-w-xl flex-col gap-3 lg:mt-[1.8vw] lg:max-w-[34vw] lg:gap-[0.8vw]">
                        <Drop title={t("cards.chooseTitle")} accent>
                            <ul className="space-y-1.5">
                                {chosen.map((k) => (
                                    <li key={k} className="flex gap-2 text-[14px] leading-snug text-black/85 lg:text-[clamp(13px,1vw,17px)]">
                                        <svg viewBox="0 0 24 24" className="mt-[3px] size-4 shrink-0" fill="none" stroke="#9B0209" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
                                        <span>{t(`cards.${k}`)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Drop>
                        <Drop title={t("cards.fixedTitle")}>
                            <p className="text-[14px] leading-snug text-black/75 lg:text-[clamp(13px,1vw,17px)]">{t("cards.fixedText")}</p>
                        </Drop>
                    </div>

                    {/* custom design option */}
                    <button
                        type="button"
                        role="switch"
                        aria-checked={custom}
                        onClick={() => setCustom((v) => !v)}
                        className={`cp-fade mt-4 flex w-full max-w-xl items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-300 lg:mt-[1vw] lg:max-w-[34vw] lg:gap-[1vw] lg:px-[1.2vw] lg:py-[0.9vw] ${
                            custom ? "border-[#9B0209] bg-[#9B0209]/10" : "border-[#9B0209]/30 bg-white/40 hover:border-[#9B0209]"
                        }`}
                    >
                        <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 lg:h-[clamp(24px,1.9vw,32px)] lg:w-[clamp(42px,3.3vw,56px)] ${custom ? "bg-[#9B0209]" : "bg-black/25"}`} aria-hidden="true">
                            <span className={`absolute left-1 top-1 size-5 rounded-full bg-[#f7f2ea] shadow transition-transform duration-300 lg:size-[clamp(16px,1.3vw,22px)] ${custom ? "translate-x-5 lg:translate-x-[clamp(18px,1.4vw,24px)]" : ""}`} />
                        </span>
                        <span className="flex-1">
                            <span className="block text-[15px] font-medium text-[#9B0209] lg:text-[clamp(14px,1.1vw,19px)]">{t("cards.designTitle", { fee: money(fee) })}</span>
                            <span className="mt-0.5 block text-[13px] leading-snug text-black/70 lg:text-[clamp(12px,0.9vw,15px)]">{t("cards.designText")}</span>
                        </span>
                    </button>


                </div>
            </div>

            {orderOpen && <OrderSheet message={message} emailHref={emailHref} onClose={() => setOrderOpen(false)} />}
        </section>
    );
};

const CardsPage = () => {
    const { t } = useT();
    const { product, variants, loading } = useCardsProduct();

    if (loading) return <section aria-busy="true" className="min-h-[90vh]" />;

    if (!product || !variants.length) {
        return (
            <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 pt-32 text-center">
                <p className="font-modern-negra text-4xl text-[#9B0209] lg:text-6xl">{t("cards.notFound")}</p>
                <Link to="/" className="rounded-full border border-[#9B0209] px-8 py-3 text-sm uppercase tracking-[0.22em] text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea]">
                    {t("cards.back")}
                </Link>
            </section>
        );
    }

    return <CardsView product={product} variants={variants} />;
};

export default CardsPage;