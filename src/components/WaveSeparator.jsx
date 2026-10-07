import React, { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

/*
  <WaveSeparator />  —  burgundy textile ribbon + loose yarn strand, sits between two sections.

  Props (all optional)
    color        ribbon colour                          default "#8a0610"
    strandColor  thin yarn colour                       default "#6a0309"
    height       desktop height (any CSS length)        default "clamp(140px, 15vw, 240px)"
    mobileHeight mobile height                          default "96px"
    direction    "right" | "left"  — which side the reveal starts from and whether
                 the shape is mirrored                  default "right"
    texture      true / false  — knitted fabric texture default true
    intensity    0 = still, 1 = default, 2 = stronger   default 1
    overlap      how far it pulls into the sections above/below (CSS length) default "0px"
    className    extra classes

  To change the shape later, edit the two `SHAPES` objects below (plain Bézier paths).
*/

/* ---- shapes: edit these paths to reshape the ribbon / strand ---- */
const SHAPES = {
    desktop: {
        viewBox: "0 0 1600 240",
        // closed ribbon: top edge left→right, then bottom edge right→left
        ribbon:
            "M -60 30 C 140 24, 260 120, 500 140 C 720 158, 820 66, 1050 84 C 1260 100, 1400 150, 1660 50 " +
            "L 1660 150 C 1440 236, 1280 198, 1050 176 C 830 156, 700 232, 480 222 C 280 212, 150 130, -60 118 Z",
        // loose strand: follows the top edge, drifts away, touches it again
        strand:
            "M -60 10 C 150 4, 280 100, 520 124 C 740 146, 850 40, 1070 64 C 1280 88, 1440 128, 1660 24",
        // second tiny end that frays off the ribbon (right side)
        fray: "M 1190 92 C 1240 62, 1300 52, 1340 68 C 1370 80, 1360 100, 1334 96",
    },
    mobile: {
        viewBox: "0 0 800 200",
        ribbon:
            "M -40 50 C 120 30, 230 118, 400 104 C 540 92, 620 66, 840 120 " +
            "L 840 172 C 650 204, 540 154, 400 168 C 250 182, 130 130, -40 118 Z",
        strand: "M -40 28 C 130 8, 240 96, 410 82 C 560 70, 640 44, 840 98",
        fray: "M 560 88 C 590 64, 640 56, 664 70",
    },
};

const Layer = ({ shape, color, strandColor, texture, uid, part }) => {
    const knit = `${uid}-knit`;
    const clip = `${uid}-clip`;
    const grain = `${uid}-grain`;
    const tone = `${uid}-tone`;

    if (part === "strand") {
        return (
            <svg
                viewBox={shape.viewBox}
                preserveAspectRatio="none"
                className="absolute inset-y-0 -left-[10%] w-[120%] h-full overflow-visible"
                fill="none"
                aria-hidden="true"
            >
                <path
                    className="wave-strand-main"
                    d={shape.strand}
                    stroke={strandColor}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    pathLength="1"
                    strokeDasharray="1"
                />
                <path
                    className="wave-strand-fray"
                    d={shape.fray}
                    stroke={strandColor}
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    opacity="0.9"
                />
            </svg>
        );
    }

    return (
        <svg
            viewBox={shape.viewBox}
            preserveAspectRatio="none"
            className="absolute inset-y-0 -left-[10%] w-[120%] h-full overflow-visible"
            aria-hidden="true"
        >
            <defs>
                <clipPath id={clip}>
                    <path d={shape.ribbon} />
                </clipPath>

                {/* soft tonal variation (very close shades of the same red, not a visible gradient) */}
                <linearGradient id={tone} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#000" stopOpacity="0.18" />
                    <stop offset="0.35" stopColor="#fff" stopOpacity="0.05" />
                    <stop offset="0.7" stopColor="#000" stopOpacity="0.1" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
                </linearGradient>

                {/* knitted "V" stitches */}
                <pattern id={knit} width="14" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(-6)">
                    <path d="M1 1 L7 10 L13 1" stroke="#000" strokeOpacity="0.28" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1 3.2 L7 12 L13 3.2" stroke="#fff" strokeOpacity="0.09" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </pattern>

                {/* fine fibre grain */}
                <filter id={grain} x="0" y="0" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="7" result="n" />
                    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 -0.28" />
                </filter>
            </defs>

            <path d={shape.ribbon} fill={color} />

            {texture && (
                <g clipPath={`url(#${clip})`}>
                    <rect x="-100" y="-20" width="1900" height="320" fill={`url(#${tone})`} />
                    <rect x="-100" y="-20" width="1900" height="320" fill={`url(#${knit})`} opacity="0.55" />
                    <rect x="-100" y="-20" width="1900" height="320" filter={`url(#${grain})`} opacity="0.55" />
                </g>
            )}

            {/* thin lit edge on top so it reads as thick material */}
            <path
                d={shape.ribbon}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.10"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                clipPath={`url(#${clip})`}
            />
        </svg>
    );
};

const WaveSeparator = ({
                           color = "#8a0610",
                           strandColor = "#6a0309",
                           height = "clamp(140px, 15vw, 240px)",
                           mobileHeight = "96px",
                           direction = "right",
                           texture = true,
                           intensity = 1,
                           overlap = "0px",
                           className = "",
                       }) => {
    const root = useRef(null);
    const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
    const fromLeft = direction === "left";
    const i = Math.max(0, intensity);

    useGSAP(
        () => {
            const mm = gsap.matchMedia();

            mm.add("all", () => {   // "all" = always run, even if the phone has Reduce Motion on
                // entry: strand draws first, ribbon is revealed horizontally, then both settle
                // (when direction="left" the whole thing is mirrored, so the reveal mirrors with it)
                const hidden = "inset(0 100% 0 0)";
                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    scrollTrigger: { trigger: root.current, start: "top 88%", once: true },
                });
                tl.fromTo(".wave-strand-main", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3 }, 0)
                    .fromTo(".wave-strand-fray", { opacity: 0 }, { opacity: 0.9, duration: 0.8 }, 0.7)
                    .fromTo(".wave-ribbon-reveal", { clipPath: hidden }, { clipPath: "inset(0 0% 0 0%)", duration: 1.5, ease: "power2.inOut", clearProps: "clipPath" }, 0.2);

                if (i > 0) {
                    // slow, organic floating — the two layers never move together
                    tl.add(() => {
                        gsap.to(".wave-ribbon-float", { x: 16 * i, y: 5 * i, rotate: 0.18 * i, duration: 8, ease: "sine.inOut", yoyo: true, repeat: -1 });
                        gsap.to(".wave-strand-float", { x: -22 * i, y: -7 * i, rotate: -0.25 * i, duration: 11, ease: "sine.inOut", yoyo: true, repeat: -1 });
                    }, 1.2);

                    // scroll parallax: barely noticeable, different speeds
                    const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 1 };
                    gsap.fromTo(".wave-ribbon-par", { x: 18 * i, y: -4 * i }, { x: -18 * i, y: 6 * i, ease: "none", scrollTrigger: scrub });
                    gsap.fromTo(".wave-strand-par", { x: -34 * i, y: 6 * i }, { x: 34 * i, y: -10 * i, ease: "none", scrollTrigger: scrub });
                }
            });
        },
        { scope: root, dependencies: [fromLeft, i] }
    );

    const flip = fromLeft ? { transform: "scaleX(-1)" } : undefined;

    return (
        <div
            ref={root}
            aria-hidden="true"
            className={`relative z-20 w-full pointer-events-none h-[var(--wh-m)] md:h-[var(--wh)] ${className}`}
            style={{
                "--wh": height,
                "--wh-m": mobileHeight,
                marginTop: `calc(${overlap} * -1)`,
                marginBottom: `calc(${overlap} * -1)`,
                overflowX: "clip",
            }}
        >
            {["desktop", "mobile"].map((key) => (
                <div
                    key={key}
                    className={key === "desktop" ? "hidden md:block absolute inset-0" : "md:hidden absolute inset-0"}
                    style={flip}
                >
                    {/* ribbon: parallax > reveal > float */}
                    <div className="wave-ribbon-par absolute inset-0">
                        <div className="wave-ribbon-reveal absolute inset-0">
                            <div className="wave-ribbon-float absolute inset-0">
                                <Layer shape={SHAPES[key]} color={color} strandColor={strandColor} texture={texture} uid={`${uid}${key}`} part="ribbon" />
                            </div>
                        </div>
                    </div>
                    {/* strand: its own parallax + float, different speed */}
                    <div className="wave-strand-par absolute inset-0">
                        <div className="wave-strand-float absolute inset-0">
                            <Layer shape={SHAPES[key]} color={color} strandColor={strandColor} texture={texture} uid={`${uid}${key}`} part="strand" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WaveSeparator;