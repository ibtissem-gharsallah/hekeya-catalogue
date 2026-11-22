import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/*
  Playing cards (rummy cards) scattered BEHIND the photo of the cards banner, in different sizes.
  - pure decoration: drawn in SVG, no image to load, no Supabase call
  - they fly in one by one when the banner appears, then float slowly; each one drifts at its own speed when you scroll
  - w / left / top are in % of the photo box, so everything follows the photo on every screen size
  - to change the cards: edit the CARDS list below (rank + suit, size, position, tilt, blur)
*/

const RED = "#9B0209";
const GOLD = "#d4a24c";

// suit shapes, drawn in a 24 x 24 box
const SUITS = {
    heart: "M12 21 C4 14 2 9 5 6 C8 3.5 11 5 12 7.5 C13 5 16 3.5 19 6 C22 9 20 14 12 21 Z",
    diamond: "M12 2 L21 12 L12 22 L3 12 Z",
};
const Suit = ({ kind, x, y, size, rotate = 0, fill = RED }) => (
    <path d={SUITS[kind]} fill={fill} transform={`translate(${x} ${y}) rotate(${rotate} ${size / 2} ${size / 2}) scale(${size / 24})`} />
);

const Face = ({ rank, suit }) => (
    <>
        <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="#fffaf6" stroke={RED} strokeOpacity="0.55" strokeWidth="2" />
        <rect x="6" y="6" width="88" height="128" rx="5" fill="none" stroke={GOLD} strokeOpacity="0.55" strokeWidth="1" />
        {/* top-left corner */}
        <text x="12" y="25" fontSize="17" fontWeight="700" fill={RED} fontFamily="'DM Serif Display', Georgia, serif">{rank}</text>
        <Suit kind={suit} x={11} y={29} size={11} />
        {/* bottom-right corner (upside down) */}
        <g transform="rotate(180 50 70)">
            <text x="12" y="25" fontSize="17" fontWeight="700" fill={RED} fontFamily="'DM Serif Display', Georgia, serif">{rank}</text>
            <Suit kind={suit} x={11} y={29} size={11} />
        </g>
        {/* the big suit in the middle */}
        <Suit kind={suit} x={29} y={47} size={42} />
    </>
);

const Back = () => (
    <>
        <rect x="1.5" y="1.5" width="97" height="137" rx="9" fill="#8a0610" stroke="#5c030a" strokeWidth="2" />
        <rect x="8" y="8" width="84" height="124" rx="5" fill="none" stroke={GOLD} strokeOpacity="0.8" strokeWidth="1.2" />
        {/* diamond lattice */}
        <g stroke={GOLD} strokeOpacity="0.28" strokeWidth="1">
            {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((d) => (
                <React.Fragment key={d}>
                    <path d={`M${50 + d - 90} 8 L${50 + d + 90} 132`} />
                    <path d={`M${50 + d + 90} 8 L${50 + d - 90} 132`} />
                </React.Fragment>
            ))}
        </g>
        <circle cx="50" cy="70" r="17" fill="#8a0610" stroke={GOLD} strokeOpacity="0.8" strokeWidth="1.2" />
        <Suit kind="heart" x={37} y={57} size={26} fill={GOLD} />
    </>
);

// w / left / top = % of the photo box, rot = tilt in degrees, blur = depth (px), speed = scroll drift
const CARDS = [
    { back: true,            w: 30, left: -15, top: 16, rot: -16, blur: 0,   speed: 50 },
    { rank: "A", suit: "heart",   w: 22, left: -4,  top: 62, rot: 10,  blur: 0,   speed: -30 },
    { rank: "K", suit: "diamond", w: 26, left: 82,  top: 6,  rot: 18,  blur: 0,   speed: -50 },
    { rank: "Q", suit: "heart",   w: 21, left: 88,  top: 50, rot: -12, blur: 0,   speed: 35 },
    { rank: "7", suit: "diamond", w: 17, left: 70,  top: 72, rot: 22,  blur: 1.5, speed: -25 },
    { rank: "A", suit: "diamond", w: 14, left: 22,  top: 78, rot: -24, blur: 1.5, speed: 40 },
    { rank: "J", suit: "heart",   w: 13, left: 6,   top: 4,  rot: -8,  blur: 2.2, speed: -35 },
];

const FloatingCards = () => {
    const root = useRef(null);

    useGSAP(
        () => {
            const cards = gsap.utils.toArray(".kb-pcard");
            cards.forEach((el) => gsap.set(el, { rotation: Number(el.dataset.rot) }));   // tilt, even without animation

            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                // they fly in one by one, from a bit below, spinning slightly
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 90, scale: 0.6, rotation: (i, el) => Number(el.dataset.rot) + (i % 2 ? 35 : -35) },
                    {
                        opacity: 1, y: 0, scale: 1, rotation: (i, el) => Number(el.dataset.rot),
                        duration: 1.3, ease: "back.out(1.5)", stagger: 0.14,
                        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
                    }
                );
                // then each one floats at its own rhythm
                gsap.utils.toArray(".kb-pc-float").forEach((el, i) => {
                    gsap.to(el, {
                        y: (i % 2 ? -1 : 1) * (9 + (i % 3) * 4),
                        rotation: (i % 2 ? 1 : -1) * (2 + (i % 3)),
                        duration: 3.4 + i * 0.55,
                        ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2,
                    });
                });
                // and drifts while the page scrolls: bigger / nearer cards move more
                gsap.utils.toArray(".kb-pc-drift").forEach((el) => {
                    gsap.to(el, {
                        y: Number(el.dataset.speed),
                        ease: "none",
                        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
                    });
                });
            });
        },
        { scope: root }
    );

    return (
        <div ref={root} className="pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
            {CARDS.map((c, i) => (
                <div key={i} className="kb-pc-drift absolute" data-speed={c.speed} style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${c.w}%` }}>
                    <div className="kb-pcard opacity-0" data-rot={c.rot}>
                        <div className="kb-pc-float">
                            <svg viewBox="0 0 100 140" className="block w-full drop-shadow-[0_10px_14px_rgba(106,3,9,0.28)]" style={c.blur ? { filter: `blur(${c.blur}px)` } : undefined}>
                                {c.back ? <Back /> : <Face rank={c.rank} suit={c.suit} />}
                            </svg>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FloatingCards;