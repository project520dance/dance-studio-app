"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { getClasses } from "@/services/classService";
import { getScheduleSeries } from "@/services/scheduleSeriesService";

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
  const [error, setError] = useState("");

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

  return (
    <CatalogList
      title="Schedule Series"
      description="Manage recurring schedule definitions."
      createHref="/admin/schedule-series/new"
      baseHref="/admin/schedule-series"
      items={items}
      loading={loading}
      error={error}
    />
  );
}
