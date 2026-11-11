"use client"
import React, {useRef, useState} from 'react';
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import useProducts from "../hooks/useProducts.js";
import {useGSAP} from "@gsap/react";
import  gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import OrderSheet from "./OrderSheet.jsx";
import buildOrder from "./orderMessage.js";
const MenuContent = ({ sliderLists, discount }) => {
    const { t, tr, colorName } = useT();
    const contentRef =useRef();
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

    // the same swatches are rendered twice: under the description on phones, under the bag photo on desktop
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
            <nav className="cocktail-tabs text-black" aria-label={t("menu.navLabel")}>
                {sliderLists.map((cocktail, index) => {
                    const isActive= index === currentIndex;
                    return (
                        <button key={cocktail.id} className={`${isActive ?'text-[#9B0209] border-[#9B0209]':'text-black/45 border-transparent'}`} onClick={()=>goToSlide(index)
                        }> {cocktail.name} </button>
                    )
                })}
            </nav>
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
                    {/* desktop: swatches under the bag photo */}
                    {renderSwatches("hidden lg:flex")}
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
                            {/* phones: swatches under the description */}
                            {renderSwatches("lg:hidden")}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                <button
                                    type="button"
                                    onClick={() => setOrderOpen(true)}
                                    className="cursor-pointer rounded-full bg-[#9B0209] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#f7f2ea] transition-colors duration-300 hover:bg-[#6f0107] lg:px-[1.8vw] lg:py-[0.75vw] lg:text-[clamp(11px,0.85vw,15px)]"
                                >
                                    {t("product.order")}
                                </button>
                                <Link to={`/bag/${currentCocktail.slug ?? currentCocktail.id}`} className="discover">{t("menu.discover")}</Link>
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