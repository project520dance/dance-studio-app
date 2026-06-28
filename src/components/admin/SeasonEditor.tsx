"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { archiveSeason, createSeason, getSeason, updateSeason } from "@/services/seasonService";
import type { SeasonInput } from "@/types/season";

const initialValue: SeasonInput = {
  name: "",
  seasonType: "annual",
  startDate: "",
  endDate: "",
  timeZone: "America/Phoenix",
  registrationOpenAt: "",
  registrationCloseAt: "",
  status: "draft",
  isDefault: false,
  displayOrder: 0,
};

export function SeasonEditor({ seasonId }: { seasonId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(Boolean(seasonId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!seasonId) return;
    void getSeason(seasonId).then((season) => {
      if (!season) throw new Error("Season not found.");
      setValue({ ...initialValue, ...season });
    }).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Unable to load this season.");
    }).finally(() => setLoading(false));
  }, [seasonId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (seasonId) await updateSeason(seasonId, value);
      else await createSeason(value);
      router.push("/admin/seasons");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this season.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!seasonId) return;
    setSaving(true);
    try {
      await archiveSeason(seasonId);
      router.push("/admin/seasons");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive this season.");
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading season…</p>;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{seasonId ? "Edit season" : "New season"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Input label="Season name" required value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} />
        <Select label="Season type" value={value.seasonType} onChange={(event) => setValue({ ...value, seasonType: event.target.value as SeasonInput["seasonType"] })}>
          <option value="annual">Annual</option>
          <option value="semester">Semester</option>
          <option value="summer">Summer</option>
          <option value="intensive">Intensive</option>
          <option value="workshop">Workshop</option>
          <option value="custom">Custom</option>
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Start date" type="date" required value={value.startDate} onChange={(event) => setValue({ ...value, startDate: event.target.value })} />
          <Input label="End date" type="date" required value={value.endDate} onChange={(event) => setValue({ ...value, endDate: event.target.value })} />
        </div>
        <Input label="Time zone" required value={value.timeZone} onChange={(event) => setValue({ ...value, timeZone: event.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Registration open date/time" type="datetime-local" required value={value.registrationOpenAt} onChange={(event) => setValue({ ...value, registrationOpenAt: event.target.value })} />
          <Input label="Registration close date/time" type="datetime-local" required value={value.registrationCloseAt} onChange={(event) => setValue({ ...value, registrationCloseAt: event.target.value })} />
        </div>
        <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as SeasonInput["status"] })}>
          <option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option>
        </Select>
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={value.isDefault} onChange={(event) => setValue({ ...value, isDefault: event.target.checked })} />
          {seasonId ? "Make default season" : "Use as the default season"}
        </label>
        <Input label="Display order" type="number" min="0" step="1" value={value.displayOrder} onChange={(event) => setValue({ ...value, displayOrder: Number(event.target.value) })} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={saving}>{saving ? "Saving…" : "Save season"}</Button>
          {seasonId && value.status !== "archived" && <Button type="button" variant="secondary" disabled={saving} onClick={archive}>Archive</Button>}
        </div>
      </form>
    </section>
  );
}
