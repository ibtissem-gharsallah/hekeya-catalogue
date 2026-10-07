const navLinks = [
    {
        id: "hero",
        title: "About Us",
    },
    {
        id: "offre",
        title: "Discount",
    },
    {
        id: "cocktails",
        title: "TimeLine",
    },
    {
        id: "menu",
        title: "Bags",
    },
    {
        id: "contact",
        title: "Contact",
    },
    {
        id: "catalogue-cta",
        title: "Catalogue",
    },
];

const cocktailLists = [
    {
        name: "Slay",
        detail: "Macrame",
        price: "1-2 Days",
    },
    {
        name: "Rosa",
        detail: "clim",
        price: "1 Day",
    },
    {
        name: "Perla",
        detail: "Macrame",
        price: "2-3 Days",
    },
    {
        name: "Glow",
        detail: "macrame",
        price: "2 Days",
    },
    {
        name: "Basic-B",
        detail: "macrame",
        price: "3-4 Days",
    },
];

const mockTailLists = [
    {
        name: "Tropical Bloom",
        country: "US",
        detail: "Battle",
        price: "$10",
    },
    {
        name: "Passionfruit Mint",
        country: "US",
        detail: "Battle",
        price: "$49",
    },
    {
        name: "Citrus Glow",
        country: "CA",
        detail: "750 ml",
        price: "$20",
    },
    {
        name: "Lavender Fizz",
        country: "IE",
        detail: "600 ml",
        price: "$29",
    },
];



const featureLists = [
    "Perfectly balanced blends",
    "Garnished to perfection",
    "Ice-cold every time",
    "Expertly shaken & stirred",
];

const goodLists = [
    "Handpicked ingredients",
    "Signature techniques",
    "Bartending artistry in action",
    "Freshly muddled flavors",
];


const openingHours = [
    { day: "Mon–Thu", time: "11:00am – 12am" },
    { day: "Fri", time: "11:00am – 2am" },
    { day: "Sat", time: "9:00am – 2am" },
    { day: "Sun", time: "9:00am – 1am" },
];

const socials = [
    {
        name: "Instagram",
        icon: "/images/ig.jpg",
        url: "#",
    },
    {
        name: "TikTok",
        icon: "/images/tiktok.jpg",
        url: "#",
    },
    {
        name: "Facebook",
        icon: "/images/fc.jpg",
        url: "#",
    },
];

const sliderLists = [
    {
        id: 1,
        name: "Slay",
        image: "/images/slay-bleu.png",

        title: "Made For Sun. Made To Slay.",

        description:
            "A hand-braided macramé beach bag with a soft inner lining, made to carry your summer essentials in effortless style. Lightweight, spacious, and designed for days by the sea.",

        dimensions: {
            height: "64 cm",
            width: "38 cm",
        },

        material: "Braided macramé with inner lining",

        colors: [
            { name: "Red",   hex: "#6eb8ff", image: "/images/slay-bleu.png" },
            { name: "Beige", hex: "#E6C27A", image: "/images/slay-beige.png" },
            { name: "Pink",  hex: "#F9A8D4", image: "/images/slay-pink.png" },
        ],
    },
    {
        id: 2,
        name: "Rosa",
        image: "/images/rosa.png",

        title: "Your Everyday Plus-One.",

        description:
            "Crocheted by hand with soft T-shirt yarn and finished with a stainless-steel gold chain. Rosa is the kind of everyday bag that quietly goes with everything — while still making sure she gets noticed.",

        dimensions: {
            height: "35 cm",
            width: "26 cm",
        },

        material: "Hand-crocheted T-shirt yarn with stainless-steel chain",
    },
    {
        id: 3,
        name: "Perla",
        image: "/images/perla.png",

        title: "A Classic With A Little Extra.",

        description:
            "A hand-crafted macramé bag with a structured base, a signature rounded handle, and delicate pearl details. Classic, chic, and made to become the bag you keep reaching for.",

        dimensions: {
            height: "20 cm",
            width: "23 cm",
        },

        material: "Hand-crafted macramé with structured base and pearl details",

        colors: [
            { name: "Beige", hex: "#E6D2B5", image: "/images/perla-beige.png" },
            { name: "Black", hex: "#171717", image: "/images/perla-black.png" },
            { name: "Burgundy", hex: "#7A1725", image: "/images/perla-burgundy.png" },
            { name: "Pink", hex: "#dc8b86", image: "/images/perla-pink.png" },
        ],
    },
    {
        id: 4,
        name: "Basic-B",
        image: "/images/basic-b.png",

        title: "Basic? Technically. Boring? Never.",

        description:
            "A structured macramé bag made for uni, work, and everything in between. Spacious, solid, and finished with an inner pocket for the small stuff you don't want disappearing into the bag.",

        dimensions: {
            height: "50 cm",
            width: "34 cm",
        },

        material: "Solid macramé with inner pocket",

        colors: [
            { name: "Black", hex: "#000000", image: "/images/basic-b.png" },
            { name: "Pink", hex: "#C98282", image: "/images/basic-b-pink.png" },
            { name: "Dark Brown", hex: "#4A3028", image: "/images/basic-b-brown.png" },
            { name: "Beige", hex: "#D8C2A5", image: "/images/basic-b-beige.png" },
        ],
    },
    {
        id: 5,
        name: "Glow",
        image: "/images/glow.png",

        title: "Everything That Makes You Glow.",

        description:
            "A compact hand-crafted macramé makeup bag made to keep your beauty essentials together. Small enough to take anywhere, spacious enough for the little things that make you feel like you.",

        dimensions: {
            height: "15 cm",
            width: "21 cm",
        },

        material: "Hand-crafted macramé",

        colors: [
            { name: "Beige", hex: "#E6D2B5", image: "/images/glow-beige.png" },
            { name: "Blue", hex: "#7DB7D9", image: "/images/glow-blue.png" },
            { name: "Pink", hex: "#F3A6B9", image: "/images/glow-pink.png" },
            { name: "Black", hex: "#171717", image: "/images/glow-black.png" },
        ],
    },
];

export {
    navLinks,
    cocktailLists,
    mockTailLists,
    featureLists,
    goodLists,
    openingHours,
   socials,
    sliderLists,
};