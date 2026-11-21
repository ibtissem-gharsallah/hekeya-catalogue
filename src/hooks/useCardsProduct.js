import { useEffect, useState } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import { supabase, imageUrl } from "../lib/supabase.js";

/*
  The "Perfect gift" page data: ONE request to Supabase (product + variants), cached.
  Returns { product, variants, loading, error }. product = null when it is hidden (active = false).
*/

let request = null;

const withTimeout = (promise, ms = 8000) =>
    Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase timeout")), ms))]);

const num = (v) => (v == null ? null : Number(v));

const fetchCards = () => {
    if (!request) {
        request = (async () => {
            if (!supabase) throw new Error("Supabase env vars missing");

            const [productRes, variantsRes] = await Promise.all([
                supabase.from("cards_product").select("*").eq("id", 1).maybeSingle(),
                supabase
                    .from("cards_variants")
                    .select("*")
                    .order("sort_order")
                    .order("cards_count"),
            ]);
            if (productRes.error) throw productRes.error;
            if (variantsRes.error) throw variantsRes.error;

            const p = productRes.data;
            if (!p) return { product: null, variants: [] };

            const product = {
                name: p.name,
                tagline: p.tagline,
                leadDays: p.lead_days ?? 2,
                designFee: num(p.design_fee) ?? 0,
                fr: { name: p.name_fr, tagline: p.tagline_fr },
                // the photos are the same for every size
                photos: {
                    main: imageUrl(p.main_path),
                    box: {
                        front: imageUrl(p.box_front_path),
                        left: imageUrl(p.box_left_path),
                        right: imageUrl(p.box_right_path),
                        back: imageUrl(p.box_back_path),
                    },
                    card: { front: imageUrl(p.card_front_path), back: imageUrl(p.card_back_path) },
                    extra: imageUrl(p.extra_path),
                },
            };

            const variants = (variantsRes.data || []).map((v) => ({
                id: v.id,
                count: v.cards_count,
                price: num(v.price),
                description: v.description,
                fr: { description: v.description_fr },
            }));

            return { product, variants };
        })();
    }
    return request;
};

export default function useCardsProduct() {
    const [state, setState] = useState({ product: null, variants: [], loading: true, error: null });

    useEffect(() => {
        let alive = true;
        withTimeout(fetchCards())
            .then((d) => alive && setState({ ...d, loading: false, error: null }))
            .catch((err) => {
                console.error("[useCardsProduct] could not load the gift:", err);
                request = null;      // allow a retry on next mount
                if (alive) setState({ product: null, variants: [], loading: false, error: err });
            });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (!state.loading) requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [state.loading]);

    return state;
}