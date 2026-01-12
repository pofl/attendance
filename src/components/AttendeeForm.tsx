import type { FC } from "hono/jsx";
import type { AttendeeRecord } from "../repository.js";

const formatDateForInput = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
};

export const AttendeeForm: FC<{ attendee: AttendeeRecord }> = ({ attendee }) => {
  return (
    <form hx-put={`/attendees/${encodeURIComponent(attendee.name)}`} hx-swap="outerHTML">
      <h2>Edit Attendee: {attendee.name}</h2>

      <label>
        Locale:
        <input type="text" name="locale" value={attendee.locale} required />
      </label>

      <label>
        Arrival Date:
        <input type="datetime-local" name="arrival_date" value={formatDateForInput(attendee.arrival_date)} />
      </label>

      <label>
        Arrival Flight:
        <input type="text" name="arrival_flight" value={attendee.arrival_flight ?? ""} />
      </label>

      <label>
        Departure Date:
        <input type="datetime-local" name="departure_date" value={formatDateForInput(attendee.departure_date)} />
      </label>

      <label>
        Departure Flight:
        <input type="text" name="departure_flight" value={attendee.departure_flight ?? ""} />
      </label>

      <label>
        Passport Status:
        <select name="passport_status" value={attendee.passport_status}>
          <option value="valid" selected={attendee.passport_status === "valid"}>
            Valid
          </option>
          <option value="pending" selected={attendee.passport_status === "pending"}>
            Pending
          </option>
          <option value="none" selected={attendee.passport_status === "none"}>
            None
          </option>
        </select>
      </label>

      <label>
        Visa Status:
        <select name="visa_status" value={attendee.visa_status}>
          <option value="obtained" selected={attendee.visa_status === "obtained"}>
            Obtained
          </option>
          <option value="pending" selected={attendee.visa_status === "pending"}>
            Pending
          </option>
          <option value="none" selected={attendee.visa_status === "none"}>
            None
          </option>
        </select>
      </label>

      <label>
        Dietary Requirements:
        <textarea name="dietary_requirements">{attendee.dietary_requirements ?? ""}</textarea>
      </label>

      <button type="submit">Save</button>
    </form>
  );
};
