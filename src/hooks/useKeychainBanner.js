import { useEffect, useState } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { supabase, imageUrl } from "../lib/supabase.js";

let request = null; // one tiny request, cached

// stop waiting after 6 s: the banner is decoration, the home page must never wait for it
const withTimeout = (promise, ms = 6000) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), ms))]);

const fetchBanner = () => {
    if (!request) {
        request = (async () => {
            if (!supabase) throw new Error("Supabase env vars missing");

            // ONE call, ONE row, only the columns the banner shows
            const { data, error } = await supabase
                .from("keychain_banner")
                .select("image_path, eyebrow, eyebrow_fr, title, title_fr, subtitle, subtitle_fr, button, button_fr, plate, plate_fr, tagline, tagline_fr, active")
                .eq("id", 1)
                .maybeSingle();
            if (error) throw error;
            if (!data || !data.active) return null;

            return {
                image: imageUrl((data.image_path || "").trim()),
                eyebrow: data.eyebrow,
                title: data.title,
                subtitle: data.subtitle,
                button: data.button,
                plate: data.plate,
                tagline: data.tagline,
                fr: {
                    eyebrow: data.eyebrow_fr, title: data.title_fr, subtitle: data.subtitle_fr,
                    button: data.button_fr, plate: data.plate_fr, tagline: data.tagline_fr,
                },
            };
        })();
    }
    return request;
};

export default function useKeychainBanner() {
    const [state, setState] = useState({ banner: null, loading: true });

    useEffect(() => {
        let alive = true;
        withTimeout(fetchBanner())
            .then((banner) => alive && setState({ banner, loading: false }))
            .catch((err) => {
                console.error("[useKeychainBanner]", err);
                request = null;
                if (alive) setState({ banner: null, loading: false });   // no banner = nothing shown, nothing breaks
            });
        return () => { alive = false; };
    }, []);

    // the banner adds height once loaded -> recalculate the scroll animations below it
    useEffect(() => {
        if (state.banner) requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [state.banner]);

    return state;
}