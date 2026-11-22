import React from "react";
import HomeBanner from "./HomeBanner.jsx";

// keychains banner on the home page: its texts + photo live in the Supabase table keychain_banner
const KeychainBanner = () => <HomeBanner table="keychain_banner" to="/keychains" id="keychains" />;

export default KeychainBanner;