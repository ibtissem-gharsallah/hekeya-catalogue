"use client"
import React, {useRef, useState} from 'react';
import useProducts from "../hooks/useProducts.js";
import {useGSAP} from "@gsap/react";
import  gsap from "gsap";
const MenuContent = ({ sliderLists }) => {
    const contentRef =useRef();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [colorIndex, setColorIndex] = useState(0);
    useGSAP(()=>{

        gsap.fromTo('#title',{
            opacity:0,

        },{
            opacity:1,duration:1,
        });
        gsap.fromTo('.cocktail img',{
            opacity:0,
            xPercent:-100,

        },{
            xPercent:0,
            opacity:1,
            duration:1,
            ease:"power1.inOut"
        });
        gsap.fromTo('.details p',{yPercent:100,opacity:0},{
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
            .to(".m-left-leaf", { y: -200 }, 0)
            .to(".recipe", { y: 100 }, 0);
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
    const goToSlide = (index) => {
        const  newIndex=(index+totalCocktails)%totalCocktails;
        setCurrentIndex(newIndex);
        setColorIndex(0);
    }
    const getCocktailAt= (indexOffset)=>{
        return sliderLists[(currentIndex+indexOffset+totalCocktails)%totalCocktails];
    }
    const  currentCocktail=getCocktailAt(0);
    const prevCocktail=getCocktailAt(-1);
    const nextCocktail = getCocktailAt(1)
    const colors = currentCocktail.colors || [];
    const currentImage = colors[colorIndex]?.image || currentCocktail.image;
    return (
        <section id="menu" aria-labelledby="menu-heading">
            {/* CHANGED: yarn balls instead of leaves (still styled by #m-left-leaf / #m-right-leaf) */}
            <img src="/images/yarn-left.webp" alt="" aria-hidden="true" id="m-left-leaf" />
            <img src="/images/yarn-right.webp" alt="" aria-hidden="true" id="m-right-leaf" />
            {/* CHANGED: visible heading (was sr-only) */}
            <header className="menu-head">
                <p>Our Bags</p>
                <h2 id="menu-heading">Find Your Hekeya</h2>
            </header>
            <nav className="cocktail-tabs text-black" aria-label="Cocktail Navigation">
                {sliderLists.map((cocktail, index) => {
                    const isActive= index === currentIndex;
                    return (
                        <button key={cocktail.id} className={`${isActive ?'text-[#9B0209] border-[#9B0209]':'text-black/45 border-transparent'}`} onClick={()=>goToSlide(index)
                        }> {cocktail.name} </button>
                    )
                })}
            </nav>
            <div className="content">
                <div className="arrows">
                    <button className="text-left" onClick={() => goToSlide(currentIndex - 1)}>
                        <span>{prevCocktail.name}</span>
                        <img src="/images-webp/right-arrow.webp" alt="right-arrow" aria-hidden="true" />
                    </button>

                    <button className="text-left" onClick={() => goToSlide(currentIndex + 1)}>
                        <span>{nextCocktail.name}</span>
                        <img src="/images-webp/left-arrow.webp" alt="left-arrow" aria-hidden="true" />
                    </button>

                </div>
                <div className="cocktail">
                    {/* ADDED: the name, big and faded, BEHIND the bag */}
                    <div className="bag-name" aria-hidden="true">
                        <span>{currentCocktail.name}</span>
                    </div>
                    {/* key = new <img> per photo, so the previous bag never lingers while the next one downloads */}
                    <img key={currentImage} className="object-contain" src={currentImage} alt={currentCocktail.name}/>
                </div>
                <div className="recipe">
                    <div className="recipe-inner">
                        <div ref={contentRef} className="info">
                            <p id="title">
                                {currentCocktail.name}
                            </p>
                        </div>
                        <div className="details">
                            <p>
                                {currentCocktail.description}
                            </p>
                            {colors.length > 1 && (
                                <div className="swatches" role="group" aria-label="Colours">
                                    {colors.map((color, i) => (
                                        <button
                                            key={color.name}
                                            type="button"
                                            aria-label={color.name}
                                            aria-pressed={i === colorIndex}
                                            onClick={() => setColorIndex(i)}
                                            style={{ backgroundColor: color.hex }}
                                            className={`swatch ${i === colorIndex ? 'is-active' : ''}`}
                                        />
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

// loads the bags from Supabase, then renders the original Menu untouched
const Menu = () => {
    const { sliderLists, loading } = useProducts();
    // placeholder keeps #menu in the page (same height) while loading
    if (loading || !sliderLists.length) return <section id="menu" aria-busy="true" />;
    return <MenuContent sliderLists={sliderLists} />;
};

export default Menu;