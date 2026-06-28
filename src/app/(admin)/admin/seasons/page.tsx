"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { getSeasons } from "@/services/seasonService";

export default function SeasonsPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getSeasons()
      .then((seasons) => setItems(seasons.map((item) => ({
        id: item.id,
        name: item.name,
        detail: `${item.startDate} – ${item.endDate}${item.isDefault ? " · Default" : ""}`,
        status: item.status,
      }))))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load seasons."))
      .finally(() => setLoading(false));
  }, []);

  return <CatalogList title="Seasons" description="Organize classes by studio year or session." createHref="/admin/seasons/new" baseHref="/admin/seasons" items={items} loading={loading} error={error} />;
}
