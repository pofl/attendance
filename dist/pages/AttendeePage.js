import { jsxs as _jsxs, jsx as _jsx } from "hono/jsx/jsx-runtime";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations } from "../i18n.js";
import { Layout } from "./Layout.js";
export const AttendeePage = ({ attendee, locale }) => {
    const t = getTranslations(locale);
    return (_jsxs(Layout, { locale: locale, currentPath: `/attendees/${encodeURIComponent(attendee.name)}`, children: [_jsxs("h1", { children: [t.attendeePage.title, ": ", attendee.name] }), _jsx(AttendeeForm, { attendee: attendee, locale: locale })] }));
};
