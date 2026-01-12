import { jsxs as _jsxs, jsx as _jsx } from "hono/jsx/jsx-runtime";
import { Layout } from "./Layout.js";
import { AttendeeForm } from "./AttendeeForm.js";
export const AttendeePage = ({ attendee }) => {
    return (_jsxs(Layout, { children: [_jsxs("h1", { children: ["Attendee: ", attendee.name] }), _jsx(AttendeeForm, { attendee: attendee })] }));
};
