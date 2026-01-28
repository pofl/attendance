import type { FC } from "hono/jsx";
import { getTranslations } from "../i18n.js";
import type { AttendeeRecord } from "../repository.js";

export const AttendeeForm: FC<{ attendee: AttendeeRecord; locale?: string }> = ({ attendee, locale }) => {
  const t = getTranslations(locale ?? attendee.locale ?? "en_US").attendeeForm;
  return (
    <form hx-put={`/attendees/${encodeURIComponent(attendee.name)}`} hx-swap="outerHTML">
      <label>
        {t.locale}:
        <select name="locale">
          <option value="en_US" selected={attendee.locale === "en_US"}>English (US)</option>
          <option value="de_DE" selected={attendee.locale === "de_DE"}>Deutsch</option>
        </select>
      </label>

      <label>
        {t.passportStatus}:
        <select name="passport_status" value={attendee.passport_status}>
          <option value="valid" selected={attendee.passport_status === "valid"}>
            {t.passportOptions.valid}
          </option>
          <option value="pending" selected={attendee.passport_status === "pending"}>
            {t.passportOptions.pending}
          </option>
          <option value="none" selected={attendee.passport_status === "none"}>
            {t.passportOptions.none}
          </option>
        </select>
      </label>

      <label>
        {t.visaStatus}:
        <select name="visa_status" value={attendee.visa_status}>
          <option value="obtained" selected={attendee.visa_status === "obtained"}>
            {t.visaOptions.obtained}
          </option>
          <option value="pending" selected={attendee.visa_status === "pending"}>
            {t.visaOptions.pending}
          </option>
          <option value="none" selected={attendee.visa_status === "none"}>
            {t.visaOptions.none}
          </option>
        </select>
      </label>

      <label>
        {t.dietaryRequirements}:
        <textarea name="dietary_requirements">{attendee.dietary_requirements ?? ""}</textarea>
      </label>

      <button type="submit">{t.save}</button>
    </form>
  );
};
