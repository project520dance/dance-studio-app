"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { archiveProgram, createProgram, getProgram, updateProgram } from "@/services/programService";
import type { ProgramInput } from "@/types/program";

const initialValue: ProgramInput = {
  name: "",
  description: "",
  programType: "recreational",
  minimumAge: 0,
  maximumAge: 0,
  visibility: "public",
  status: "active",
  displayOrder: 0,
};

export function ProgramEditor({ programId }: { programId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(Boolean(programId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!programId) return;
    void getProgram(programId).then((program) => {
      if (!program) throw new Error("Program not found.");
      setValue({ ...initialValue, ...program });
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load this program."))
      .finally(() => setLoading(false));
  }, [programId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (programId) await updateProgram(programId, value);
      else await createProgram(value);
      router.push("/admin/programs");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this program.");
    } finally {
      setSaving(false);
    }
  }

  async function archive() {
    if (!programId) return;
    setSaving(true);
    try {
      await archiveProgram(programId);
      router.push("/admin/programs");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive this program.");
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading program…</p>;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{programId ? "Edit program" : "New program"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Input label="Program name" required value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} />
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} />
        </label>
        <Select label="Program type" value={value.programType} onChange={(event) => setValue({ ...value, programType: event.target.value as ProgramInput["programType"] })}>
          <option value="competition">Competition</option>
          <option value="recreational">Recreational</option>
          <option value="privateLessons">Private Lessons</option>
          <option value="intensive">Intensive</option>
          <option value="workshop">Workshop</option>
          <option value="openStudio">Open Studio</option>
          <option value="custom">Custom</option>
        </Select>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Minimum age" type="number" min="0" step="1" required value={value.minimumAge} onChange={(event) => setValue({ ...value, minimumAge: Number(event.target.value) })} />
          <Input label="Maximum age" type="number" min="0" step="1" required value={value.maximumAge} onChange={(event) => setValue({ ...value, maximumAge: Number(event.target.value) })} />
        </div>
        <Select label="Visibility" value={value.visibility} onChange={(event) => setValue({ ...value, visibility: event.target.value as ProgramInput["visibility"] })}>
          <option value="public">Public</option>
          <option value="invitationOnly">Invitation Only</option>
          <option value="internal">Internal</option>
        </Select>
        <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as ProgramInput["status"] })}>
          <option value="active">Active</option><option value="archived">Archived</option>
        </Select>
        <Input label="Display order" type="number" min="0" step="1" value={value.displayOrder} onChange={(event) => setValue({ ...value, displayOrder: Number(event.target.value) })} />
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button disabled={saving}>{saving ? "Saving…" : "Save program"}</Button>
          {programId && value.status !== "archived" && <Button type="button" variant="secondary" disabled={saving} onClick={archive}>Archive</Button>}
        </div>
      </form>
    </section>
  );
}
