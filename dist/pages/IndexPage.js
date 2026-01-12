import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { getTranslations } from "../i18n.js";
import { Layout } from "./Layout.js";
export const IndexPage = ({ locale }) => {
    const t = getTranslations(locale);
    return (_jsxs(Layout, { locale: locale, currentPath: "/", children: [_jsx("h1", { children: t.indexPage.title }), _jsxs("form", { action: "/attendee", method: "post", class: "form-card", children: [_jsxs("label", { children: [t.indexPage.enterName, ":", _jsx("input", { type: "text", name: "name", placeholder: t.indexPage.namePlaceholder, required: true, autofocus: true })] }), _jsx("button", { type: "submit", children: t.indexPage.go })] })] }));
};
