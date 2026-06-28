"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { getClasses } from "@/services/classService";
import { getScheduleEvents } from "@/services/scheduleEventService";

const roomLabels = {
  studioA: "Studio A",
  studioB: "Studio B",
  studioC: "Studio C",
  lobby: "Lobby",
  other: "Other",
};

export default function ScheduleEventsPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([getScheduleEvents(), getClasses()])
      .then(([events, classes]) => {
        const classNames = new Map(classes.map((item) => [item.id, item.name]));
        setItems(events.map((item) => ({
          id: item.id,
          name: classNames.get(item.classId) ?? "Unknown class",
          detail: `${new Intl.DateTimeFormat("en-US", {
            timeZone: item.timeZone,
            dateStyle: "medium",
            timeStyle: "short",
          }).format(item.startDateTime)} · ${roomLabels[item.roomId]}`,
          status: item.status,
        })));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to load schedule events.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <CatalogList
      title="Schedule Events"
      description="View generated dated schedule occurrences."
      items={items}
      loading={loading}
      error={error}
    />
  );
}
