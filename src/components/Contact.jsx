import React from 'react';
import { socials} from "../../constants/Index.js";
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText';
import gsap from 'gsap';
import { useT } from "../../i18n/LanguageContext.jsx";

const Contact = () => {
    const { t, lang } = useT();

    useGSAP(() => {
        const titleSplit = SplitText.create('#contact h2', { type: 'words' });

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#contact',
                start: 'top center',
            },
            ease: "power1.inOut"
        })

        timeline
            .from(titleSplit.words, {
                opacity: 0, yPercent: 100, stagger: 0.02
            })
            .from('#contact h3, #contact p', {
                opacity: 0, yPercent: 100, stagger: 0.02
            })
            .to('#f-right-leaf', {
                y: '-50', duration: 1, ease: 'power1.inOut'
            }).to('#f-left-leaf', {
            y: '-50', duration: 1, ease: 'power1.inOut'
        }, '<')
    }, { dependencies: [lang], revertOnUpdate: true })   // title is split again when the language changes
    return (
        <footer id="contact" className="bg-[#F7F2EA]">
            <img src="/images-webp/hero-right-leaf.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="f-right-leaf" className="hidden md:block"/>
            <img src="/images-webp/hero-left-leaf.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" id="f-left-leaf" className="hidden md:block"/>
            <div className="content">
                <h2 key={lang} className="text-[#9B0209]">{t("contact.title")}</h2>


                <div>
                    <h3>{t("contact.contactUs")}</h3>
                    <p>hekeya.store@gmail.com</p>
                </div>
                <div>
                    <h3>{t("contact.socials")}</h3>

                    <div className="flex-center gap-5">
                        {socials.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.name}
                            >
                                <img src={social.icon} alt="" aria-hidden="true" width="80" height="80" loading="lazy" decoding="async" className="h-20 w-20"/>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Contact;