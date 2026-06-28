"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createParentDancer,
  ParentDancerServiceError,
} from "@/services/parentDancerService";

const initialForm = {
  firstName: "",
  lastName: "",
  birthdate: "",
  medicalConditions: "",
  currentMedications: "",
  physician: "",
  allergies: "",
  additionalNotes: "",
};

export default function AddDancerPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateField(
    field: keyof typeof initialForm,
    value: string,
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const dancerId = await createParentDancer(form);
      router.push(`/parent/dancers/${dancerId}`);
    } catch (dancerError) {
      setError(
        dancerError instanceof ParentDancerServiceError
          ? dancerError.message
          : "We couldn’t add this dancer. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const optionalFields = [
    ["Medical conditions", "medicalConditions"],
    ["Current medications", "currentMedications"],
    ["Physician", "physician"],
    ["Allergies", "allergies"],
    ["Additional notes", "additionalNotes"],
  ] as const;

  return (
    <section className="mx-auto max-w-2xl">
      <Link href="/parent/dancers" className="text-sm font-semibold text-purple-700">← Back to dancers</Link>
      <h1 className="mt-6 text-3xl font-bold">Add Dancer</h1>
      <p className="mt-2 text-slate-600">Add another dancer to your family.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="First name"
            name="firstName"
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
            disabled={isSaving}
            required
          />
          <Input
            label="Last name"
            name="lastName"
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
            disabled={isSaving}
            required
          />
        </div>
        <Input
          label="Birthdate"
          name="birthdate"
          type="date"
          value={form.birthdate}
          onChange={(event) => updateField("birthdate", event.target.value)}
          disabled={isSaving}
          required
        />
        {optionalFields.map(([label, field]) => (
          <Input
            key={field}
            label={label}
            name={field}
            placeholder="Optional"
            value={form[field]}
            onChange={(event) => updateField(field, event.target.value)}
            disabled={isSaving}
          />
        ))}

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Adding dancer..." : "Add Dancer"}
          </Button>
        </div>
      </form>
    </section>
  );
}
