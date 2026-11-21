import React from "react";
import HomeBanner from "./HomeBanner.jsx";

// home-page banner for the couples' playing cards: texts + photo live in the Supabase table cards_banner
// (set active = false in that table to hide it). The button opens /cards (the product page, built next).
const CardsBanner = () => (
    <HomeBanner table="cards_banner" to="/cards" id="cards" bigPhoto centerPhoto floatingCards trimPhoto splitLast titleHeart />
);

export default CardsBanner;