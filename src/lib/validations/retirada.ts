import { z } from "zod";

export const retiradaSchema = z.object({
  retirada: z.boolean(),
});
