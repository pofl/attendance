import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { Layout } from "./Layout.js";
export const CockpitPage = ({ attendees }) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Cockpit - All Attendees" }), attendees.length === 0 ? (_jsx("p", { children: "No attendees found." })) : (attendees.map((attendee) => (_jsxs("details", { class: "accordion", children: [_jsx("summary", { class: "accordion-header", children: attendee.name }), _jsx("div", { class: "accordion-content", children: _jsx(AttendeeForm, { attendee: attendee }) })] }, attendee.id))))] }));
};
