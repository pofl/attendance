import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Layout } from "./Layout.js";
import { AttendeeForm } from "./AttendeeForm.js";
export const CockpitPage = ({ attendees }) => {
    return (_jsxs(Layout, { children: [_jsx("h1", { children: "Cockpit - All Attendees" }), attendees.length === 0 ? (_jsx("p", { children: "No attendees found." })) : (attendees.map((attendee) => (_jsx("div", { style: { marginBottom: "2rem" }, children: _jsx(AttendeeForm, { attendee: attendee }) }, attendee.id))))] }));
};
