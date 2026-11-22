import React from "react";
import HomeBanner from "./HomeBanner.jsx";

// bags banner on the home page: its texts + photo live in the Supabase table bag_banner
// id="menu" keeps the navbar "Bags" link and the hero "Explore bags" button scrolling here
const BagBanner = () => <HomeBanner table="bag_banner" to="/bags" id="menu" inlineTitle bigPhoto trimPhoto />;

export default BagBanner;