"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { Button } from "@/components/ui/Button";
import { getClasses } from "@/services/classService";
import { generateScheduleEvents } from "@/services/scheduleGenerationService";
import { getScheduleSeries } from "@/services/scheduleSeriesService";
import type { ScheduleGenerationResult } from "@/types/scheduleGeneration";

const dayLabels = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const roomLabels = {
  studioA: "Studio A",
  studioB: "Studio B",
  studioC: "Studio C",
  lobby: "Lobby",
  other: "Other",
};

export default function ScheduleSeriesPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generationResult, setGenerationResult] = useState<ScheduleGenerationResult | null>(null);

  useEffect(() => {
    void Promise.all([getScheduleSeries(), getClasses()])
      .then(([seriesItems, classes]) => {
        const classNames = new Map(classes.map((item) => [item.id, item.name]));
        setItems(seriesItems.map((item) => ({
          id: item.id,
          name: classNames.get(item.classId) ?? "Unknown class",
          detail: `${dayLabels[item.dayOfWeek]} · ${item.startTime}–${item.endTime} · ${roomLabels[item.roomId]}`,
          status: item.status,
        })));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to load schedule series.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function generate() {
    if (!window.confirm("Generate missing schedule events for the next 90 days? Existing events will not be changed.")) {
      return;
    }
    setGenerating(true);
    setGenerationResult(null);
    setError("");
    try {
      setGenerationResult(await generateScheduleEvents());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to generate schedule events.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button disabled={loading || generating} onClick={generate}>
          {generating ? "Generating…" : "Generate schedule events"}
        </Button>
      </div>
      {generationResult && (
        <div className="mb-6 rounded-2xl border border-purple-200 bg-white p-5" role="status">
          <p className="font-semibold">Schedule generation complete</p>
          <p className="mt-2 text-sm text-slate-600">
            {generationResult.seriesProcessed} series processed · {generationResult.eventsCreated} events created · {generationResult.eventsSkipped} existing events skipped
          </p>
          {generationResult.generatedThrough && (
            <p className="mt-1 text-sm text-slate-500">Generated through {generationResult.generatedThrough}.</p>
          )}
          {generationResult.errors.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-red-600">
              {generationResult.errors.map((item) => (
                <li key={item.scheduleSeriesId}>{item.scheduleSeriesName}: {item.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <CatalogList
        title="Schedule Series"
        description="Manage recurring schedule definitions."
        createHref="/admin/schedule-series/new"
        baseHref="/admin/schedule-series"
        items={items}
        loading={loading}
        error={error}
      />
    </>
  );
}
