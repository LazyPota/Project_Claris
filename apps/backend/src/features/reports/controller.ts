import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { ReportService } from "./service";
import type { createReportSchema, generateReportBodySchema, reportIdParamSchema } from "./validation";

export class ReportController {
  static async getAll(c: Context<BackendEnv>) {
    const account = c.get("account");
    const reports = await ReportService.getAll(account.id);
    return c.json({ success: true, data: reports });
  }

  static async getById(c: Context<BackendEnv>) {
    const account = c.get("account");
    const { id } = c.req.valid("param" as never) as z.infer<typeof reportIdParamSchema>;
    const reportItem = await ReportService.getById(id, account.id);
    if (!reportItem) {
      return c.json({ success: false, message: "Report not found or unauthorized" }, 404);
    }
    return c.json({ success: true, data: reportItem });
  }

  static async create(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof createReportSchema>;
    const result = await ReportService.create(body, account.id);
    return c.json({ success: true, data: result });
  }

  static async generate(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof generateReportBodySchema>;
    const result = await ReportService.generateReport(body.pondId, body.name, account.id);
    if (!result) {
      return c.json({ success: false, message: "No data available to generate report" }, 400);
    }
    return c.json({ success: true, data: result });
  }
}
