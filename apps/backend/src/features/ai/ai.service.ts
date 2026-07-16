import { db, eq, asc } from "@project-clarias/database";
import { environmentLog } from "@project-clarias/database/schema/aquaculture";
import { openrouter, DEFAULT_OPENROUTER_MODEL } from "../../lib/openrouter";
import { PondService } from "../ponds/service";
import { EnvironmentService } from "../environment/service";
import { FeedingService } from "../feeding/service";
import { HarvestService } from "../harvest/service";
import { AIContextBuilder } from "./ai.context";
import {
  SYSTEM_PROMPT,
  buildChatPrompt,
  buildDashboardPrompt,
  buildRecommendationPrompt,
  buildChartPrompt,
  buildDailySummaryPrompt,
} from "./ai.prompts";
import type { DashboardSummaryResponse } from "./ai.types";

/**
 * Service class handling OpenAI/OpenRouter completions and prompt context assemblies.
 */
export class AIService {
  /**
   * Constructs a telemetry context string for the specified pond.
   */
  static async buildPondContext(pondId: number, userId: number): Promise<string | null> {
    const pondItem = await PondService.getById(pondId, userId);
    if (!pondItem) return null;

    // Fetch oldest reading to compute age
    const oldestEnv = await db
      .select({ timestamp: environmentLog.timestamp })
      .from(environmentLog)
      .where(eq(environmentLog.pondId, pondId))
      .orderBy(asc(environmentLog.timestamp))
      .limit(1);
    const firstTimestamp = oldestEnv[0]?.timestamp || new Date();
    const ageDays = Math.max(1, Math.round((Date.now() - firstTimestamp.getTime()) / (1000 * 60 * 60 * 24)));

    // Fetch latest environment log
    const envLogs = await EnvironmentService.getLogs(pondId, userId, 1);
    const latestEnv = envLogs && envLogs[0] ? envLogs[0] : null;

    // Fetch feeding logs for today and weekly averages
    const feedLogs = await FeedingService.getLogs(pondId, userId, 50);
    let feedTodayKg = 0;
    let totalWeeklyFeedKg = 0;
    let weeklyDaysCount = 0;

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);

    if (feedLogs) {
      for (const log of feedLogs) {
        const logTime = new Date(log.timestamp);
        if (logTime >= startOfToday) {
          feedTodayKg += log.amountKg;
        }
        if (logTime >= startOfWeek) {
          totalWeeklyFeedKg += log.amountKg;
          weeklyDaysCount++;
        }
      }
    }
    const weeklyAverageFeedKg = weeklyDaysCount > 0 ? totalWeeklyFeedKg / 7 : 0;

    // Fetch latest harvest log
    const harvestLogs = await HarvestService.getLogs(pondId, userId, 1);
    const latestHarvest = harvestLogs && harvestLogs[0] ? harvestLogs[0] : null;

    const species = latestHarvest?.species || "Clarias gariepinus (Catfish)";
    const biomassKg = latestHarvest?.estimatedBiomassKg || 0;
    const daysToHarvest = Math.max(0, 90 - ageDays);

    const currentWater = latestEnv
      ? {
          temperature: latestEnv.temperature,
          pH: latestEnv.pH,
          dissolvedOxygen: latestEnv.dissolvedOxygen,
          waterLevelPercent: Math.min(100, Math.max(0, Math.round((latestEnv.waterLevel / 1.5) * 100))),
        }
      : null;

    const activeAlerts: string[] = [];
    if (latestEnv) {
      if (latestEnv.dissolvedOxygen < 5.0) {
        activeAlerts.push("Low Dissolved Oxygen");
      }
      if (latestEnv.pH < 6.5) {
        activeAlerts.push("Acidic pH");
      }
      if (latestEnv.pH > 8.5) {
        activeAlerts.push("Alkaline pH");
      }
      if (latestEnv.temperature < 25.0 || latestEnv.temperature > 32.0) {
        activeAlerts.push("Abnormal Temperature");
      }
    }

    return AIContextBuilder.build({
      pondName: pondItem.name,
      species,
      ageDays,
      biomassKg,
      daysToHarvest,
      currentWater,
      feedTodayKg: Math.round(feedTodayKg * 10) / 10,
      weeklyAverageFeedKg: Math.round(weeklyAverageFeedKg * 10) / 10,
      activeAlerts,
    });
  }

  /**
   * Sends user question and pond context to OpenRouter chat completion.
   */
  static async sendChat(pondId: number, question: string, userId: number): Promise<string> {
    try {
      const context = await this.buildPondContext(pondId, userId);
      if (!context) throw new Error("Unauthorized or pond does not exist");

      const prompt = buildChatPrompt(context, question);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
      })) as any;

      const responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response received from LLM provider");

      return responseText;
    } catch (e) {
      throw new Error(`AI Chat completion failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Generates pond health statistics and summaries in JSON format.
   */
  static async generateDashboardSummary(pondId: number, userId: number): Promise<DashboardSummaryResponse> {
    try {
      const context = await this.buildPondContext(pondId, userId);
      if (!context) throw new Error("Unauthorized or pond does not exist");

      const prompt = buildDashboardPrompt(context);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
      })) as any;

      let responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response received from LLM provider");

      // Strip markdown JSON codeblock markers if present
      responseText = responseText.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();

      try {
        const parsed = JSON.parse(responseText);
        return {
          healthScore: Number(parsed.healthScore ?? 80),
          headline: String(parsed.headline ?? "Pond analysis completed"),
          summary: String(parsed.summary ?? "Review sensor configurations."),
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          confidence: Number(parsed.confidence ?? 90),
        };
      } catch {
        throw new Error("Failed to parse JSON response from LLM");
      }
    } catch (e) {
      throw new Error(`AI Dashboard summary generation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Generates formatted recommended action list for pond health.
   */
  static async generateRecommendations(pondId: number, userId: number): Promise<string[]> {
    try {
      const context = await this.buildPondContext(pondId, userId);
      if (!context) throw new Error("Unauthorized or pond does not exist");

      const prompt = buildRecommendationPrompt(context);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
      })) as any;

      let responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response received from LLM provider");

      responseText = responseText.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();

      try {
        const parsed = JSON.parse(responseText);
        return Array.isArray(parsed.recommendations) ? parsed.recommendations : [];
      } catch {
        throw new Error("Failed to parse JSON recommendations from LLM");
      }
    } catch (e) {
      throw new Error(`AI Recommendations generation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Explains historical chart data logs.
   */
  static async explainChart(
    pondId: number,
    chartName: string,
    history: Record<string, unknown>[],
    userId: number
  ): Promise<string> {
    try {
      const context = await this.buildPondContext(pondId, userId);
      if (!context) throw new Error("Unauthorized or pond does not exist");

      const historyStr = JSON.stringify(history, null, 2);
      const prompt = buildChartPrompt(context, chartName, historyStr);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
      })) as any;

      const responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response received from LLM provider");

      return responseText;
    } catch (e) {
      throw new Error(`AI Chart explanation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Generates a concise daily overview summary.
   */
  static async generateDailySummary(pondId: number, userId: number): Promise<string> {
    try {
      const context = await this.buildPondContext(pondId, userId);
      if (!context) throw new Error("Unauthorized or pond does not exist");

      const prompt = buildDailySummaryPrompt(context);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        },
      })) as any;

      const responseText = completion.choices?.[0]?.message?.content;
      if (!responseText) throw new Error("Empty response received from LLM provider");

      return responseText;
    } catch (e) {
      console.error("[AI Service] Daily summary generation error:", e);
      throw new Error(`AI Daily summary generation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Health check endpoint logic
   */
  static async healthCheck() {
    let openrouterReachable = false;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", { signal: AbortSignal.timeout(5000) });
      openrouterReachable = res.ok;
    } catch (e) {
      console.error("[AI Service] Health check reachability test failed:", e);
    }

    return {
      provider: "openrouter",
      model: DEFAULT_OPENROUTER_MODEL,
      apiKeyLoaded: !!process.env.OPENROUTER_API_KEY,
      sdkInitialized: !!openrouter,
      openrouterReachable,
    };
  }

  /**
   * Test completion endpoint logic
   */
  static async testCompletion() {
    try {
      console.log("[AI Service] Testing OpenRouter completion with model:", DEFAULT_OPENROUTER_MODEL);
      const completion = (await openrouter.chat.send({
        chatRequest: {
          model: DEFAULT_OPENROUTER_MODEL,
          messages: [{ role: "user", content: "Say OK." }],
        },
      })) as any;

      console.log("[AI Service] Received raw completion response:", JSON.stringify(completion));

      return {
        rawResponse: completion,
        parsedResponse: completion.choices?.[0]?.message?.content || "",
      };
    } catch (e) {
      console.error("[AI Service] Test completion failed:", e);
      throw e;
    }
  }
}
