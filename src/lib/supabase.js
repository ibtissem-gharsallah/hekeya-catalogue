import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const imageUrl = (path) =>
    path ? supabase.storage.from("products").getPublicUrl(path).data.publicUrl : "";