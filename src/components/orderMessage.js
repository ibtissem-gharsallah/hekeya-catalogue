import { CONTACT_EMAIL } from "../../constants/contact.js";

/*
  Builds the ready-to-send order message (+ the e-mail fallback link).
  customFee = a number when the client chose the custom design card (the price passed must already include it).
  Used by the Menu and Keychains sections; the texts come from i18n  ->  order.msg.*
*/

const money = (n) => `${n} DT`;

export default function buildOrder({ t, name, slug, kindPath = "bag", colour, colourLabel, price, dimensions, customFee }) {
    const sizeText = [
        dimensions?.height && `${t("menu.height")} ${dimensions.height}`,
        dimensions?.width && `${t("menu.width")} ${dimensions.width}`,
    ].filter(Boolean).join(" · ");

    // the link opens the product page on this exact colour
    const url = `${window.location.origin}/${kindPath}/${slug}${colour ? `?color=${encodeURIComponent(String(colour).toLowerCase())}` : ""}`;

    const message = [
        t("order.msg.hello"),
        t("order.msg.intro"),
        "",
        `• ${t("order.msg.product", { name })}`,
        colourLabel ? `• ${t("order.msg.colour", { colour: colourLabel })}` : false,
        customFee != null ? `• ${t("order.msg.customCard", { fee: money(customFee) })}` : false,
        price != null ? `• ${t("order.msg.price", { price: money(price) })}` : false,
        sizeText ? `• ${t("order.msg.size", { size: sizeText })}` : false,
        `• ${t("order.msg.link", { url })}`,
        "",
        t("order.msg.thanks"),
    ].filter((line) => line !== false).join("\n");

    const emailHref = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t("product.orderSubject", { name }))}&body=${encodeURIComponent(message)}`;
    return { message, emailHref };
}