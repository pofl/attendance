import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { AttendeeForm } from "../components/AttendeeForm.js";
import { getTranslations } from "../i18n.js";
import { Layout } from "./Layout.js";
export const CockpitPage = ({ attendees, locale }) => {
    const t = getTranslations(locale);
    return (_jsxs(Layout, { locale: locale, currentPath: "/cockpit", children: [_jsx("h1", { children: t.cockpitPage.title }), _jsxs("section", { class: "card mb-3", children: [_jsx("h2", { children: t.cockpitPage.createNew }), _jsxs("form", { method: "post", action: "/cockpit/attendees", class: "form-card", children: [_jsxs("label", { children: [t.cockpitPage.name, ":", _jsx("input", { type: "text", name: "name", required: true, placeholder: t.cockpitPage.namePlaceholder })] }), _jsx("button", { type: "submit", children: t.cockpitPage.createButton })] })] }), _jsxs("section", { class: "mt-2", children: [_jsxs("h2", { children: [t.cockpitPage.existingAttendees, " (", attendees.length, ")"] }), attendees.length === 0 ? (_jsx("p", { children: t.cockpitPage.noAttendees })) : (attendees.map((attendee) => (_jsxs("details", { class: "accordion", children: [_jsx("summary", { class: "accordion-header", children: attendee.name }), _jsx("div", { class: "accordion-content", children: _jsx(AttendeeForm, { attendee: attendee, locale: locale }) })] }, attendee.id))))] })] }));
};
