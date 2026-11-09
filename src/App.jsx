import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import Cocktails from "./components/Cocktails.jsx";
import Menu from "./components/Menu.jsx";
import Contact from "./components/Contact.jsx";
import WaveSeparator from "./components/WaveSeparator.jsx";
import CatalogueCta from "./components/CatalogueCta.jsx";
import Spotlight from "./components/Spotlight.jsx";
import Care from "./components/Care.jsx";
import Keychains from "./components/Keychains.jsx";
import { BagPage, KeychainPage } from "./components/ProductPage.jsx";
gsap.registerPlugin(ScrollTrigger,SplitText);

// new page -> back to the top; a link like /#contact -> scroll to that section
const ScrollManager = () => {
    const { pathname, hash, key } = useLocation();
    useEffect(() => {
        let tries = 0;
        let timer;
        if (hash) {
            const go = () => {
                const el = document.getElementById(hash.slice(1));
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else if (tries++ < 20) timer = setTimeout(go, 100);   // section not rendered yet (data loading)
            };
            go();
        } else {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
        // the new page has a different height: recalculate every scroll animation
        const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
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
        <Menu/>
        <WaveSeparator/>
        <Keychains/>
        <WaveSeparator/>
        <Care/>
        <WaveSeparator/>
        <CatalogueCta/>
        <WaveSeparator/>
        <Contact/>
    </>
);

// product pages: same nav at the top, same footer at the bottom
const ProductLayout = ({ children }) => (
    <>
        {children}
        <WaveSeparator/>
        <Contact/>
    </>
);

const App = () => {
    return (
        <main>
            <ScrollManager/>
            <NavBar/>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/bag/:slug" element={<ProductLayout><BagPage/></ProductLayout>}/>
                <Route path="/keychain/:slug" element={<ProductLayout><KeychainPage/></ProductLayout>}/>
                <Route path="*" element={<Home/>}/>
            </Routes>
        </main>
    )
}

export default App;