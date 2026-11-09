import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import useKeychains from "../hooks/useKeychains.js";

/*
  Keychains section: a clothesline with the keychain cards hanging from it.
  - data comes from the Supabase table "keychains" (see keychains.sql)
  - the middle card is the selected one (bigger); the others hang behind it, smaller
  - desktop: arrows on the sides, keyboard arrows, horizontal trackpad swipe
  - phones: swipe left / right, plus arrows under the line
  - text lives in i18n/en.js and i18n/fr.js  ->  keychains.*
*/

const SIDE_SCALE = 0.74;   // size of the two cards behind the selected one
const SAG = 60;            // how much the line hangs in the middle (the rope drawing is 100 units tall)
const money = (n) => `${n} DT`;

/* wooden clothes-peg that holds each card on the line */
const Peg = () => (
    <svg viewBox="0 0 24 56" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-1.7em] z-20 h-[3em] w-[1.3em] -translate-x-1/2 drop-shadow-sm">
        <rect x="3" y="0" width="18" height="56" rx="6" fill="#7a0a1c" />
        <rect x="6" y="3" width="4" height="50" rx="2" fill="#fff" opacity="0.12" />
        <path d="M12 26 V56" stroke="#3d0208" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="22" r="3" fill="#3d0208" />
    </svg>
);

const Arrow = ({ dir, label, onClick, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`items-center justify-center rounded-full border border-[#9B0209] bg-[#f7f2ea]/90 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9B0209] size-11 lg:size-[clamp(44px,3.6vw,64px)] ${className}`}
    >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5 lg:size-[40%]">
            <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
        </svg>
    </button>
);

/* the keychain photo; if the file is missing (not uploaded yet) a soft placeholder is shown instead */
const Photo = ({ src, alt }) => {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <div className="flex h-full w-full items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 64 64" className="w-1/3 text-[#9B0209]/35" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="32" cy="14" r="8" />
                    <path d="M32 22v8M26 30h12l-3 22a3 3 0 0 1-3 3h-0a3 3 0 0 1-3-3z" />
                </svg>
            </div>
        );
    }
    return (
        <img
            key={src}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
            className="h-full w-full select-none object-contain p-[7%]"
        />
    );
};

const KeychainsContent = ({ items }) => {
    const { t, tr } = useT();
    const root = useRef(null);
    const stage = useRef(null);
    const [active, setActive] = useState(0);

    const n = items.length;
    const activeRef = useRef(0);          // latest value for the resize observer
    const prevOffsets = useRef([]);       // where each card was, to spot a card that wraps around
    const dir = useRef(1);                // 1 = going next, -1 = going back
    const firstRun = useRef(true);
    const drag = useRef(null);
    const dragged = useRef(false);
    const wheelLock = useRef(false);
    activeRef.current = active;

    // 0 = selected, -1 = the card on the left, 1 = on the right
    const offsetOf = (i, a) => {
        let d = (((i - a) % n) + n) % n;
        if (d > n / 2) d -= n;
        return d;
    };

    // put every card where it belongs (animate = glide there, otherwise jump)
    const place = (animate) => {
        const stageEl = stage.current;
        const slots = stageEl?.querySelectorAll(".kc-slot");
        if (!slots?.length) return;
        const w = slots[0].offsetWidth;                                   // layout width: not affected by scale
        const step = w * (window.matchMedia("(min-width: 1024px)").matches ? 1.02 : 0.8);

        // the line is curved, so every card hangs at the height of the line at its own spot
        const rope = stageEl.querySelector(".kc-rope");
        const hangY = (x) => {
            const u = Math.min(1, Math.max(0, 0.5 + x / stageEl.clientWidth));
            return rope.offsetTop + ((8 + 4 * SAG * u * (1 - u)) * rope.clientHeight) / 100 + 3;
        };

        slots.forEach((slot, i) => {
            const d = offsetOf(i, activeRef.current);
            const visible = Math.abs(d) <= 1;
            const to = { x: d * step, y: hangY(d * step), scale: d === 0 ? 1 : SIDE_SCALE, opacity: visible ? 1 : 0 };
            const was = prevOffsets.current[i];
            prevOffsets.current[i] = d;

            gsap.set(slot, { zIndex: d === 0 ? 30 : visible ? 20 : 10 });

            if (!animate) {
                gsap.set(slot, to);
                return;
            }
            // a card that wraps from one side to the other fades in from behind instead of flying across
            if (was != null && Math.abs(d - was) > 1) gsap.set(slot, { x: d * step * 1.5, y: hangY(d * step * 1.5), scale: 0.6, opacity: 0 });
            gsap.to(slot, { ...to, duration: 0.9, ease: "power3.inOut", overwrite: "auto" });

            // little swing, like something hanging from a line that was just nudged
            if (visible) {
                gsap.fromTo(
                    slot.querySelector(".kc-sway"),
                    { rotation: -dir.current * 6 },
                    { rotation: 0, duration: 1.8, ease: "elastic.out(1, 0.3)", overwrite: "auto" }
                );
            }
        });
    };

    const go = (d) => {
        if (n < 2) return;
        dir.current = d;
        setActive((a) => (a + d + n) % n);
    };
    const select = (i) => {
        if (i === activeRef.current) return;
        dir.current = offsetOf(i, activeRef.current) > 0 ? 1 : -1;
        setActive(i);
    };

    // first appearance: the line is drawn from the right, the cards drop in and start to sway
    useGSAP(
        () => {
            place(false);

            const startIdle = () => {
                gsap.utils.toArray(".kc-card").forEach((card, i) => {
                    gsap.fromTo(
                        card,
                        { rotation: -1.1 },
                        { rotation: 1.1, duration: 3.2 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 }
                    );
                });
            };

            gsap
                .timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
                })
                .from(".kc-eyebrow", { opacity: 0, y: 16, duration: 0.8 })
                .from(".kc-title", { opacity: 0, y: 24, duration: 0.9 }, "-=0.5")
                .from(".kc-sub", { opacity: 0, y: 16, duration: 0.8 }, "-=0.6")
                .fromTo(".kc-rope", { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: 1.4, ease: "power2.inOut" }, "-=0.5")
                .from(".kc-sway", { y: -70, opacity: 0, rotation: (i) => (i % 2 ? 9 : -9), duration: 1.5, ease: "elastic.out(1, 0.45)", stagger: { each: 0.18, from: "center" } }, "-=0.7")
                .from(".kc-controls", { opacity: 0, y: 12, duration: 0.6 }, "-=0.8")
                .add(startIdle);
        },
        { scope: root }
    );

    // every time the selected card changes
    useGSAP(
        () => {
            if (firstRun.current) { firstRun.current = false; return; }
            place(true);
        },
        { dependencies: [active], scope: root }
    );

    // screen size changed (rotate the phone, resize the window): re-position without animation
    useEffect(() => {
        if (!stage.current || typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(() => place(false));
        ro.observe(stage.current);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n]);

    // swipe (touch or mouse drag)
    const onPointerDown = (e) => {
        drag.current = { x: e.clientX, y: e.clientY };
        dragged.current = false;
    };
    const onPointerUp = (e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current = null;
        // must be a clear horizontal move, so normal vertical scrolling never changes the card
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        dragged.current = true;
        go(dx < 0 ? 1 : -1);
    };
    // horizontal trackpad gesture
    const onWheel = (e) => {
        if (wheelLock.current || Math.abs(e.deltaX) < 30 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
        wheelLock.current = true;
        setTimeout(() => { wheelLock.current = false; }, 700);
        go(e.deltaX > 0 ? 1 : -1);
    };
    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };

    return (
        <section
            id="keychains"
            ref={root}
            aria-labelledby="keychains-heading"
            className="relative w-full overflow-hidden px-5 pb-16 pt-20 lg:px-0 lg:pb-[5vw] lg:pt-[6vw]"
        >
            <header className="relative z-10 text-center">
                <p className="kc-eyebrow text-[11px] font-medium uppercase tracking-[0.45em] text-[#9B0209] lg:text-[clamp(11px,0.85vw,15px)]">
                    {t("keychains.eyebrow")}
                </p>
                <h2 id="keychains-heading" className="kc-title font-modern-negra mt-4 text-[13vw] leading-[0.95] text-[#9B0209] sm:text-7xl lg:mt-[1.2vw] lg:text-[clamp(48px,5.6vw,100px)]">
                    {t("keychains.title")}
                </h2>
                <p className="kc-sub font-serif mt-3 text-lg italic text-[#9B0209]/80 lg:mt-[0.8vw] lg:text-[clamp(15px,1.3vw,22px)]">
                    {t("keychains.sub")}
                </p>
            </header>

            {/* the carousel: line on top, cards hanging from it */}
            <div
                ref={stage}
                role="region"
                aria-roledescription="carousel"
                aria-label={t("keychains.title")}
                tabIndex={0}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => { drag.current = null; }}
                onWheel={onWheel}
                onKeyDown={onKeyDown}
                className="relative -mx-5 mt-10 touch-pan-y select-none overflow-x-clip outline-none lg:mx-0 lg:mt-[2.4vw]
                           [--w:clamp(190px,56vw,300px)] lg:[--w:clamp(230px,19vw,370px)]
                           [--rh:38px] lg:[--rh:70px]
                           h-[calc(var(--w)*2.15+50px+var(--rh)*0.6)]"
            >
                {/* the clothesline: a twisted cord that hangs in the middle (drawn from the right) */}
                <div className="kc-rope pointer-events-none absolute inset-x-0 top-[14px] z-[5] h-[var(--rh)]" aria-hidden="true">
                    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="h-full w-full overflow-visible" fill="none">
                        <path d={`M-20 8 Q500 ${8 + 2 * SAG} 1020 8`} stroke="#a4192b" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        <path d={`M-20 8 Q500 ${8 + 2 * SAG} 1020 8`} stroke="#6a0309" strokeWidth="7" strokeDasharray="4 8" vectorEffect="non-scaling-stroke" opacity="0.55" />
                        <path d={`M-20 8 Q500 ${8 + 2 * SAG} 1020 8`} stroke="#e0606f" strokeWidth="2.5" strokeDasharray="2 10" strokeDashoffset="4" vectorEffect="non-scaling-stroke" opacity="0.7" />
                    </svg>
                    {/* the two ends are tied to a hook */}
                    <span className="absolute left-[2.5%] top-[calc(8%-7px)] size-3.5 rounded-full bg-[#7a0a1c] ring-2 ring-[#e0606f]/60" />
                    <span className="absolute right-[2.5%] top-[calc(8%-7px)] size-3.5 rounded-full bg-[#7a0a1c] ring-2 ring-[#e0606f]/60" />
                </div>

                {items.map((item, i) => {
                    const d = offsetOf(i, active);
                    const isActive = d === 0;
                    const { height, width } = item.dimensions;
                    return (
                        <div
                            key={item.id}
                            className="kc-slot absolute left-1/2 top-0 w-[var(--w)] -ml-[calc(var(--w)/2)] origin-top"
                            style={{ fontSize: "calc(var(--w) / 16)" }}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={t("keychains.slideLabel", { current: i + 1, total: n })}
                            aria-hidden={Math.abs(d) > 1 ? true : undefined}
                            onClick={() => {
                                if (dragged.current) { dragged.current = false; return; }
                                if (!isActive) select(i);
                            }}
                        >
                            <div className="kc-sway origin-top">
                                <div className="kc-card origin-top">
                                    {/* photo card */}
                                    <div className="relative aspect-[4/5] rounded-[1.6em] bg-[#fffaf6] shadow-[0_1.2em_1.8em_-0.8em_rgba(106,3,9,0.35)] ring-1 ring-[#9B0209]/15">
                                        <Peg />
                                        <Photo src={item.image} alt={t("keychains.imgAlt", { name: item.name })} />
                                    </div>

                                    {/* info square */}
                                    <div className="mt-[0.9em] rounded-[1.1em] bg-[#8a0610] px-[1.1em] py-[1em] text-center text-[#f7f2ea] shadow-[0_0.8em_1.4em_-0.8em_rgba(106,3,9,0.6)]">
                                        <h3 className="font-modern-negra text-[1.9em] uppercase leading-none">{item.name}</h3>
                                        {(height || width) && (
                                            <p className="mt-[0.6em] text-[0.8em] uppercase tracking-[0.08em] text-[#f7f2ea]/70">
                                                {height && <span>{t("menu.height")} {height}</span>}
                                                {height && width && <span aria-hidden="true"> · </span>}
                                                {width && <span>{t("menu.width")} {width}</span>}
                                            </p>
                                        )}
                                        {item.price != null && (
                                            <p className="font-numerals mt-[0.5em] text-[1.7em] leading-none">{money(item.price)}</p>
                                        )}
                                        {tr(item, "description") && (
                                            <p className="mt-[0.6em] line-clamp-2 text-[0.85em] leading-snug text-[#f7f2ea]/85">{tr(item, "description")}</p>
                                        )}
                                        {isActive && (
                                            <Link to={`/keychain/${item.slug}`} className="mt-[0.9em] inline-block text-[0.8em] uppercase tracking-[0.18em] text-[#f7f2ea] underline underline-offset-4 hover:opacity-80">
                                                {t("keychains.view")}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* desktop: arrows on both sides */}
                {n > 1 && (
                    <>
                        <Arrow dir="prev" label={t("keychains.prev")} onClick={() => go(-1)} className="hidden lg:flex absolute left-[8vw] top-[16vw] z-40" />
                        <Arrow dir="next" label={t("keychains.next")} onClick={() => go(1)} className="hidden lg:flex absolute right-[8vw] top-[16vw] z-40" />
                    </>
                )}
            </div>

            {/* phones: arrows under the cards, with the position dots between them */}
            {n > 1 && (
                <div className="kc-controls relative z-10 mt-2 flex items-center justify-center gap-5 lg:mt-[1vw]">
                    <Arrow dir="prev" label={t("keychains.prev")} onClick={() => go(-1)} className="flex lg:hidden" />
                    <div className="flex items-center gap-2.5" role="group" aria-label={t("keychains.title")}>
                        {items.map((item, i) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => select(i)}
                                aria-label={item.name}
                                aria-current={i === active ? "true" : undefined}
                                className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? "w-7 bg-[#9B0209]" : "w-2.5 bg-[#9B0209]/30 hover:bg-[#9B0209]/60"}`}
                            />
                        ))}
                    </div>
                    <Arrow dir="next" label={t("keychains.next")} onClick={() => go(1)} className="flex lg:hidden" />
                </div>
            )}

            {/* screen readers hear which keychain is selected */}
            <p className="sr-only" aria-live="polite">{items[active]?.name}</p>
        </section>
    );
};

// loads the keychains from Supabase; nothing renders if there are none
const Keychains = () => {
    const { keychains, loading } = useKeychains();
    // while loading, keep the section's space so nothing below jumps when the cards appear
    if (loading) return <section id="keychains" aria-hidden="true" className="min-h-[760px] lg:min-h-[52vw]" />;
    if (!keychains.length) return null;
    return <KeychainsContent items={keychains} />;
};

export default Keychains;