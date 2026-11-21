/*
  <WaveSeparator />  —  one thin burgundy wavy line between two sections. No animation, no GSAP.

  Props (all optional, the old ones still work so nothing else has to change)
    color        line colour                            default "#9B0209"
    height       desktop height (any CSS length)        default "clamp(90px, 10vw, 160px)"
    mobileHeight mobile height                          default "64px"
    direction    "right" | "left"  — "left" mirrors the wave   default "right"
    overlap      how far it pulls into the sections above/below (CSS length) default "0px"
    className    extra classes

  Other old props (strandColor, texture, intensity) are accepted and ignored.
  To change the shape, edit the two paths in SHAPES.
*/

const SHAPES = {
    desktop: { viewBox: "0 0 1600 160", d: "M -10 20 C 200 24, 380 110, 640 128 C 880 144, 1000 112, 1180 84 C 1360 56, 1500 34, 1610 30" },
    mobile: { viewBox: "0 0 800 120", d: "M -10 30 C 140 24, 260 96, 400 90 C 540 84, 640 44, 810 48" },
};

const WaveSeparator = ({
                           color = "#9B0209",
                           height = "clamp(90px, 10vw, 160px)",
                           mobileHeight = "64px",
                           direction = "right",
                           overlap = "0px",
                           className = "",
                       }) => {
    const flip = direction === "left" ? { transform: "scaleX(-1)" } : undefined;

    return (
        <div
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
            {Object.entries(SHAPES).map(([key, shape]) => (
                <svg
                    key={key}
                    viewBox={shape.viewBox}
                    preserveAspectRatio="none"
                    fill="none"
                    className={`absolute inset-0 h-full w-full overflow-visible ${key === "desktop" ? "hidden md:block" : "md:hidden"}`}
                    style={flip}
                >
                    <path
                        d={shape.d}
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            ))}
        </div>
    );
};

export default WaveSeparator;