import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
export const LanguageToggle = ({ locale, currentPath }) => {
    return (_jsxs("form", { method: "post", action: "/set-locale", class: "language-toggle", children: [_jsx("input", { type: "hidden", name: "redirect", value: currentPath }), _jsxs("select", { name: "locale", class: "language-select", onchange: "this.form.submit()", children: [_jsx("option", { value: "en_US", selected: locale === "en_US", children: "\uD83C\uDDFA\uD83C\uDDF8 English" }), _jsx("option", { value: "de_DE", selected: locale === "de_DE", children: "\uD83C\uDDE9\uD83C\uDDEA Deutsch" })] }), _jsx("noscript", { children: _jsx("button", { type: "submit", children: "Go" }) })] }));
};
