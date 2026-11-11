import React, { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useT } from "../../i18n/LanguageContext.jsx";

/*
  "Order now" sheet: explains why orders go through a chat, shows the ready-to-send message,
  and opens Instagram / Messenger. (Instagram cannot pre-fill text, so the message is copied for the visitor.)
  Phones: slides up from the bottom. Computers: centered window.
*/

const copyText = async (text, field) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        try {                                   // older browsers / in-app browsers
            field?.focus();
            field?.select();
            return document.execCommand("copy");
        } catch {
            return false;
        }
    }
};

const Check = () => (
    <svg viewBox="0 0 24 24" className="mt-[3px] size-[18px] shrink-0" fill="none" stroke="#9B0209" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12.5l5 5L20 6.5" />
    </svg>
);

const OrderSheet = ({ message, emailHref, onClose }) => {
    const { t } = useT();
    const root = useRef(null);
    const panel = useRef(null);
    const field = useRef(null);
    const closeBtn = useRef(null);
    const opener = useRef(document.activeElement);   // give the focus back when the sheet closes
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);

    const desktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;

    // opening animation
    useGSAP(
        () => {
            gsap.fromTo(".os-backdrop", { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
            gsap.fromTo(
                panel.current,
                desktop ? { opacity: 0, y: 30, scale: 0.97 } : { yPercent: 100 },
                desktop ? { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" } : { yPercent: 0, duration: 0.6, ease: "power3.out" }
            );
            gsap.from(".os-item", { opacity: 0, y: 16, stagger: 0.06, duration: 0.6, ease: "power3.out", delay: 0.25 });
        },
        { scope: root }
    );

    // close with a short animation, then really close
    const close = () => {
        gsap.to(".os-backdrop", { opacity: 0, duration: 0.25 });
        gsap.to(panel.current, {
            ...(desktop ? { opacity: 0, y: 20, scale: 0.98 } : { yPercent: 100 }),
            duration: 0.3,
            ease: "power2.in",
            onComplete: onClose,
        });
    };

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";           // the page behind must not scroll
        closeBtn.current?.focus();
        const o = opener.current;
        return () => {
            document.body.style.overflow = prevOverflow;
            clearTimeout(timer.current);
            o?.focus?.();
        };
    }, []);

    const onKeyDown = (e) => {
        if (e.key === "Escape") { close(); return; }
        if (e.key !== "Tab") return;
        // keep the keyboard focus inside the sheet
        const items = panel.current.querySelectorAll('a[href], button, textarea, [tabindex]:not([tabindex="-1"])');
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const doCopy = async () => {
        const ok = await copyText(message, field.current);
        setCopied(ok);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 2600);
    };

    const points = [t("order.point1"), t("order.point2"), t("order.point3")];
    const steps = [t("order.step1"), t("order.step2"), t("order.step3")];

    return (
        <div ref={root} className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6" onKeyDown={onKeyDown}>
            <div className="os-backdrop absolute inset-0 bg-[#3d0208]/55 backdrop-blur-[2px]" onClick={close} aria-hidden="true" />

            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="order-title"
                className="relative z-10 max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[2rem] bg-[#f7f2ea] px-6 pb-8 pt-8 shadow-2xl md:max-w-[600px] md:rounded-[2rem] md:px-10 md:pb-10"
            >
                <button
                    ref={closeBtn}
                    type="button"
                    onClick={close}
                    aria-label={t("order.close")}
                    className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-[#9B0209]/40 text-[#9B0209] transition-colors duration-300 hover:bg-[#9B0209] hover:text-[#f7f2ea]"
                >
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>

                <p className="os-item text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9B0209]">{t("order.eyebrow")}</p>
                <h2 id="order-title" className="os-item font-modern-negra mt-2 pr-10 text-4xl leading-[0.95] text-[#9B0209] md:text-5xl">{t("order.title")}</h2>

                <p className="os-item mt-4 text-[15px] leading-relaxed text-black/80">{t("order.why")}</p>
                <ul className="os-item mt-4 space-y-2">
                    {points.map((p) => (
                        <li key={p} className="flex gap-3 text-[15px] leading-snug text-[#3a0a10]"><Check /><span>{p}</span></li>
                    ))}
                </ul>

                <h3 className="os-item font-serif mt-7 text-xl text-[#9B0209]">{t("order.stepsTitle")}</h3>
                <ol className="os-item mt-3 space-y-2">
                    {steps.map((s, i) => (
                        <li key={s} className="flex items-start gap-3 text-[15px] leading-snug text-black/85">
                            <span className="font-numerals mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-[#9B0209] text-[13px] leading-none text-[#f7f2ea]">{i + 1}</span>
                            <span>{s}</span>
                        </li>
                    ))}
                </ol>

                {/* the ready-to-send message */}
                <div className="os-item mt-6">
                    <label htmlFor="order-message" className="text-[11px] uppercase tracking-[0.2em] text-black/60">{t("order.messageLabel")}</label>
                    <textarea
                        id="order-message"
                        ref={field}
                        readOnly
                        value={message}
                        rows={8}
                        onFocus={(e) => e.target.select()}
                        className="mt-2 w-full resize-none rounded-2xl border border-[#9B0209]/30 bg-white/60 p-4 text-[14px] leading-relaxed text-black/85 outline-none focus:border-[#9B0209]"
                    />
                    <button
                        type="button"
                        onClick={doCopy}
                        className={`mt-2 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300 ${
                            copied ? "border-[#9B0209] bg-[#9B0209] text-[#f7f2ea]" : "border-[#9B0209] text-[#9B0209] hover:bg-[#9B0209] hover:text-[#f7f2ea]"
                        }`}
                    >
                        {copied ? t("order.copied") : t("order.copy")}
                    </button>
                    <span className="sr-only" aria-live="polite">{copied ? t("order.copied") : ""}</span>
                </div>

                {/* where to send it: plain text, no buttons */}
                <div className="os-item mt-6 rounded-2xl bg-[#9B0209]/[0.07] p-4 text-center">
                    <p className="text-[15px] leading-snug text-[#3a0a10]">{t("order.sendText")}</p>
                    <p className="mt-2 font-serif text-lg text-[#9B0209]">{t("order.sendWhere")}</p>
                </div>
                <a href={emailHref} className="os-item mt-4 block text-center font-serif text-base italic text-[#9B0209] underline-offset-4 hover:underline">{t("order.email")}</a>
            </div>
        </div>
    );
};

export default OrderSheet;