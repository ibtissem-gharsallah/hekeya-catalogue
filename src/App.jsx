import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { anchorId } from "../constants/Index.js";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import WaveSeparator from "./components/WaveSeparator.jsx";

// the home sections below the hero are separate downloads (chunks): the first download only has the navbar and the hero.
// The Supabase library is only used by these sections, so it leaves the first download too.
const Cocktails = lazy(() => import("./components/Cocktails.jsx"));
const Spotlight = lazy(() => import("./components/Spotlight.jsx"));
const Care = lazy(() => import("./components/Care.jsx"));
const KeychainBanner = lazy(() => import("./components/KeychainBanner.jsx"));
const BagBanner = lazy(() => import("./components/BagBanner.jsx"));
const CardsBanner = lazy(() => import("./components/CardsBanner.jsx"));
const CatalogueCta = lazy(() => import("./components/CatalogueCta.jsx"));
const Contact = lazy(() => import("./components/Contact.jsx"));

// once the hero is on screen and the browser is idle, download those chunks quietly,
// so they are already there when the visitor scrolls (no waiting, no pop-in)
const warmUp = () => {
    const go = () => [
        import("./components/Spotlight.jsx"), import("./components/Cocktails.jsx"),
        import("./components/BagBanner.jsx"), import("./components/KeychainBanner.jsx"),
        import("./components/CardsBanner.jsx"), import("./components/Care.jsx"),
        import("./components/CatalogueCta.jsx"), import("./components/Contact.jsx"),
        // and send the products request now, so the Spotlight / bags have their data when the visitor arrives
        import("./hooks/useProducts.js").then((m) => m.prefetchProducts()),
    ];
    if (document.readyState === "complete") ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 2000));
    else window.addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 2000)), { once: true });
};
if (typeof window !== "undefined") warmUp();

// these pages are only downloaded when the visitor opens them: the home page stays light
const Menu = lazy(() => import("./components/Menu.jsx"));
const Keychains = lazy(() => import("./components/Keychains.jsx"));
const CardsPage = lazy(() => import("./components/CardsPage.jsx"));
const BagPage = lazy(() => import("./components/ProductPage.jsx").then((m) => ({ default: m.BagPage })));
const KeychainPage = lazy(() => import("./components/ProductPage.jsx").then((m) => ({ default: m.KeychainPage })));
gsap.registerPlugin(ScrollTrigger,SplitText);

// new page -> back to the top; a link like /#bags -> scroll to that section
const ScrollManager = () => {
    const { pathname, hash, key } = useLocation();
    const lastPath = useRef(null);
    useEffect(() => {
        const newPage = lastPath.current !== pathname;   // a link inside the same page changes nothing in the page height
        lastPath.current = pathname;
        let tries = 0;
        let timer;
        let raf;
        if (hash) {
            const go = () => {
                const el = document.getElementById(anchorId(hash.slice(1)));
                if (el) {
                    // recalculate the scroll animations BEFORE scrolling: doing it during the scroll cancels it
                    if (newPage) ScrollTrigger.refresh();
                    el.scrollIntoView({ behavior: "smooth" });
                } else if (tries++ < 20) timer = setTimeout(go, 100);   // section not rendered yet (data loading)
            };
            go();
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            if (newPage) raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        }
        return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
    }, [pathname, hash, key]);
    return null;
};

/*
  <Later> keeps a section OFF the page until the visitor is about to reach it (300px before).
  Until then only an empty box (same id, about the same height) is drawn, so nothing jumps and links like /#contact still work.
  Why: every section runs its own data request and its own GSAP / ScrollTrigger setup when it appears.
  Doing that for the whole home page at once was what froze the phone (Lighthouse: high Total Blocking Time).
  `eager` = a link with a # opened the page: everything is drawn right away, so the scroll lands on the right spot.
  `early` = start 1500px before (the first sections below the hero, so they are ready when the visitor arrives).
  `className` = the empty box height (phone / computer), keep it close to the real section height.
*/
const Later = ({ id, className = "min-h-[600px] lg:min-h-[40vw]", eager = false, early = false, children }) => {
    const [seen, setSeen] = useState(false);
    const box = useRef(null);
    const visible = seen || eager;

    useEffect(() => {
        if (visible) return;
        const el = box.current;
        if (!el || !("IntersectionObserver" in window)) { setSeen(true); return; }
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect(); }
        }, { rootMargin: early ? "1500px 0px" : "300px 0px" });
        io.observe(el);
        return () => io.disconnect();
    }, [visible]);

    // the page got taller / shorter: recalculate the scroll animations
    useEffect(() => {
        if (!visible) return;
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        return () => cancelAnimationFrame(raf);
    }, [visible]);

    if (!visible) return <div ref={box} id={id} aria-hidden="true" className={className} />;
    // while the section's file is still downloading, keep the same empty box (no jump)
    return <Suspense fallback={<div id={id} aria-hidden="true" className={className} />}>{children}</Suspense>;
};

const Home = () => {
    const { hash } = useLocation();
    const eager = Boolean(hash);   // /#contact, /#timeline ...
    return (
        <>
            <Hero/>
            <WaveSeparator/>
            <Later id="spotlight" eager={eager} early className="min-h-[760px] lg:min-h-[48vw]"><Spotlight/></Later>
            <Later id="cards" eager={eager}><CardsBanner/></Later>
            <WaveSeparator/>
            <Later id="keychains" eager={eager}><KeychainBanner/></Later>
            <WaveSeparator/>
            <Later id="menu" eager={eager}><BagBanner/></Later>
            <WaveSeparator/>
            <Later id="cocktails" eager={eager} early className="min-h-dvh"><Cocktails/></Later>
            <WaveSeparator/>
            <Later id="care" eager={eager}><Care/></Later>
            <WaveSeparator/>
            <Later id="catalogue-cta" eager={eager} className="min-h-[520px] lg:min-h-[32vw]"><CatalogueCta/></Later>
            <WaveSeparator/>
            <Later id="contact" eager={eager} className="min-h-[520px] lg:min-h-[30vw]"><Contact/></Later>
        </>
    );
};

// product pages: same nav at the top, then the Care section, then the same footer
const ProductLayout = ({ children }) => (
    <>
        {children}
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <Contact/>
    </>
);

// the bags (Menu) on their own page
const BagsPage = () => (
    <>
        <div className="pt-14 md:pt-24 lg:pt-[7vw] max-md:[&_#menu]:pt-2"><Menu/></div>
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <Contact/>
    </>
);

// the keychains section on its own page (top padding = room for the fixed navbar)
const KeychainsPage = () => (
    <>
        <div className="pt-14 md:pt-24 lg:pt-[7vw] max-md:[&_#keychains]:pt-4"><Keychains/></div>
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <Contact/>
    </>
);

const App = () => {
    return (
        <main>
            <ScrollManager/>
            <NavBar/>
            <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true"/>}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/bags" element={<BagsPage/>}/>
                    <Route path="/keychains" element={<KeychainsPage/>}/>
                    <Route path="/cards" element={<ProductLayout><CardsPage/></ProductLayout>}/>
                    <Route path="/bag/:slug" element={<ProductLayout><BagPage/></ProductLayout>}/>
                    <Route path="/keychain/:slug" element={<ProductLayout><KeychainPage/></ProductLayout>}/>
                    <Route path="*" element={<Home/>}/>
                </Routes>
            </Suspense>
        </main>
    )
}

export default App;