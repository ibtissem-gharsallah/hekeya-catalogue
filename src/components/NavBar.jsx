import React from 'react';
import {navLinks} from "../../constants/Index.js";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
const NavBar = () => {
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
                backgroundColor:"rgba(247,242,234,0.55)",
                backgroundFilter:"blur(50px)",
                duration:1,
                ease:"power1.inOut"

            });
    });
    return (
        <nav>
            <div className="mx-2">

                {/* CHANGED: logo image instead of the text */}
                <img src="/images/hekeya-logo.png" alt="Hekeya" className="logo" />


                <ul>
                    {navLinks.map((link) => (
                        <li key={link.id}>
                            {/* FIXED: was `#{link.id}` (missing the $), so it linked to the literal text "#{link.id}" */}
                            <a className="text-black" href={`#${link.id}`}>{link.title}</a>

                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default NavBar;