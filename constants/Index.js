// Navbar links. Titles live in i18n/en.js and i18n/fr.js  ->  nav.<id>
//   to   = the link opens that page      (Bags, Keychains, Gifts)
//   slug = the link scrolls to a section of the home page, the address bar shows hekeya.com/#timeline
//   id   = the id of the section in the home page (never shown to visitors) / the key of the title in nav.<id>
const navLinks = [
    { id: "menu", to: "/bags" },
    { id: "keychains", to: "/keychains" },
    { id: "gifts", to: "/cards" },
    { id: "cocktails", slug: "timeline" },
    { id: "contact", slug: "contact" },
];

// "timeline" -> "cocktails" (a slug that is not listed above is used as the id itself, e.g. "care").
// Old links like /#bags keep working: they scroll to the bags banner of the home page.
const oldLinks = { bags: "menu", catalogue: "catalogue-cta" };
const anchorId = (slug) => navLinks.find((l) => l.slug === slug)?.id ?? oldLinks[slug] ?? slug;

const socials = [
    {
        name: "Instagram",
        icon: "/images-webp/ig.webp",
        url: "https://www.instagram.com/hekeya.store?cplk=Y2g5cTFjNXRzbnd2&utm_source=qr",
    },
    {
        name: "TikTok",
        icon: "/images-webp/tiktok.webp",
        url: "https://www.tiktok.com/@hekeya_store?_r=1&_t=ZS-9Aa1TSIzIHq",
    },
    {
        name: "Facebook",
        icon: "/images-webp/fc.webp",
        url: "https://www.facebook.com/profile.php?id=61593991200196&mibextid=wwXIfr&mibextid=wwXIfr",
    },
];


export {
    navLinks,
    anchorId,
    socials,
};