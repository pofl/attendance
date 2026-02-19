import { z } from "zod";

/** Shared param schema for routes with a single numeric :id */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Shared form schema for attendee-name submissions (home + cockpit) */
export const attendeeNameFormSchema = z.object({
  name: z.string().trim().min(1),
});
