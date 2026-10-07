import React from 'react';
import useProducts from "../hooks/useProducts.js";
import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
const Cocktails = () => {
    // CHANGED: list now comes from Supabase (was imported from constants/Index.js)
    const { cocktailLists } = useProducts();

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
            <img src="/images/hook-left.png" alt="l-leaf" id="c-left-leaf" />
            <img src="/images/hook-right.png" alt="r-leaf" id="c-right-leaf" />

            {/* ADDED: measuring tape, centered behind the list */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                <div className="tape-float">
                    <div className="tape-wrap">
                        {/* CHANGED: mobile height is now a % of the section (was h-[40vh]) so it stays centred on the list */}
                        <img src="/images/tape.png" alt="" aria-hidden="true"
                             className="h-[55%] md:h-[65%] max-h-[500px] w-auto drop-shadow-xl" />
                    </div>
                </div>
            </div>

            <div className="list justify-center">
                <div className="popular">
                    <h2 className="text-center py-2 text-red-800 text-bold">Worth The Wait:</h2>

                    <ul>
                        {cocktailLists.map(({ name,  detail, price }) => (
                            <li key={name}>
                                <div className="md:me-28">
                                    <h3 className="text-red-700">{name}</h3>
                                    <p> {detail}</p>
                                </div>
                                <span> {price}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

export default Cocktails;