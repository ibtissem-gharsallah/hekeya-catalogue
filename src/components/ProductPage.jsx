import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import useProducts from "../hooks/useProducts.js";
import useKeychains from "../hooks/useKeychains.js";

/*
  Product page, one for bags (/bag/:slug) and one for keychains (/keychain/:slug).
  - data comes from Supabase through the same hooks as the catalogue
  - bags: one photo per colour variant (thumbnails + colour swatches); keychains: a single photo
  - text lives in i18n/en.js and i18n/fr.js  ->  product.*
*/

const CONTACT_EMAIL = "hekeya.store@gmail.com";
const money = (n) => `${n} DT`;

const KINDS = {
    bag: { path: "bag", back: "/#menu", kind: "product.kindBag", backLabel: "product.backBag" },
    keychain: { path: "keychain", back: "/#keychains", kind: "product.kindKeychain", backLabel: "product.backKeychain" },
};

const ArrowIcon = ({ dir = "right", className = "" }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
        <path d={dir === "left" ? "M20 12H4M10 6l-6 6 6 6" : "M4 12h16M14 6l6 6-6 6"} />
    </svg>
);

const ProductView = ({ item, items, kind, discount }) => {
    const { t, tr, colorName } = useT();
    const cfg = KINDS[kind];
    const root = useRef(null);
    const stage = useRef(null);
    const quick = useRef(null);
    const firstColorRun = useRef(true);
    const dir = useRef(1);
    const drag = useRef(null);
    const [photoIndex, setPhotoIndex] = useState(0);

    const colors = item.colors || [];
    // the photos: a bag has one per colour, a keychain has its own gallery (one photo or more)
    const photos = colors.length
        ? colors.map((c) => ({ image: c.image, hex: c.hex, name: c.name }))
        : (item.images || []).map((src) => ({ image: src }));
    const hasGallery = photos.length > 1;
    const hasColours = colors.length > 1;
    const image = photos[photoIndex]?.image || item.image;
    const colourLabel = colors[photoIndex] ? colorName(colors[photoIndex].name) : "";
    const photoAlt = colourLabel
        ? `${item.name}, ${colourLabel}`
        : hasGallery ? t("product.photoAlt", { name: item.name, n: photoIndex + 1, total: photos.length }) : item.name;

    // prices: discount ON -> old price crossed out + new price + badge; OFF -> just the regular (old) price
    const { oldPrice, newPrice, dimensions } = item;
    const onSale = discount?.active && oldPrice != null && newPrice != null && newPrice < oldPrice;
    const regularPrice = oldPrice ?? newPrice;

    const description = tr(item, "description");
    const detail = tr(item, "detail");
    const leadTime = tr(item, "leadTime");

    const specs = [];
    if (dimensions?.height) specs.push({ k: t("menu.height"), v: dimensions.height });
    if (dimensions?.width) specs.push({ k: t("menu.width"), v: dimensions.width });
    if (item.material) specs.push({ k: t("product.material"), v: item.material });
    if (leadTime) specs.push({ k: t("product.leadTime"), v: leadTime });

    // previous / next piece of the same kind (wraps around)
    const index = items.findIndex((p) => p.id === item.id);
    const prev = items.length > 1 ? items[(index - 1 + items.length) % items.length] : null;
    const next = items.length > 1 ? items[(index + 1) % items.length] : null;
    const linkTo = (p) => `/${cfg.path}/${p.slug ?? p.id}`;

    // order by e-mail: the message already contains the product and the chosen colour
    const subject = t("product.orderSubject", { name: item.name });
    const body = t("product.orderBody", { name: item.name, variant: colourLabel ? ` (${colourLabel})` : "" });
    const orderHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // browser tab title
    useEffect(() => {
        document.title = `${item.name} · Hekeya`;
        return () => { document.title = "Hekeya"; };
    }, [item.name]);

    // load the other photos in the background so switching never shows a blank
    useEffect(() => {
        const load = () => photos.forEach((ph) => { if (ph.image) { const img = new Image(); img.decoding = "async"; img.src = ph.image; } });
        const id = "requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 3000 }) : setTimeout(load, 800);
        return () => ("cancelIdleCallback" in window ? cancelIdleCallback(id) : clearTimeout(id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.id]);

    // entrance
    useGSAP(
        () => {
            gsap
                .timeline({ defaults: { ease: "power3.out" } })
                .from(".pv-crumb", { opacity: 0, y: -10, duration: 0.6 })
                .from(".pv-bgname span", { opacity: 0, y: 60, scale: 0.92, duration: 1.2 }, 0.1)
                .from(".pv-float", { opacity: 0, x: 80, rotate: 4, scale: 0.94, duration: 1.3 }, 0.15)
                .from(".pv-thumb", { opacity: 0, y: 20, scale: 0.85, stagger: 0.08, duration: 0.6, ease: "back.out(2)" }, 0.9)
                .from(".pv-eyebrow", { opacity: 0, y: 14, duration: 0.7 }, 0.3)
                .from(".pv-name-in", { yPercent: 110, duration: 1.2, ease: "expo.out" }, 0.4)
                .from(".pv-fade", { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, 0.8)
                .from(".pv-swatch", { scale: 0, opacity: 0, stagger: 0.08, duration: 0.5, ease: "back.out(2)" }, 1.1);

            // the photo floats very slowly
            gsap.to(".pv-bob", { y: -10, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });

            // yarn balls drift while you scroll
            gsap.to(".pv-yarn-a", { y: 120, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
            gsap.to(".pv-yarn-b", { y: -120, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });

            // photo follows the mouse a little (mouse only, never on touch screens)
            if (window.matchMedia("(hover: hover)").matches) {
                quick.current = {
                    x: gsap.quickTo(".pv-pointer", "x", { duration: 0.8, ease: "power3" }),
                    y: gsap.quickTo(".pv-pointer", "y", { duration: 0.8, ease: "power3" }),
                };
            }
        },
        { scope: root }
    );

    // a new photo / colour: the photo slides in (same movement as the catalogue), the swatch pops
    useGSAP(
        () => {
            if (firstColorRun.current) { firstColorRun.current = false; return; }
            gsap.fromTo(".pv-img", { opacity: 0, xPercent: dir.current * 14 }, { opacity: 1, xPercent: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
            gsap.fromTo(".pv-bgname span", { opacity: 0.4, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", overwrite: "auto" });
        },
        { dependencies: [photoIndex], scope: root }
    );

    const pickPhoto = (i) => {
        if (i === photoIndex) return;
        dir.current = i > photoIndex ? 1 : -1;
        setPhotoIndex(i);
    };
    const stepPhoto = (d) => {
        if (!hasGallery) return;
        dir.current = d;
        setPhotoIndex((i) => (i + d + photos.length) % photos.length);
    };

    // swipe the photo to change it; mouse move = small parallax
    const onPointerDown = (e) => { drag.current = { x: e.clientX, y: e.clientY }; };
    const onPointerUp = (e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        const dy = e.clientY - drag.current.y;
        drag.current = null;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;   // vertical scrolling must never change the photo
        stepPhoto(dx < 0 ? 1 : -1);
    };
    const onPointerMove = (e) => {
        if (e.pointerType !== "mouse" || !quick.current || !stage.current) return;
        const r = stage.current.getBoundingClientRect();
        quick.current.x(((e.clientX - r.left) / r.width - 0.5) * 22);
        quick.current.y(((e.clientY - r.top) / r.height - 0.5) * 16);
    };
    const onKeyDown = (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); stepPhoto(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); stepPhoto(-1); }
    };
    const onPointerLeave = () => { drag.current = null; quick.current?.x(0); quick.current?.y(0); };

    return (
        <section id="product" ref={root} className="relative w-full overflow-hidden px-5 pb-20 pt-32 md:pt-28 lg:px-[7vw] lg:pb-[6vw] lg:pt-[8vw]">
            {/* yarn balls (decoration) */}
            <img src="/images/yarn-left.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="pv-yarn-a pointer-events-none absolute left-0 top-[40%] z-0 w-[8vw] lg:top-[20vw] lg:w-auto lg:h-[16vw]" />
            <img src="/images/yarn-right.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="pv-yarn-b pointer-events-none absolute right-0 top-[18vw] z-0 hidden h-[15vw] w-auto lg:block" />

            <Link to={cfg.back} className="pv-crumb group relative z-10 inline-flex items-center gap-3 text-[12px] uppercase tracking-[0.25em] text-[#9B0209] lg:text-[clamp(11px,0.85vw,15px)]">
                <ArrowIcon dir="left" className="w-4 transition-transform duration-300 group-hover:-translate-x-1.5" />
                {t(cfg.backLabel)}
            </Link>

            <div className="relative z-10 mt-6 grid gap-10 lg:mt-[2vw] lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-[5vw]">
                {/* ---------- photo + variants ---------- */}
                <div>
                    <div
                        ref={stage}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerMove={onPointerMove}
                        onPointerLeave={onPointerLeave}
                        onPointerCancel={() => { drag.current = null; }}
                        onKeyDown={hasGallery ? onKeyDown : undefined}
                        tabIndex={hasGallery ? 0 : undefined}
                        className="relative mx-auto flex aspect-[4/5] w-full max-w-[520px] touch-pan-y select-none items-center justify-center lg:aspect-auto lg:h-[36vw] lg:max-w-none"
                    >
                        {/* the name, big and faded, behind the photo */}
                        <div className="pv-bgname pointer-events-none absolute inset-0 z-0 flex items-start justify-center pt-[4%]" aria-hidden="true">
                            <span className="font-modern-negra whitespace-nowrap text-[22vw] uppercase leading-none text-[#9B0209]/15 sm:text-[120px] lg:text-[11vw]">{item.name}</span>
                        </div>

                        <div className="pv-float relative z-10 h-full w-full">
                            <div className="pv-bob h-full w-full">
                                <div className="pv-pointer h-full w-full">
                                    {/* key = a new <img> per photo, so the previous colour never lingers while the next one loads */}
                                    {image ? (
                                        <img
                                            key={image}
                                            src={image}
                                            alt={photoAlt}
                                            fetchPriority="high"
                                            decoding="async"
                                            draggable="false"
                                            className="pv-img h-full w-full object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.18)]"
                                        />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        {/* several photos: arrows + counter on the photo */}
                        {hasGallery && (
                            <>
                                <button type="button" onClick={() => stepPhoto(-1)} aria-label={t("product.prevPhoto")}
                                        className="absolute left-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#9B0209]/60 bg-[#f7f2ea]/90 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:size-[clamp(40px,3.2vw,56px)]">
                                    <ArrowIcon dir="left" className="size-4" />
                                </button>
                                <button type="button" onClick={() => stepPhoto(1)} aria-label={t("product.nextPhoto")}
                                        className="absolute right-0 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#9B0209]/60 bg-[#f7f2ea]/90 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea] lg:size-[clamp(40px,3.2vw,56px)]">
                                    <ArrowIcon className="size-4" />
                                </button>
                                <p className="absolute bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-[#f7f2ea]/90 px-3 py-1 text-[11px] tracking-[0.2em] text-[#9B0209]" aria-live="polite">
                                    {photoIndex + 1} / {photos.length}
                                </p>
                            </>
                        )}
                    </div>

                    {/* one thumbnail per photo (bag: one per colour variant) */}
                    {hasGallery && (
                        <div className="mt-6 flex flex-wrap justify-center gap-3 lg:mt-[1.6vw] lg:gap-[0.9vw]" role="group" aria-label={hasColours ? t("menu.colours") : t("product.photos")}>
                            {photos.map((c, i) => (
                                <button
                                    key={`${c.name ?? "photo"}-${i}`}
                                    type="button"
                                    onClick={() => pickPhoto(i)}
                                    aria-label={c.name ? colorName(c.name) : t("product.photoLabel", { n: i + 1 })}
                                    aria-pressed={i === photoIndex}
                                    title={c.name ? colorName(c.name) : t("product.photoLabel", { n: i + 1 })}
                                    className={`pv-thumb relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-[#fffaf6] transition-shadow duration-300 lg:size-[clamp(60px,5.4vw,96px)] ${
                                        i === photoIndex ? "ring-2 ring-[#9B0209] ring-offset-2 ring-offset-[#f7f2ea]" : "ring-1 ring-black/10 hover:ring-[#9B0209]/50"
                                    }`}
                                >
                                    {c.image ? (
                                        <img src={c.image} alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" className="h-full w-full object-contain p-1.5" />
                                    ) : (
                                        <span className="block h-full w-full" style={{ backgroundColor: c.hex }} />
                                    )}
                                    {c.hex && <span className="absolute bottom-1 right-1 size-3 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} aria-hidden="true" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ---------- information ---------- */}
                <div className="flex flex-col items-start">
                    <p className="pv-eyebrow text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9B0209] lg:text-[clamp(11px,0.85vw,15px)]">{t(cfg.kind)}</p>

                    <h1 className="font-modern-negra mt-2 text-[18vw] uppercase leading-[0.95] text-[#9B0209] md:text-8xl lg:mt-[0.6vw] lg:text-[clamp(64px,7vw,130px)]">
                        <span className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
                            <span className="pv-name-in block">{item.name}</span>
                        </span>
                    </h1>

                    {(onSale || regularPrice != null) && (
                        <div className="pv-fade mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#9B0209] lg:mt-[0.8vw] lg:gap-x-[0.9vw]">
                            {onSale ? (
                                <>
                                    <span className="text-base text-black/45 line-through lg:text-[clamp(14px,1.2vw,20px)]">{money(oldPrice)}</span>
                                    <span className="font-numerals text-4xl leading-none lg:text-[clamp(30px,2.8vw,50px)]">{money(newPrice)}</span>
                                    <span className="rounded-full bg-[#9B0209] px-3 py-1 text-[11px] uppercase tracking-[0.12em] text-[#f7f2ea] lg:px-[0.9vw] lg:py-[0.3vw] lg:text-[clamp(10px,0.8vw,13px)]">
                                        {t("menu.badge", { percent: discount.percent })}
                                    </span>
                                </>
                            ) : (
                                <span className="font-numerals text-4xl leading-none lg:text-[clamp(30px,2.8vw,50px)]">{money(regularPrice)}</span>
                            )}
                        </div>
                    )}

                    {description && (
                        <p className="pv-fade mt-5 max-w-[46ch] text-base leading-relaxed text-black/85 lg:mt-[1.6vw] lg:max-w-[32vw] lg:text-[clamp(15px,1.25vw,22px)]">{description}</p>
                    )}
                    {detail && (
                        <p className="pv-fade font-serif mt-3 max-w-[46ch] text-base italic text-[#9B0209] lg:mt-[0.8vw] lg:max-w-[32vw] lg:text-[clamp(14px,1.1vw,19px)]">{detail}</p>
                    )}

                    {specs.length > 0 && (
                        <dl className="mt-7 grid w-full max-w-md grid-cols-2 gap-3 lg:mt-[2vw] lg:max-w-[32vw] lg:gap-[0.9vw]">
                            {specs.map((s) => (
                                <div key={s.k} className="pv-fade rounded-2xl border border-[#9B0209]/25 bg-white/50 px-4 py-3 lg:px-[1.2vw] lg:py-[0.9vw]">
                                    <dt className="text-[10px] uppercase tracking-[0.2em] text-[#9B0209] lg:text-[clamp(9px,0.7vw,12px)]">{s.k}</dt>
                                    <dd className="mt-1 text-base text-black/85 lg:text-[clamp(14px,1.15vw,20px)]">{s.v}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {hasColours && (
                        <div className="pv-fade mt-7 lg:mt-[2vw]">
                            <p className="text-[11px] uppercase tracking-[0.2em] text-black/60 lg:text-[clamp(10px,0.8vw,13px)]">
                                {t("product.colour")}: <span className="font-semibold text-[#9B0209]">{colourLabel}</span>
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 lg:gap-[0.9vw]" role="group" aria-label={t("menu.colours")}>
                                {colors.map((c, i) => (
                                    <button
                                        key={c.name}
                                        type="button"
                                        aria-label={colorName(c.name)}
                                        aria-pressed={i === photoIndex}
                                        onClick={() => pickPhoto(i)}
                                        style={{ backgroundColor: c.hex }}
                                        className={`pv-swatch size-9 shrink-0 cursor-pointer rounded-full border border-black/20 transition-[scale] duration-300 hover:scale-110 lg:size-[clamp(28px,2.3vw,42px)] ${
                                            i === photoIndex ? "scale-110 ring-2 ring-[#9B0209] ring-offset-2 ring-offset-[#f7f2ea]" : ""
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={orderHref}
                        className="pv-fade group mt-8 inline-flex items-center gap-4 rounded-full bg-[#9B0209] px-9 py-4 text-sm uppercase tracking-[0.22em] text-[#f7f2ea] transition-colors duration-300 hover:bg-[#6f0107] lg:mt-[2.4vw] lg:gap-[1.1vw] lg:px-[2.6vw] lg:py-[1.15vw] lg:text-[clamp(12px,0.9vw,16px)]"
                    >
                        {t("product.order")}
                        <ArrowIcon className="w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </a>

                    <Link to="/#care" className="pv-fade font-serif mt-5 text-base italic text-[#9B0209] underline-offset-4 hover:underline lg:mt-[1.2vw] lg:text-[clamp(14px,1.1vw,19px)]">
                        {t("product.care")}
                    </Link>
                </div>
            </div>

            {/* previous / next piece */}
            {prev && next && (
                <nav aria-label={t(cfg.kind)} className="pv-fade relative z-10 mt-16 flex items-center justify-between gap-4 border-t border-[#9B0209]/20 pt-6 lg:mt-[5vw] lg:pt-[1.6vw]">
                    <Link to={linkTo(prev)} className="group flex items-center gap-3 text-[#9B0209]">
                        <ArrowIcon dir="left" className="w-5 shrink-0 transition-transform duration-300 group-hover:-translate-x-1.5" />
                        <span>
                            <span className="block text-[10px] uppercase tracking-[0.25em] text-black/55 lg:text-[clamp(9px,0.7vw,12px)]">{t("product.prev")}</span>
                            <span className="font-modern-negra text-2xl uppercase lg:text-[clamp(22px,2vw,36px)]">{prev.name}</span>
                        </span>
                    </Link>
                    <Link to={linkTo(next)} className="group flex items-center gap-3 text-right text-[#9B0209]">
                        <span>
                            <span className="block text-[10px] uppercase tracking-[0.25em] text-black/55 lg:text-[clamp(9px,0.7vw,12px)]">{t("product.next")}</span>
                            <span className="font-modern-negra text-2xl uppercase lg:text-[clamp(22px,2vw,36px)]">{next.name}</span>
                        </span>
                        <ArrowIcon className="w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </Link>
                </nav>
            )}
        </section>
    );
};

/* shown while loading (keeps the space, so nothing jumps) and when the link does not match a product */
const Loading = () => <section aria-busy="true" className="min-h-[90vh]" />;

const NotFound = ({ kind }) => {
    const { t } = useT();
    const cfg = KINDS[kind];
    return (
        <section className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-5 pt-32 text-center">
            <p className="font-modern-negra text-4xl text-[#9B0209] lg:text-6xl">{t("product.notFound")}</p>
            <Link to={cfg.back} className="rounded-full border border-[#9B0209] px-8 py-3 text-sm uppercase tracking-[0.22em] text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea]">
                {t(cfg.backLabel)}
            </Link>
        </section>
    );
};

/* /bag/:slug */
export const BagPage = () => {
    const { slug } = useParams();
    const { sliderLists, discount, loading } = useProducts();
    if (loading) return <Loading />;
    const item = sliderLists.find((b) => String(b.slug) === slug || String(b.id) === slug);
    if (!item) return <NotFound kind="bag" />;
    return <ProductView key={item.id} item={item} items={sliderLists} kind="bag" discount={discount} />;
};

/* /keychain/:slug (same page, a keychain has one photo and a single price) */
export const KeychainPage = () => {
    const { slug } = useParams();
    const { keychains, loading } = useKeychains();
    if (loading) return <Loading />;
    const items = keychains.map((k) => ({ ...k, colors: [], oldPrice: null, newPrice: k.price, material: null, detail: null, leadTime: null }));
    const item = items.find((k) => String(k.slug) === slug || String(k.id) === slug);
    if (!item) return <NotFound kind="keychain" />;
    return <ProductView key={item.id} item={item} items={items} kind="keychain" discount={null} />;
};