import React from 'react';
import { Link } from "react-router-dom";
import {navLinks} from "../../constants/Index.js";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import LanguageSwitcher from "../../i18n/LanguageSwitcher.jsx";
const NavBar = () => {
    const { t } = useT();
    useGSAP(()=>{
        const navTween=gsap.timeline({
            scrollTrigger:{
                trigger:"nav",
                start:"bottom top"
            }
        })
        navTween.fromTo("nav",{
                backgroundColor:"rgb(247,242,234)"},
            {
                backgroundColor:"rgb(247,242,234)",
                duration:1,
                ease:"power1.inOut"

            });
    });
    return (
        <nav>
            <div className="mx-2">

                {/* CHANGED: logo image instead of the text */}
                <Link to="/" aria-label="Hekeya">
                    <img src="/images-webp/hekeya-logo.webp" alt="Hekeya" className="logo" />
                </Link>


                <ul>
                    {navLinks.map((link) => (
                        <li key={link.id}>
                            {/* the address bar shows the nice name (/#bags); App.jsx turns it back into the section id */}
                            <Link className="text-black" to={`/#${link.slug}`}>{t(`nav.${link.id}`)}</Link>

                        </li>
                    ))}
                    <li><LanguageSwitcher /></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;