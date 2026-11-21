import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import {navLinks} from "../../constants/Index.js";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";
import LanguageSwitcher from "../../i18n/LanguageSwitcher.jsx";

/*
  Phones: one slim bar (menu button on the left, logo in the centre, EN | FR on the right), the links open in a panel under it.
  Computers / tablets (768px and up): same navbar as before.
  (index.css has a rule "nav div { ... }", so inside <nav> only the first div is used, the rest are span / ul / li.)
*/
const NavBar = () => {
    const { t } = useT();
    const [open, setOpen] = useState(false);

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

    // Escape closes the menu
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <nav>
            <div className="mx-2 max-md:grid max-md:grid-cols-[1fr_auto_1fr] max-md:items-center max-md:gap-2 max-md:py-0.5">

                {/* phones only, left: menu button */}
                <button
                    type="button"
                    aria-label="Menu"
                    aria-expanded={open}
                    aria-controls="nav-links"
                    onClick={() => setOpen((o) => !o)}
                    className="relative size-10 cursor-pointer justify-self-start text-[#910009] md:hidden"
                >
                    <span className={`absolute left-2.5 top-[14px] h-[2px] w-5 rounded bg-current transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                    <span className={`absolute left-2.5 top-[20px] h-[2px] w-5 rounded bg-current transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
                    <span className={`absolute left-2.5 top-[26px] h-[2px] w-5 rounded bg-current transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
                </button>

                {/* logo: centre on phones */}
                <Link to="/" aria-label="Hekeya" onClick={() => setOpen(false)}>
                    <img src="/images-webp/hekeya-logo.webp" alt="Hekeya" className="logo max-md:mx-0 max-md:h-9" />
                </Link>

                {/* phones only, right: language */}
                <span className="justify-self-end md:hidden">
                    <LanguageSwitcher />
                </span>

                <ul
                    id="nav-links"
                    className={`max-md:absolute max-md:inset-x-0 max-md:top-full max-md:flex-col max-md:gap-1 max-md:bg-[#f7f2ea] max-md:pb-4 max-md:pt-1 max-md:shadow-md max-md:transition-all max-md:duration-300 ${
                        open ? "max-md:translate-y-0 max-md:opacity-100" : "max-md:pointer-events-none max-md:invisible max-md:-translate-y-2 max-md:opacity-0"
                    }`}
                >
                    {navLinks.map((link) => (
                        <li key={link.id}>
                            {/* a page (/bags, /keychains, /cards) or a section of the home page (/#timeline, App.jsx turns it back into the section id) */}
                            <Link className="text-black max-md:block max-md:py-2 max-md:text-lg" to={link.to ?? `/#${link.slug}`} onClick={() => setOpen(false)}>{t(`nav.${link.id}`)}</Link>
                        </li>
                    ))}
                    <li className="max-md:hidden"><LanguageSwitcher /></li>
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;