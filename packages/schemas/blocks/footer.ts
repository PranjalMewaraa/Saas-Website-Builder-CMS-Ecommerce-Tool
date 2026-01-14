import { z } from "zod";

export const FooterV1Schema = z.object({
  menuId: z.string().min(1),
});
