"use client";

import { useEffect, useState } from "react";
import { CatalogList, type CatalogListItem } from "@/components/admin/CatalogList";
import { getPrograms } from "@/services/programService";

export default function ProgramsPage() {
  const [items, setItems] = useState<CatalogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void getPrograms()
      .then((programs) => setItems(programs.map((item) => ({
        id: item.id,
        name: item.name,
        detail: item.description || "No description",
        status: item.status,
      }))))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load programs."))
      .finally(() => setLoading(false));
  }, []);

  return <CatalogList title="Programs" description="Manage reusable studio offerings." createHref="/admin/programs/new" baseHref="/admin/programs" items={items} loading={loading} error={error} />;
}
