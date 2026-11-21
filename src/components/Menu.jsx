"use client"
import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts.js";
import {useGSAP} from "@gsap/react";
import  gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import OrderSheet from "./OrderSheet.jsx";
import buildOrder from "./orderMessage.js";
// small photo of a bag: the bag's own photo, or the first colour's photo (many bags only have colour photos); a soft icon if there is none
const Thumb = ({ bag }) => {
    const [failed, setFailed] = useState(false);
    const src = bag.thumb || bag.colors?.[0]?.image || bag.image;
    if (!src || failed) {
        return (
            <span className="flex h-full w-full items-center justify-center" aria-hidden="true">
                <svg viewBox="0 0 64 64" className="w-1/2 text-[#9B0209]/35" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 26c0-8 5-14 12-14s12 6 12 14" />
                    <path d="M12 28h40l-3 24a4 4 0 0 1-4 3H19a4 4 0 0 1-4-3z" />
                </svg>
            </span>
        );
    }
    return (
        <img
            src={src}
            alt=""
            aria-hidden="true"
            width="120"
            height="150"
            loading="lazy"
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
            className="h-full w-full select-none object-contain p-[6%]"
        />
    );
};

const MenuContent = ({ sliderLists, discount }) => {
    const { t, tr, colorName } = useT();
    const contentRef =useRef();
    const railRef = useRef(null);     // the row of thumbnails
    const enterFrom = useRef(-100);   // side the new photo slides in from (-100 = left, 100 = right)
    const touch = useRef(null);       // finger position when a swipe starts
    const [currentIndex, setCurrentIndex] = useState(0);
    const [colorIndex, setColorIndex] = useState(0);
    const [orderOpen, setOrderOpen] = useState(false);
    useGSAP(()=>{

        gsap.fromTo('#title',{
            opacity:0,

        },{
            opacity:1,duration:1,
        });
        gsap.fromTo('.cocktail img',{
            opacity:0,
            xPercent:enterFrom.current,

        },{
            xPercent:0,
            opacity:1,
            duration:1,
            ease:"power1.inOut"
        });
        gsap.fromTo('.details p, .bag-price',{yPercent:100,opacity:0},{
            yPercent:0,opacity:1,ease:"power1.inOut"
        });
        gsap
            .timeline({
                scrollTrigger: {
                    trigger: "#menu",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
            })
            .to(".m-right-leaf", { y: 200 }, 0)
            .to(".m-left-leaf", { y: -200 }, 0);

        // the text column drifts down while scrolling: desktop only.
        // On phones it pushed the swatches out of the card (they got cut off).
        gsap.matchMedia().add("(min-width: 1024px)", () => {
            gsap.timeline({
                scrollTrigger: { trigger: "#menu", start: "top top", end: "bottom top", scrub: true },
            }).to(".recipe", { y: 100 }, 0);
        });
    },[currentIndex])

    // thumbnails rise in one by one (only the wrapper moves; the hover/active effects are CSS on the inner photo)
    useGSAP(()=>{
        gsap.fromTo('.rail-item',
            { opacity:0, y:22 },
            { opacity:1, y:0, duration:0.7, ease:"power3.out", stagger:0.08, delay:0.3, clearProps:"transform,opacity" }
        );
        // the "next" arrow nudges a few times, to show there is more to see
        gsap.to('.arrows button:last-child img', { x:8, duration:0.7, ease:"sine.inOut", yoyo:true, repeat:5, delay:2.5 });
    },[])

    // the two buttons invite a click: a soft ring pulses around "Order now", the arrow of "View details" nudges
    useGSAP(()=>{
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
            gsap.fromTo('.cta-pulse',
                { scale:1, opacity:0.55 },
                { scale:1.28, opacity:0, duration:1.4, ease:"power2.out", repeat:-1, repeatDelay:2.4, delay:3 }
            );
            gsap.to('.cta-arrow',
                { x:6, duration:0.5, ease:"power1.inOut", yoyo:true, repeat:-1, repeatDelay:2.2, delay:3.8 }
            );
        });
    },[])

    // keep the selected thumbnail in view inside the row (the page itself never scrolls)
    useEffect(()=>{
        const rail = railRef.current;
        const el = rail?.querySelector('[aria-current="true"]');
        if (!rail || !el) return;
        rail.scrollTo({ left: el.offsetLeft - rail.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
    },[currentIndex])

    // ADDED: same leaf parallax as the Cocktails section (leaves slide in from the sides as you scroll)
    useGSAP(()=>{
        gsap.timeline({
            scrollTrigger: {
                trigger: '#menu',
                start: 'top 30%',
                end: 'bottom 80%',
                scrub: true,
            }
        })
            .from('#m-left-leaf', { x: -100, y: 100 })
            .from('#m-right-leaf', { x: 100, y: 100 })
    },[])

    // ADDED: the big name behind the bag rises in and fades in each time the bag changes
    useGSAP(()=>{
        gsap.fromTo('.bag-name span',
            { opacity:0, y:60, scale:0.92 },
            { opacity:1, y:0, scale:1, duration:1.1, ease:"power3.out" }
        );
    },[currentIndex])

    // swatches pop in one by one every time the bag changes
    useGSAP(()=>{
        gsap.fromTo('.swatch',
            { scale:0, opacity:0, y:20 },
            { scale:1, opacity:1, y:0, duration:0.6, ease:"back.out(2)", stagger:0.12, delay:0.5 }
        );
    },[currentIndex])

    // same animation as the main photo, replayed when a swatch is clicked
    const firstColorRun = useRef(true);
    useGSAP(()=>{
        // skip the first run: the main effect above already animates the photo on mount
        if (firstColorRun.current) { firstColorRun.current = false; return; }
        gsap.fromTo('.cocktail img',
            { opacity:0, xPercent:-100 },
            { xPercent:0, opacity:1, duration:1, ease:"power1.inOut", overwrite:"auto" }
        );
    },[colorIndex])

    const totalCocktails= sliderLists.length;
    const goToSlide = (index, from = -100) => {
        enterFrom.current = from;
        const  newIndex=(index+totalCocktails)%totalCocktails;
        setCurrentIndex(newIndex);
        setColorIndex(0);
    }
    // swipe on phones: left = next bag, right = previous bag (the arrows still work too)
    const onTouchStart = (e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e) => {
        if (!touch.current) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - touch.current.x;
        const dy = t.clientY - touch.current.y;
        touch.current = null;
        // must be a clear horizontal swipe (so normal vertical scrolling never changes the bag)
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        if (dx < 0) goToSlide(currentIndex + 1, 100);
        else goToSlide(currentIndex - 1, -100);
    };
    const getCocktailAt= (indexOffset)=>{
        return sliderLists[(currentIndex+indexOffset+totalCocktails)%totalCocktails];
    }
    const  currentCocktail=getCocktailAt(0);
    const prevCocktail=getCocktailAt(-1);
    const nextCocktail = getCocktailAt(1)
    const colors = currentCocktail.colors || [];
    const currentImage = colors[colorIndex]?.image || currentCocktail.image;

    // prices: with the discount ON -> old price crossed out + new price + badge; OFF -> just the regular (old) price
    const { oldPrice, newPrice, dimensions } = currentCocktail;
    const onSale = discount?.active && oldPrice != null && newPrice != null && newPrice < oldPrice;
    const regularPrice = oldPrice ?? newPrice;
    const money = (n) => `${n} DT`;

    // "Order now": same ready-to-send message as the product page, with the colour selected here
    const { message, emailHref } = buildOrder({
        t,
        name: currentCocktail.name,
        slug: currentCocktail.slug ?? currentCocktail.id,
        colour: colors[colorIndex]?.name,
        colourLabel: colors[colorIndex] ? colorName(colors[colorIndex].name) : "",
        price: onSale ? newPrice : regularPrice,
        dimensions,
    });

    // colour swatches, shown under the description
    const renderSwatches = (extraClass) =>
        colors.length > 1 && (
            <div className={`swatches ${extraClass}`} role="group" aria-label={t("menu.colours")}>
                {colors.map((color, i) => (
                    <button
                        key={color.name}
                        type="button"
                        aria-label={colorName(color.name)}
                        aria-pressed={i === colorIndex}
                        onClick={() => setColorIndex(i)}
                        style={{ backgroundColor: color.hex }}
                        className={`swatch ${i === colorIndex ? 'is-active' : ''}`}
                    />
                ))}
            </div>
        );
    return (
        <section id="menu" aria-labelledby="menu-heading">
            {/* CHANGED: yarn balls instead of leaves (still styled by #m-left-leaf / #m-right-leaf) */}
            <img src="/images/yarn-left.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="m-left-leaf" />
            <img src="/images/yarn-right.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="m-right-leaf" />
            {/* CHANGED: visible heading (was sr-only) */}
            <header className="menu-head">
                <p>{t("menu.eyebrow")}</p>
                <h2 id="menu-heading">{t("menu.title")}</h2>
            </header>
            {/* thumbnails: one small photo per bag, the selected one is lifted and ringed */}
            <div className="relative z-10 mb-3 lg:absolute lg:inset-x-0 lg:top-[9.4vw] lg:mb-0">
                <p className="mb-2 text-center font-serif text-sm italic text-[#9B0209]/80 lg:hidden">{t("menu.railHint")}</p>
                <nav
                    ref={railRef}
                    className="relative mx-auto flex w-max max-w-full snap-x gap-3 overflow-x-auto px-2 pb-3 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:max-w-[84vw] lg:gap-[1.5vw] lg:px-[1vw] lg:pb-[0.4vw] lg:pt-[0.5vw]"
                    aria-label={t("menu.navLabel")}
                >
                    {sliderLists.map((bag, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <button
                                key={bag.id}
                                type="button"
                                onClick={() => goToSlide(index, index > currentIndex ? 100 : -100)}
                                aria-label={bag.name}
                                aria-current={isActive ? "true" : undefined}
                                className="rail-item group flex shrink-0 cursor-pointer snap-center flex-col items-center gap-1.5 outline-none lg:gap-[0.4vw]"
                            >
                                <span
                                    className={`relative block h-[78px] w-[64px] overflow-hidden rounded-[1.1rem] bg-[#fffaf6] transition-[transform,box-shadow,opacity] duration-300 group-focus-visible:ring-2 group-focus-visible:ring-[#9B0209] lg:h-[5vw] lg:w-[4.2vw] lg:rounded-[0.9vw] ${
                                        isActive
                                            ? "-translate-y-1 opacity-100 shadow-[0_10px_18px_-8px_rgba(106,3,9,0.55)] ring-2 ring-[#9B0209]"
                                            : "opacity-70 ring-1 ring-[#9B0209]/15 group-hover:-translate-y-0.5 group-hover:opacity-100"
                                    }`}
                                >
                                    <Thumb bag={bag} />
                                </span>
                                <span className={`font-modern-negra max-w-[72px] truncate text-[13px] leading-none transition-colors duration-300 lg:max-w-[6vw] lg:text-[clamp(11px,1.05vw,17px)] ${isActive ? "text-[#9B0209]" : "text-black/50 group-hover:text-[#9B0209]"}`}>
                                    {bag.name}
                                </span>
                            </button>
                        );
                    })}
                </nav>
            </div>
            {/* desktop: which bag you are on, out of how many */}
            <p className="font-numerals absolute right-[4vw] top-[11.6vw] z-20 hidden text-[clamp(14px,1.3vw,22px)] text-[#9B0209] lg:block" aria-hidden="true">
                {String(currentIndex + 1).padStart(2, "0")}<span className="mx-1 opacity-40">/</span><span className="opacity-60">{String(totalCocktails).padStart(2, "0")}</span>
            </p>
            <div className="content" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                <div className="arrows">
                    <button className="text-left" onClick={() => goToSlide(currentIndex - 1)}>
                        <span>{prevCocktail.name}</span>
                        <img src="/images-webp/right-arrow.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </button>

                    <button className="text-left" onClick={() => goToSlide(currentIndex + 1)}>
                        <span>{nextCocktail.name}</span>
                        <img src="/images-webp/left-arrow.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
                    </button>

                </div>
                <div className="cocktail">
                    {/* ADDED: the name, big and faded, BEHIND the bag */}
                    <div className="bag-name" aria-hidden="true">
                        <span>{currentCocktail.name}</span>
                    </div>
                    {/* key = new <img> per photo, so the previous bag never lingers while the next one downloads */}
                    <img key={currentImage} className="object-contain" src={currentImage} alt={currentCocktail.name} decoding="async"/>
                </div>
                <div className="recipe">
                    <div className="recipe-inner">
                        <div ref={contentRef} className="info">
                            <p id="title">
                                {currentCocktail.name}
                            </p>
                            {(onSale || regularPrice != null) && (
                                <div className="bag-price">
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
                        </div>
                        <div className="details">
                            {/* 3 lines max, then "..." (the full text is on the product page) */}
                            <p className="line-clamp-3">
                                {tr(currentCocktail, "description")}
                            </p>
                            {/* swatches under the description (phones and computers) */}
                            {renderSwatches("")}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:flex-col lg:items-start lg:gap-[0.8vw]">
                                <button
                                    type="button"
                                    onClick={() => setOrderOpen(true)}
                                    className="group relative cursor-pointer rounded-full bg-[#9B0209] px-6 lg:w-[14vw] lg:min-w-44 py-2.5 text-xs uppercase tracking-[0.2em] text-[#f7f2ea] transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-[#6f0107] active:translate-y-0 lg:px-[1.8vw] lg:py-[0.75vw] lg:text-[clamp(11px,0.85vw,15px)]"
                                >
                                    {/* soft ring that pulses now and then */}
                                    <span aria-hidden="true" className="cta-pulse pointer-events-none absolute inset-0 rounded-full border-2 border-[#9B0209]" />
                                    {t("product.order")}
                                </button>
                                <Link
                                    to={`/bag/${currentCocktail.slug ?? currentCocktail.id}`}
                                    className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#9B0209] px-6 lg:w-[14vw] lg:min-w-44 py-2.5 text-xs uppercase tracking-[0.2em] text-[#9B0209] transition-[transform,background-color,color] duration-300 hover:-translate-y-0.5 hover:bg-[#9B0209] hover:text-[#f7f2ea] active:translate-y-0 lg:gap-[0.6vw] lg:px-[1.8vw] lg:py-[0.75vw] lg:text-[clamp(11px,0.85vw,15px)]"
                                >
                                    {t("menu.discover")}
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="cta-arrow w-4 lg:w-[1.1vw] lg:min-w-4">
                                        <path d="M4 12h16M14 6l6 6-6 6" />
                                    </svg>
                                </Link>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* rendered in <body>, so the moving columns of this section can never shift it */}
            {orderOpen && createPortal(
                <OrderSheet message={message} emailHref={emailHref} onClose={() => setOrderOpen(false)} />,
                document.body
            )}
        </section>
    );
};

// loads the bags from Supabase, then renders the original Menu untouched
const Menu = () => {
    const { sliderLists, loading, discount } = useProducts();
    // placeholder keeps #menu in the page (same height) while loading
    if (loading || !sliderLists.length) return <section id="menu" aria-busy="true" className="min-h-[680px] lg:min-h-0" />;
    return <MenuContent sliderLists={sliderLists} discount={discount} />;
};

export default Menu;