import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
const app = new Hono();
const Layout = (props) => {
    return (_jsxs("html", { children: [_jsx("head", { children: _jsx("script", { src: "https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js" }) }), _jsx("body", { children: props.children })] }));
};
const Top = (props) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Hello Hono!" }), _jsx("ul", { children: props.messages.map((message) => {
                    return _jsxs("li", { children: [message, "!!"] });
                }) }), _jsx("button", { "hx-get": "/hello", "hx-target": "body", "hx-swap": "afterend", children: "Load" })] }));
};
app.get("/", (c) => {
    const messages = ["Good Morning", "Good Evening", "Good Night"];
    return c.html(_jsx(Top, { messages: messages }));
});
app.get("/hello", (c) => {
    return c.html(_jsx("p", { children: "\"Hello Hono!\"" }));
});
serve({
    fetch: app.fetch,
    port: 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
