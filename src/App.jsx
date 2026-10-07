import React from 'react';
import gsap from 'gsap';
import{ScrollTrigger,SplitText} from "gsap/all";
import NavBar from "./components/NavBar.jsx";
import Hero from "./components/Hero.jsx";
import Cocktails from "./components/Cocktails.jsx";
import Menu from "./components/Menu.jsx";
import Contact from "./components/Contact.jsx";
import LaunchOffer from "./components/LaunchOffer.jsx";
import WaveSeparator from "./components/WaveSeparator.jsx";
import CatalogueCta from "./components/CatalogueCta.jsx";
gsap.registerPlugin(ScrollTrigger,SplitText);
const App = () => {
    return (
        <main>
            <NavBar/>
            <Hero/>
            <WaveSeparator/>
            <LaunchOffer/>
            <WaveSeparator/>
            <Cocktails/>
            <WaveSeparator/>
            <Menu/>
            <WaveSeparator/>
            <CatalogueCta/>
            <WaveSeparator/>
            <Contact/>

        </main>
    )
}

export default App;