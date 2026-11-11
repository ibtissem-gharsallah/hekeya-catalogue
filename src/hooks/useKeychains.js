import { useEffect, useState } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { supabase, imageUrl } from "../lib/supabase.js";

let request = null; // one request, shared and cached

// stop waiting after 8 s if the network hangs
const withTimeout = (promise, ms = 8000) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), ms))]);

const fetchKeychains = () => {
    if (!request) {
        request = (async () => {
            if (!supabase) throw new Error("Supabase env vars missing");

            const { data, error } = await supabase
                .from("keychains")
                .select("*, keychain_images(*)")
                .order("sort_order")
                .order("id")
                .order("sort_order", { referencedTable: "keychain_images" });
            if (error) throw error;

            const num = (v) => (v == null ? null : Number(v));

            return (data || []).map((k) => {
                // all the photos of the keychain, first = cover. No rows in keychain_images -> the single image_path is used.
                const images = (k.keychain_images || []).map((i) => imageUrl(i.image_path)).filter(Boolean);
                if (!images.length && k.image_path) images.push(imageUrl(k.image_path));

                return {
                    id: k.id,
                    slug: k.slug,
                    name: k.name,
                    image: images[0] || "",     // cover (home carousel)
                    images,                     // every photo (product page)
                    description: k.description,
                    fr: { description: k.description_fr },   // French text (empty -> English is shown)
                    dimensions: { height: k.height, width: k.width },
                    price: num(k.price),
                };
            });
        })();
    }
    return request;
};

export default function useKeychains() {
    const [state, setState] = useState({ keychains: [], loading: true, error: null });

    useEffect(() => {
        let alive = true;
        withTimeout(fetchKeychains())
            .then((keychains) => {
                if (alive) setState({ keychains, loading: false, error: null });
            })
            .catch((err) => {
                console.error("[useKeychains] could not load keychains:", err);
                request = null; // allow a retry on next mount
                if (alive) setState({ keychains: [], loading: false, error: err });
            });
        return () => { alive = false; };
    }, []);

    // content height changed after loading -> recalculate every scroll animation
    useEffect(() => {
        if (!state.loading) requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [state.loading]);

    return state;
}