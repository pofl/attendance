import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Layout } from "./Layout.js";
export const IndexPage = (props) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Hello Hono!" }), _jsx("ul", { children: props.messages.map((message) => {
                    return _jsxs("li", { children: [message, "!!"] });
                }) }), _jsx("button", { "hx-get": "/hello", "hx-swap": "afterend", children: "Load" }), _jsx("div", { "hx-get": "/part/attendee/Florian", "hx-trigger": "load", "hx-swap": "innerHTML", children: "Florian" })] }));
};
