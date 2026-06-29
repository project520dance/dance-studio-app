"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  createDancerForAdmin,
  getDancerForAdmin,
  updateDancerForAdmin,
  type AdminDancerInput,
} from "@/services/dancerService";

const initialValue: AdminDancerInput = {
  firstName: "",
  lastName: "",
  birthdate: "",
  status: "active",
  medicalConditions: "",
  currentMedications: "",
  physician: "",
  allergies: "",
  additionalNotes: "",
};

export function StudentEditor({ dancerId }: { dancerId?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(Boolean(dancerId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!dancerId) return;
    void getDancerForAdmin(dancerId)
      .then((dancer) => {
        if (!dancer) throw new Error("Student not found.");
        setValue({
          firstName: dancer.firstName,
          lastName: dancer.lastName,
          birthdate: dancer.birthdate,
          status: dancer.status,
          medicalConditions: dancer.medicalConditions,
          currentMedications: dancer.currentMedications,
          physician: dancer.physician,
          allergies: dancer.allergies,
          additionalNotes: dancer.additionalNotes,
        });
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to load this student.");
      })
      .finally(() => setLoading(false));
  }, [dancerId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (dancerId) await updateDancerForAdmin(dancerId, value);
      else await createDancerForAdmin(value);
      router.push("/admin/students");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save this student.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="rounded-2xl bg-white p-8 text-center">Loading student…</p>;

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">{dancerId ? "Edit student" : "Add student"}</h1>
      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="First name" required value={value.firstName} onChange={(event) => setValue({ ...value, firstName: event.target.value })} />
          <Input label="Last name" required value={value.lastName} onChange={(event) => setValue({ ...value, lastName: event.target.value })} />
        </div>
        <Input label="Birthdate" type="date" required value={value.birthdate} onChange={(event) => setValue({ ...value, birthdate: event.target.value })} />
        <Select label="Status" value={value.status} onChange={(event) => setValue({ ...value, status: event.target.value as AdminDancerInput["status"] })}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>

        <fieldset className="space-y-5 border-t border-slate-200 pt-5">
          <legend className="font-semibold">Medical notes</legend>
          <label className="block text-sm font-medium text-slate-700">
            Medical conditions
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.medicalConditions} onChange={(event) => setValue({ ...value, medicalConditions: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Current medications
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.currentMedications} onChange={(event) => setValue({ ...value, currentMedications: event.target.value })} />
          </label>
          <Input label="Physician" value={value.physician} onChange={(event) => setValue({ ...value, physician: event.target.value })} />
          <label className="block text-sm font-medium text-slate-700">
            Allergies
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.allergies} onChange={(event) => setValue({ ...value, allergies: event.target.value })} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Additional notes
            <textarea className="mt-2 min-h-24 w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-purple-500" value={value.additionalNotes} onChange={(event) => setValue({ ...value, additionalNotes: event.target.value })} />
          </label>
        </fieldset>

        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <Button disabled={saving}>{saving ? "Saving…" : "Save student"}</Button>
      </form>
    </section>
  );
}
