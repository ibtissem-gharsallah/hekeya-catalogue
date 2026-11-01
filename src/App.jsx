import React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import Cocktails from "./components/Cocktails.jsx";
import Menu from "./components/Menu.jsx";
import Contact from "./components/Contact.jsx";
import LaunchOffer from "./components/LaunchOffer.jsx";
import WaveSeparator from "./components/WaveSeparator.jsx";
import CatalogueCta from "./components/CatalogueCta.jsx";
import Spotlight from "./components/Spotlight.jsx";
import Care from "./components/Care.jsx";
gsap.registerPlugin(ScrollTrigger,SplitText);
const App = () => {
    return (
        <main>
            <NavBar/>
            <Hero/>
            <WaveSeparator/>
            <Spotlight/>
            <WaveSeparator/>
            <Cocktails/>
            <WaveSeparator/>
            <Menu/>
            <WaveSeparator/>
            <Care/>
            <WaveSeparator/>
            <CatalogueCta/>
            <WaveSeparator/>
            <Contact/>

        </main>
    )
}

export default App;