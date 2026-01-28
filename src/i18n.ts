export type Locale = "en_US" | "de_DE";

export interface Translations {
  common: {
    appTitle: string;
    error: string;
    notFound: string;
    nav: {
      home: string;
      cockpit: string;
      flightsOverview: string;
      flightsManage: string;
      flightsAttendees: string;
    };
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
    flightsTitle: string;
    flightsNone: string;
    flightsFlight: string;
    flightsRoute: string;
    flightsDeparture: string;
    flightsArrival: string;
    flightsActions: string;
    flightsRemove: string;
    flightsAddTitle: string;
    flightsSelectLabel: string;
    flightsSelectPlaceholder: string;
    flightsAdd: string;
    flightsNoAvailable: string;
  };
  flightsOverviewPage: {
    title: string;
    attendeesLink: string;
    manageLink: string;
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
    manageLink: string;
    openAttendee: string;
    noAttendees: string;
    existingFlights: string;
    noFlights: string;
    route: string;
    departure: string;
    arrival: string;
    actions: string;
    managePassengers: string;
  };
  flightManagePage: {
    title: string;
    overviewLink: string;
    attendeesLink: string;
    addFlightTitle: string;
    inputModeLabel: string;
    inputModeHint: string;
    fieldEntryToggle: string;
    jsonToggle: string;
    importJsonTitle: string;
    importJsonHelp: string;
    importJsonPlaceholder: string;
    existingFlights: string;
    noFlights: string;
    managePassengers: string;
    delete: string;
    save: string;
    details: string;
    departure: string;
    arrival: string;
  };
  flightPassengersPage: {
    title: string;
    backToFlights: string;
    flightDetails: string;
    departure: string;
    arrival: string;
    addPassengerTitle: string;
    selectAttendee: string;
    selectPlaceholder: string;
    addPassengerButton: string;
    currentPassengers: string;
    noPassengers: string;
    passengerName: string;
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

const FLIGHT_JSON_PLACEHOLDER = `{
  "flight_number": "LH2123",
  "from_airport": "DRS",
  "to_airport": "MUC",
  "departure_local": "2026-05-02T09:35+02:00",
  "arrival_local": "2026-05-02T10:30+02:00"
}`;

const en_US: Translations = {
  common: {
    appTitle: "Attendance",
    error: "Error",
    notFound: "Not Found",
    nav: {
      home: "Home",
      cockpit: "Cockpit",
      flightsOverview: "Flights",
      flightsManage: "Manage Flights",
      flightsAttendees: "Attendee Flights",
    },
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
    flightsTitle: "Flights",
    flightsNone: "No flights assigned.",
    flightsFlight: "Flight",
    flightsRoute: "Route",
    flightsDeparture: "Departure",
    flightsArrival: "Arrival",
    flightsActions: "Actions",
    flightsRemove: "Remove",
    flightsAddTitle: "Add flight",
    flightsSelectLabel: "Select flight",
    flightsSelectPlaceholder: "Choose a flight",
    flightsAdd: "Add",
    flightsNoAvailable: "All flights already assigned.",
  },
  flightsOverviewPage: {
    title: "Flight Overview",
    attendeesLink: "Edit attendee flights",
    manageLink: "Manage flights",
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
    manageLink: "Manage flights",
    openAttendee: "Open Attendee",
    noAttendees: "No attendees found.",
    existingFlights: "Existing Flights",
    noFlights: "No flights assigned.",
    route: "Route",
    departure: "Departure (local)",
    arrival: "Arrival (local)",
    actions: "Actions",
    managePassengers: "Manage passengers",
  },
  flightManagePage: {
    title: "Manage Flights",
    overviewLink: "View flight overview",
    attendeesLink: "View attendee flights",
    addFlightTitle: "Add Flight",
    inputModeLabel: "Input mode",
    inputModeHint: "Choose how to add the flight details.",
    fieldEntryToggle: "Enter fields",
    jsonToggle: "Paste JSON",
    importJsonTitle: "Import JSON",
    importJsonHelp: "Paste a JSON object with flight fields. Include timezone offsets in the date strings. If provided, it overrides the individual fields above.",
    importJsonPlaceholder: FLIGHT_JSON_PLACEHOLDER,
    existingFlights: "Existing Flights",
    noFlights: "No flights found.",
    managePassengers: "Manage passengers",
    delete: "Delete",
    save: "Save changes",
    details: "Details",
    departure: "Departure (local)",
    arrival: "Arrival (local)",
  },
  flightPassengersPage: {
    title: "Manage Flight Passengers",
    backToFlights: "Back to flights",
    flightDetails: "Flight details",
    departure: "Departure (local)",
    arrival: "Arrival (local)",
    addPassengerTitle: "Add passenger",
    selectAttendee: "Attendee",
    selectPlaceholder: "Select attendee",
    addPassengerButton: "Add passenger",
    currentPassengers: "Current passengers",
    noPassengers: "No passengers assigned.",
    passengerName: "Passenger",
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
    nav: {
      home: "Start",
      cockpit: "Cockpit",
      flightsOverview: "Flüge",
      flightsManage: "Flüge verwalten",
      flightsAttendees: "Teilnehmerflüge",
    },
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
    flightsTitle: "Flüge",
    flightsNone: "Keine Flüge zugewiesen.",
    flightsFlight: "Flug",
    flightsRoute: "Route",
    flightsDeparture: "Abflug",
    flightsArrival: "Ankunft",
    flightsActions: "Aktionen",
    flightsRemove: "Entfernen",
    flightsAddTitle: "Flug hinzufügen",
    flightsSelectLabel: "Flug auswählen",
    flightsSelectPlaceholder: "Flug auswählen",
    flightsAdd: "Hinzufügen",
    flightsNoAvailable: "Alle Flüge sind bereits zugewiesen.",
  },
  flightsOverviewPage: {
    title: "Flugübersicht",
    attendeesLink: "Flüge der Teilnehmer bearbeiten",
    manageLink: "Flüge verwalten",
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
    manageLink: "Flüge verwalten",
    openAttendee: "Teilnehmer öffnen",
    noAttendees: "Keine Teilnehmer gefunden.",
    existingFlights: "Vorhandene Flüge",
    noFlights: "Keine Flüge zugewiesen.",
    route: "Route",
    departure: "Abflug (lokal)",
    arrival: "Ankunft (lokal)",
    actions: "Aktionen",
    managePassengers: "Passagiere verwalten",
  },
  flightManagePage: {
    title: "Flüge verwalten",
    overviewLink: "Flugübersicht anzeigen",
    attendeesLink: "Teilnehmerflüge anzeigen",
    addFlightTitle: "Flug hinzufügen",
    inputModeLabel: "Eingabemodus",
    inputModeHint: "Wähle aus, wie du die Flugdaten eingeben möchtest.",
    fieldEntryToggle: "Felder eingeben",
    jsonToggle: "JSON einfügen",
    importJsonTitle: "JSON importieren",
    importJsonHelp: "JSON-Objekt mit Flugdaten einfügen. Zeitzonen-Offsets in den Datumsstrings angeben. Wenn vorhanden, überschreibt es die Felder oben.",
    importJsonPlaceholder: FLIGHT_JSON_PLACEHOLDER,
    existingFlights: "Vorhandene Flüge",
    noFlights: "Keine Flüge gefunden.",
    managePassengers: "Passagiere verwalten",
    delete: "Löschen",
    save: "Änderungen speichern",
    details: "Details",
    departure: "Abflug (lokal)",
    arrival: "Ankunft (lokal)",
  },
  flightPassengersPage: {
    title: "Flugpassagiere verwalten",
    backToFlights: "Zurück zu Flügen",
    flightDetails: "Flugdetails",
    departure: "Abflug (lokal)",
    arrival: "Ankunft (lokal)",
    addPassengerTitle: "Passagier hinzufügen",
    selectAttendee: "Teilnehmer",
    selectPlaceholder: "Teilnehmer auswählen",
    addPassengerButton: "Passagier hinzufügen",
    currentPassengers: "Aktuelle Passagiere",
    noPassengers: "Keine Passagiere zugewiesen.",
    passengerName: "Passagier",
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
