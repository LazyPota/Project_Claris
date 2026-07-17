"use client";

import { useCallback, useEffect, useState } from "react";
import { rpc } from "@/lib/api-client";
import { AlertCircle, Bot, BrainCircuit, Loader2, MessageSquare, Sparkles } from "lucide-react";

export function SimpleMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1 text-sm text-neutral-700 ">
      {lines.map((line, idx) => {
        const clean = line.trim();
        if (clean.startsWith("###")) {
          return (
            <h4 key={idx} className="font-semibold text-neutral-900  mt-2">
              {clean.replace("###", "").trim()}
            </h4>
          );
        }
        if (clean.startsWith("##")) {
          return (
            <h3 key={idx} className="text-base font-semibold text-neutral-900  mt-3">
              {clean.replace("##", "").trim()}
            </h3>
          );
        }
        if (clean.startsWith("-") || clean.startsWith("*")) {
          return (
            <li key={idx} className="ml-4 list-disc">
              {clean.replace(/^[-*]\s*/, "")}
            </li>
          );
        }
        if (!clean) return <div key={idx} className="h-1" />;
        const parts = clean.split("**");
        return (
          <p key={idx}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold text-neutral-950 ">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

export function AICopilotSection() {
  const [pondId, setPondId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for AI responses
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [dailySummary, setDailySummary] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch all AI data for the active pond
  const fetchAIData = useCallback(async (activeId: number) => {
    try {
      setError(null);

      // 1. Fetch dashboard summary
      const summaryRes = await rpc.ai["dashboard-summary"].$post({
        json: { pondId: activeId },
      });
      if (!summaryRes.ok) throw new Error();
      const summaryJson = (await summaryRes.json()) as any;
      if (summaryJson.success) {
        setDashboardSummary(summaryJson.data);
      }

      // 2. Fetch daily summary
      const dailyRes = await rpc.ai["daily-summary"].$post({
        json: { pondId: activeId },
      });
      if (dailyRes.ok) {
        const dailyJson = (await dailyRes.json()) as any;
        if (dailyJson.success) {
          setDailySummary(dailyJson.data.summary);
        }
      }

      // 3. Fetch recommendations
      const recsRes = await rpc.ai.recommendations.$post({
        json: { pondId: activeId },
      });
      if (recsRes.ok) {
        const recsJson = (await recsRes.json()) as any;
        if (recsJson.success) {
          setRecommendations(recsJson.data.recommendations);
        }
      }
    } catch (e) {
      setError("AI service is currently unavailable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const pondsRes = await rpc.ponds.$get();
        if (!pondsRes.ok) throw new Error();
        const pondsJson = (await pondsRes.json()) as any;
        if (pondsJson.success && pondsJson.data && pondsJson.data.length > 0) {
          const firstPondId = pondsJson.data[0].id;
          if (!cancelled) {
            setPondId(firstPondId);
            await fetchAIData(firstPondId);
          }
        } else {
          if (!cancelled) {
            setError("No active ponds found to analyze.");
            setLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          setError("AI service is currently unavailable.");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchAIData]);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pondId || !chatQuestion.trim()) return;

    setChatLoading(true);
    setChatAnswer("");
    try {
      const res = await rpc.ai.chat.$post({
        json: {
          pondId,
          question: chatQuestion,
        },
      });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as any;
      if (json.success) {
        setChatAnswer(json.data.answer);
      } else {
        setChatAnswer("AI service encountered an error answering your question.");
      }
    } catch {
      setChatAnswer("AI service is currently unavailable.");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500 p-4 border border-dashed rounded-md">
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        <span>Initializing Project Clarias AI Copilot...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700   ">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Main AI Copilot Overview Card */}
      {dashboardSummary && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50/30 p-6  ">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-indigo-600 " />
              <h2 className="text-lg font-semibold text-neutral-900 ">
                Project Clarias AI Copilot
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Pond Health</span>
                <p className="text-2xl font-bold text-indigo-600 ">
                  {dashboardSummary.healthScore}%
                </p>
              </div>
              <div className="h-8 w-px bg-neutral-200 " />
              <div className="text-right">
                <span className="text-xs uppercase tracking-wide text-neutral-500">Confidence</span>
                <p className="text-sm font-semibold text-neutral-700 ">
                  {dashboardSummary.confidence}%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-neutral-800 ">
              "{dashboardSummary.headline}"
            </p>
            <p className="text-sm text-neutral-600 ">
              {dashboardSummary.summary}
            </p>
          </div>

          {dashboardSummary.recommendations?.length > 0 && (
            <div className="mt-4 rounded-md bg-white p-4 shadow-sm border border-neutral-100  ">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wide ">
                <Sparkles className="h-4.5 w-4.5" />
                <span>Top Recommendation</span>
              </div>
              <p className="mt-1 text-sm text-neutral-800 ">
                {dashboardSummary.recommendations[0]}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid containing Daily Summary, Recommendations, and Ask AI Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Daily Summary */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5  ">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Today's Summary
          </h3>
          {dailySummary ? (
            <SimpleMarkdown content={dailySummary} />
          ) : (
            <p className="text-sm text-neutral-500">No daily logs compiled.</p>
          )}
        </div>

        {/* Bullet Recommendations List */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5  ">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3">
            Pond Actions
          </h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 ">
                  <span className="text-indigo-500 font-bold shrink-0">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">No recommended actions available.</p>
          )}
        </div>

        {/* Ask AI Panel */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5   flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
              <Bot className="h-4.5 w-4.5 text-indigo-500" />
              Ask Clarias Copilot
            </h3>

            <form onSubmit={handleAskAI} className="space-y-3">
              <textarea
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
                placeholder="Ask anything about your pond..."
                className="w-full min-h-[80px] rounded-md border border-neutral-200 p-2.5 text-sm outline-none focus:border-indigo-500   "
              />
              <button
                type="submit"
                disabled={chatLoading || !chatQuestion.trim()}
                className="w-full flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {chatLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4.5 w-4.5" />
                    <span>Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {chatAnswer && (
            <div className="mt-4 rounded-md border border-neutral-100 bg-neutral-50/50 p-3.5   max-h-[180px] overflow-y-auto">
              <SimpleMarkdown content={chatAnswer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
