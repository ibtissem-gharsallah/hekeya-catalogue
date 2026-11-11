// link titles live in i18n/en.js and i18n/fr.js  ->  nav.<id>
//   id   = the id of the section in the page (never shown to visitors, keep it as is)
//   slug = what visitors see in the address bar  ->  hekeya.com/#bags
const navLinks = [
    { id: "menu", slug: "bags" },
    { id: "cocktails", slug: "timeline" },
    { id: "keychains", slug: "keychains" },
    { id: "catalogue-cta", slug: "catalogue" },
    { id: "contact", slug: "contact" },
];

// "bags" -> "menu" (a slug that is not listed above is used as the id itself, e.g. "keychains", "care")
const anchorId = (slug) => navLinks.find((l) => l.slug === slug)?.id ?? slug;

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