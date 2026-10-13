import React from 'react';
import useProducts from "../hooks/useProducts.js";
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { useT } from "../../i18n/LanguageContext.jsx";
const Cocktails = () => {
    // CHANGED: list now comes from Supabase (was imported from constants/Index.js)
    const { cocktailLists } = useProducts();
    const { t, tr } = useT();

    useGSAP(() => {
        const parallaxTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#cocktails',
                start: 'top 30%',
                end: 'bottom 80%',
                scrub: true,
            }
        })

        parallaxTimeline
            .from('#c-left-leaf', {
                x: -100, y: 100
            })
            .from('#c-right-leaf', {
                x: 100, y: 100
            })

        // ADDED: the tape unrolls from top to bottom as you scroll,
        // straightens up slightly, then keeps floating gently
        gsap.timeline({
            scrollTrigger: {
                trigger: '#cocktails',
                start: 'top 70%',
                end: 'bottom 70%',
                scrub: 1,
            }
        })
            .fromTo('.tape-wrap',
                { clipPath: 'inset(0% 0% 100% 0%)', rotate: -8, scale: 0.9 },
                { clipPath: 'inset(0% 0% 0% 0%)', rotate: 0, scale: 1, ease: 'none' }
            )

        gsap.to('.tape-float', {
            y: -14, rotate: 1.5, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1
        })
    })
    return (
        <section id="cocktails" >
            <img src="/images-webp/hook-left.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="c-left-leaf" />
            <img src="/images-webp/hook-right.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="c-right-leaf" />

            {/* ADDED: measuring tape, centered behind the list */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <div className="tape-float">
                    <div className="tape-wrap">
                        {/* CHANGED: mobile height is now a % of the section (was h-[40vh]) so it stays centred on the list */}
                        <img src="/images-webp/tape.webp" alt="" aria-hidden="true" loading="lazy" decoding="async"
                             className="h-[55%] md:h-[65%] max-h-[500px] w-auto drop-shadow-xl" />
                    </div>
                </div>
            </div>

            <div className="list justify-center">
                <div className="popular">
                    <h2 className="text-center py-2 text-red-800 text-bold">{t("cocktails.title")}</h2>

                    <ul>
                        {cocktailLists.map((item) => (
                            <li key={item.name}>
                                <div className="md:me-28">
                                    <h3 className="text-red-700">{item.name}</h3>
                                    <p> {tr(item, "detail")}</p>
                                </div>
                                <span> {tr(item, "price")}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Cocktails;