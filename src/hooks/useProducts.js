import { useEffect, useState } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { supabase, imageUrl } from "../lib/supabase.js";

let request = null; // one request shared by Menu and Cocktails

// download every bag / colour photo in the background so a swatch click shows instantly
const preloadImages = (sliderLists) => {
    sliderLists.forEach((p) => {
        [p.image, ...(p.colors || []).map((c) => c.image)].forEach((src) => {
            if (!src) return;
            const img = new Image();
            img.decoding = "async";
            img.src = src;
        });
    });
};

// stop waiting after 8 s if the network hangs
const withTimeout = (promise, ms = 8000) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), ms))]);

const fetchProducts = () => {
    if (!request) {
        request = (async () => {
            if (!supabase) throw new Error("Supabase env vars missing");

            const { data, error } = await supabase
                .from("products")
                .select("*, product_colors(*)")
                .order("sort_order")
                .order("sort_order", { referencedTable: "product_colors" });

            if (error) throw error;
            if (!data?.length) throw new Error("No products returned");

            const sliderLists = data.map((p) => ({
                id: p.id,
                name: p.name,
                image: imageUrl(p.image_path),
                title: p.title,
                description: p.description,
                dimensions: { height: p.height, width: p.width },
                material: p.material,
                colors: (p.product_colors || []).map((c) => ({
                    name: c.name,
                    hex: c.hex,
                    image: imageUrl(c.image_path),
                })),
            }));

            preloadImages(sliderLists);

            return {
                sliderLists, // same shape Menu.jsx already uses
                // same shape Cocktails.jsx already uses
                cocktailLists: data.map((p) => ({
                    name: p.name,
                    detail: p.detail,
                    price: p.lead_time,
                })),
            };
        })();
    }
    return request;
};

export default function useProducts() {
    const [state, setState] = useState({ sliderLists: [], cocktailLists: [], loading: true, error: null });

    useEffect(() => {
        let alive = true;
        withTimeout(fetchProducts())
            .then((result) => {
                if (alive) setState({ ...result, loading: false, error: null });
            })
            .catch((err) => {
                console.error("[useProducts] could not load products:", err);
                request = null; // allow a retry on next mount
                if (alive) setState({ sliderLists: [], cocktailLists: [], loading: false, error: err });
            });
        return () => { alive = false; };
    }, []);

    // content height changed after loading -> recalculate every scroll animation
    useEffect(() => {
        if (!state.loading) requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [state.loading]);

    return state;
}