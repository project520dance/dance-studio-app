"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { getClasses } from "@/services/classService";

export default function ClassesPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getClasses()
      .then((classes) => setItems(classes.map((item) => ({
        id: item.id,
        name: item.name,
        detail: `Season ${item.seasonId} · Program ${item.programId}`,
        status: item.status,
      }))))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load classes."))
      .finally(() => setLoading(false));
  }, []);

  return <CatalogList title="Classes" description="Manage season-specific classes." createHref="/admin/classes/new" baseHref="/admin/classes" items={items} loading={loading} error={error} />;
}
