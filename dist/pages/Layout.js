import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
export const Layout = (props) => {
    return (_jsxs("html", { children: [_jsxs("head", { children: [_jsx("meta", { charset: "UTF-8" }), _jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), _jsx("title", { children: "Attendance" }), _jsx("script", { src: "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" }), _jsx("link", { rel: "stylesheet", href: "/static/styles.css" })] }), _jsx("body", { children: props.children })] }));
};
