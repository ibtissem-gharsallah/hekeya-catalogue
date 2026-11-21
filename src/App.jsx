import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { anchorId } from "../constants/Index.js";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import Cocktails from "./components/Cocktails.jsx";
import Contact from "./components/Contact.jsx";
import WaveSeparator from "./components/WaveSeparator.jsx";
import CatalogueCta from "./components/CatalogueCta.jsx";
import Spotlight from "./components/Spotlight.jsx";
import Care from "./components/Care.jsx";
import KeychainBanner from "./components/KeychainBanner.jsx";
import BagBanner from "./components/BagBanner.jsx";
import CardsBanner from "./components/CardsBanner.jsx";

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

const Home = () => (
    <>
        <Hero/>
        <WaveSeparator/>
        <Spotlight/>
        <WaveSeparator/>
        <Cocktails/>
        <WaveSeparator/>
        <BagBanner/>
        <WaveSeparator/>
        <KeychainBanner/>
        <WaveSeparator/>
        <CardsBanner/>
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <CatalogueCta/>
        <WaveSeparator/>
        <Contact/>
    </>
);

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
        <div className="pt-24 lg:pt-[7vw]"><Menu/></div>
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <Contact/>
    </>
);

// the keychains section on its own page (top padding = room for the fixed navbar)
const KeychainsPage = () => (
    <>
        <div className="pt-24 lg:pt-[7vw]"><Keychains/></div>
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