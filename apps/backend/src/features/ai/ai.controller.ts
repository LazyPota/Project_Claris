import type { Context } from "hono";
import type { z } from "zod";
import type { BackendEnv } from "../../app";
import { AIService } from "./ai.service";
import type {
  chatInputSchema,
  dashboardInputSchema,
  recommendationsInputSchema,
  explainChartInputSchema,
  dailySummaryInputSchema,
} from "./ai.schema";

/**
 * Controller mapping Hono context parameters to OpenRouter completions.
 */
export class AIController {
  /**
   * Temporary health check endpoint
   */
  static async health(c: Context<BackendEnv>) {
    try {
      const status = await AIService.healthCheck();
      return c.json({ success: true, data: status });
    } catch (e) {
      console.error("[AI Controller] Health check failed:", e);
      return c.json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  /**
   * Temporary test endpoint sending "Say OK."
   */
  static async test(c: Context<BackendEnv>) {
    try {
      const result = await AIService.testCompletion();
      return c.json({ success: true, data: result });
    } catch (e) {
      console.error("[AI Controller] Test completion failed:", e);
      return c.json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  /**
   * Handles POST /ai/chat
   */
  static async chat(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof chatInputSchema>;
    try {
      const answer = await AIService.sendChat(body.pondId, body.question, account.id);
      return c.json({ success: true, data: { answer } });
    } catch (e) {
      console.error("[AI Controller] Chat endpoint failed:", e);
      return c.json({ success: false, message: e instanceof Error ? e.message : "Chat failed" }, 500);
    }
  }

  /**
   * Handles POST /ai/dashboard-summary
   */
  static async dashboardSummary(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof dashboardInputSchema>;
    try {
      const result = await AIService.generateDashboardSummary(body.pondId, account.id);
      return c.json({ success: true, data: result });
    } catch (e) {
      console.error("[AI Controller] Dashboard Summary endpoint failed:", e);
      return c.json({ success: false, message: e instanceof Error ? e.message : "Failed to generate dashboard summary" }, 500);
    }
  }

  /**
   * Handles POST /ai/recommendations
   */
  static async recommendations(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof recommendationsInputSchema>;
    try {
      const recommendations = await AIService.generateRecommendations(body.pondId, account.id);
      return c.json({ success: true, data: { recommendations } });
    } catch (e) {
      console.error("[AI Controller] Recommendations endpoint failed:", e);
      return c.json({ success: false, message: e instanceof Error ? e.message : "Failed to generate recommendations" }, 500);
    }
  }

  /**
   * Handles POST /ai/explain-chart
   */
  static async explainChart(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof explainChartInputSchema>;
    try {
      const explanation = await AIService.explainChart(body.pondId, body.chart, body.history, account.id);
      return c.json({ success: true, data: { explanation } });
    } catch (e) {
      console.error("[AI Controller] Explain Chart endpoint failed:", e);
      return c.json({ success: false, message: e instanceof Error ? e.message : "Failed to explain chart" }, 500);
    }
  }

  /**
   * Handles POST /ai/daily-summary
   */
  static async dailySummary(c: Context<BackendEnv>) {
    const account = c.get("account");
    const body = c.req.valid("json" as never) as z.infer<typeof dailySummaryInputSchema>;
    try {
      const summary = await AIService.generateDailySummary(body.pondId, account.id);
      return c.json({ success: true, data: { summary } });
    } catch (e) {
      console.error("[AI Controller] Daily Summary endpoint failed:", e);
      return c.json({ success: false, message: e instanceof Error ? e.message : "Failed to generate daily summary" }, 500);
    }
  }
}
