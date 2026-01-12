import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Layout } from "./Layout.js";
export const IndexPage = () => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Attendance" }), _jsxs("form", { action: "/attendee", method: "post", children: [_jsxs("label", { children: ["Enter attendee name:", _jsx("input", { type: "text", name: "name", placeholder: "Name", required: true, autofocus: true })] }), _jsx("button", { type: "submit", children: "Go" })] })] }));
};
