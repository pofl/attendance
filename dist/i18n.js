const en_US = {
    common: {
        appTitle: "Attendance",
        error: "Error",
        notFound: "Not Found",
    },
    indexPage: {
        title: "Attendance",
        enterName: "Enter attendee name",
        namePlaceholder: "Name",
        go: "Go",
    },
    attendeePage: {
        title: "Attendee",
        notFoundTitle: "Attendee Not Found",
        notFoundMessage: "No attendee found with name",
    },
    attendeeForm: {
        editTitle: "Edit Attendee",
        locale: "Locale",
        arrivalDate: "Arrival Date",
        arrivalFlight: "Arrival Flight",
        departureDate: "Departure Date",
        departureFlight: "Departure Flight",
        passportStatus: "Passport Status",
        visaStatus: "Visa Status",
        dietaryRequirements: "Dietary Requirements",
        save: "Save",
        passportOptions: {
            valid: "Valid",
            pending: "Pending",
            none: "None",
        },
        visaOptions: {
            obtained: "Obtained",
            pending: "Pending",
            none: "None",
        },
    },
    cockpitPage: {
        title: "Cockpit - All Attendees",
        createNew: "Create New Attendee",
        name: "Name",
        namePlaceholder: "Enter attendee name",
        createButton: "Create Attendee",
        existingAttendees: "Existing Attendees",
        noAttendees: "No attendees found.",
    },
};
const de_DE = {
    common: {
        appTitle: "Anwesenheit",
        error: "Fehler",
        notFound: "Nicht gefunden",
    },
    indexPage: {
        title: "Anwesenheit",
        enterName: "Teilnehmername eingeben",
        namePlaceholder: "Name",
        go: "Los",
    },
    attendeePage: {
        title: "Teilnehmer",
        notFoundTitle: "Teilnehmer nicht gefunden",
        notFoundMessage: "Kein Teilnehmer gefunden mit Name",
    },
    attendeeForm: {
        editTitle: "Teilnehmer bearbeiten",
        locale: "Sprache",
        arrivalDate: "Ankunftsdatum",
        arrivalFlight: "Ankunftsflug",
        departureDate: "Abreisedatum",
        departureFlight: "Abflug",
        passportStatus: "Reisepass-Status",
        visaStatus: "Visum-Status",
        dietaryRequirements: "Ernährungsanforderungen",
        save: "Speichern",
        passportOptions: {
            valid: "Gültig",
            pending: "Ausstehend",
            none: "Keiner",
        },
        visaOptions: {
            obtained: "Erhalten",
            pending: "Ausstehend",
            none: "Keines",
        },
    },
    cockpitPage: {
        title: "Cockpit - Alle Teilnehmer",
        createNew: "Neuen Teilnehmer erstellen",
        name: "Name",
        namePlaceholder: "Teilnehmername eingeben",
        createButton: "Teilnehmer erstellen",
        existingAttendees: "Vorhandene Teilnehmer",
        noAttendees: "Keine Teilnehmer gefunden.",
    },
};
const translations = {
    en_US,
    de_DE,
};
export const DEFAULT_LOCALE = "en_US";
export function getTranslations(locale) {
    if (locale in translations) {
        return translations[locale];
    }
    return translations[DEFAULT_LOCALE];
}
export function isValidLocale(locale) {
    return locale === "en_US" || locale === "de_DE";
}
