import { z } from "zod";

export const checkinSchema = z.object({
  checkin: z.boolean(),
});
