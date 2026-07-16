import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { PondService } from "./service";
import type { createPondSchema, pondIdParamSchema, updatePondSchema } from "./validation";

export class PondController {
  static async getAll(c: Context<BackendEnv>) {
    const account = c.get("account");
    const ponds = await PondService.getAll(account.id);
    return c.json({ success: true, data: ponds });
  }

  static async getById(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { id } = c.req.valid("param" as never) as z.infer<typeof pondIdParamSchema>;
    const pondItem = await PondService.getById(id, account.id);
    if (!pondItem) {
      return c.json({ success: false, message: "Pond not found" }, 404);
    }
    return c.json({ success: true, data: pondItem });
  }

  static async create(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof createPondSchema>;
    const pondItem = await PondService.create(body.name, account.id);
    return c.json({ success: true, data: pondItem });
  }

  static async update(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { id } = c.req.valid("param" as never) as z.infer<typeof pondIdParamSchema>;
    const body = c.req.valid("json" as never) as z.infer<typeof updatePondSchema>;
    const updated = await PondService.update(id, body.name, account.id);
    if (!updated) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: updated });
  }

  static async delete(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { id } = c.req.valid("param" as never) as z.infer<typeof pondIdParamSchema>;
    const deleted = await PondService.delete(id, account.id);
    if (!deleted) {
      return c.json({ success: false, message: "Pond not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: deleted });
  }
}
