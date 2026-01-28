export type Locale = "en_US" | "de_DE";

export interface Translations {
  common: {
    appTitle: string;
    error: string;
    notFound: string;
  };
  indexPage: {
    title: string;
    enterName: string;
    namePlaceholder: string;
    go: string;
    flightsTitle: string;
    flightsOverview: string;
    flightsAttendees: string;
  };
  attendeePage: {
    title: string;
    notFoundTitle: string;
    notFoundMessage: string;
  };
  attendeeForm: {
    editTitle: string;
    locale: string;
    arrivalDate: string;
    arrivalFlight: string;
    departureDate: string;
    departureFlight: string;
    passportStatus: string;
    visaStatus: string;
    dietaryRequirements: string;
    save: string;
    passportOptions: {
      valid: string;
      pending: string;
      none: string;
    };
    visaOptions: {
      obtained: string;
      pending: string;
      none: string;
    };
  };
  cockpitPage: {
    title: string;
    createNew: string;
    name: string;
    namePlaceholder: string;
    createButton: string;
    existingAttendees: string;
    noAttendees: string;
  };
  flightsOverviewPage: {
    title: string;
    attendeesLink: string;
    noFlights: string;
    flight: string;
    route: string;
    departure: string;
    arrival: string;
    passengers: string;
  };
  attendeeFlightsPage: {
    title: string;
    overviewLink: string;
    openAttendee: string;
    noAttendees: string;
    existingFlights: string;
    noFlights: string;
    addFlightTitle: string;
    route: string;
    departure: string;
    arrival: string;
    actions: string;
  };
  flightForm: {
    flightNumber: string;
    fromAirport: string;
    toAirport: string;
    fromOffset: string;
    toOffset: string;
    departureLocal: string;
    arrivalLocal: string;
    add: string;
    remove: string;
  };
}

const en_US: Translations = {
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
    flightsTitle: "Flights",
    flightsOverview: "Flight overview",
    flightsAttendees: "Edit attendee flights",
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
  flightsOverviewPage: {
    title: "Flight Overview",
    attendeesLink: "Edit attendee flights",
    noFlights: "No flights found.",
    flight: "Flight",
    route: "Route",
    departure: "Departure (local)",
    arrival: "Arrival (local)",
    passengers: "Passengers",
  },
  attendeeFlightsPage: {
    title: "Attendee Flights",
    overviewLink: "View flight overview",
    openAttendee: "Open Attendee",
    noAttendees: "No attendees found.",
    existingFlights: "Existing Flights",
    noFlights: "No flights assigned.",
    addFlightTitle: "Add Flight",
    route: "Route",
    departure: "Departure (local)",
    arrival: "Arrival (local)",
    actions: "Actions",
  },
  flightForm: {
    flightNumber: "Flight Number",
    fromAirport: "From Airport",
    toAirport: "To Airport",
    fromOffset: "From UTC Offset (minutes)",
    toOffset: "To UTC Offset (minutes)",
    departureLocal: "Departure (local time)",
    arrivalLocal: "Arrival (local time)",
    add: "Add Flight",
    remove: "Remove",
  },
};

const de_DE: Translations = {
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
    flightsTitle: "Flüge",
    flightsOverview: "Flugübersicht",
    flightsAttendees: "Teilnehmerflüge bearbeiten",
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
      pending: "Beantragt",
      none: "Keiner",
    },
    visaOptions: {
      obtained: "Erhalten",
      pending: "Beantragt",
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
  flightsOverviewPage: {
    title: "Flugübersicht",
    attendeesLink: "Flüge der Teilnehmer bearbeiten",
    noFlights: "Keine Flüge gefunden.",
    flight: "Flug",
    route: "Route",
    departure: "Abflug (lokal)",
    arrival: "Ankunft (lokal)",
    passengers: "Passagiere",
  },
  attendeeFlightsPage: {
    title: "Teilnehmerflüge",
    overviewLink: "Flugübersicht anzeigen",
    openAttendee: "Teilnehmer öffnen",
    noAttendees: "Keine Teilnehmer gefunden.",
    existingFlights: "Vorhandene Flüge",
    noFlights: "Keine Flüge zugewiesen.",
    addFlightTitle: "Flug hinzufügen",
    route: "Route",
    departure: "Abflug (lokal)",
    arrival: "Ankunft (lokal)",
    actions: "Aktionen",
  },
  flightForm: {
    flightNumber: "Flugnummer",
    fromAirport: "Abflughafen",
    toAirport: "Zielflughafen",
    fromOffset: "UTC-Offset Abflug (Minuten)",
    toOffset: "UTC-Offset Ziel (Minuten)",
    departureLocal: "Abflug (lokale Zeit)",
    arrivalLocal: "Ankunft (lokale Zeit)",
    add: "Flug hinzufügen",
    remove: "Entfernen",
  },
};

const translations: Record<Locale, Translations> = {
  en_US,
  de_DE,
};

export const DEFAULT_LOCALE: Locale = "en_US";

export function getTranslations(locale: string): Translations {
  if (locale in translations) {
    return translations[locale as Locale];
  }
  return translations[DEFAULT_LOCALE];
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "en_US" || locale === "de_DE";
}
