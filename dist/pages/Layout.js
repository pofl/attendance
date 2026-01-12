import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { LanguageToggle } from "../components/LanguageToggle.js";
import { getTranslations } from "../i18n.js";
export const Layout = (props) => {
    const locale = props.locale ?? "en_US";
    const t = getTranslations(locale);
    const showToggle = props.showLanguageToggle !== false;
    return (_jsxs("html", { lang: locale.replace("_", "-"), children: [_jsxs("head", { children: [_jsx("meta", { charset: "UTF-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), _jsx("title", { children: t.common.appTitle }), _jsx("script", { src: "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" }), _jsx("link", { rel: "stylesheet", href: "/static/styles.css" })] }), _jsxs("body", { children: [showToggle && props.currentPath && (_jsx(LanguageToggle, { locale: locale, currentPath: props.currentPath })), props.children] })] }));
};
