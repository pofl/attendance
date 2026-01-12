export type Locale = "en_US" | "de_DE";

export interface Translations {
  attendeePage: {
    title: string;
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
}

const en_US: Translations = {
  attendeePage: {
    title: "Attendee",
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
};

const de_DE: Translations = {
  attendeePage: {
    title: "Teilnehmer",
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
};

const translations: Record<Locale, Translations> = {
  en_US,
  de_DE,
};

export function getTranslations(locale: string): Translations {
  if (locale in translations) {
    return translations[locale as Locale];
  }
  return translations.en_US;
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "en_US" || locale === "de_DE";
}
