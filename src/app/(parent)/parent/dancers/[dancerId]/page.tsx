"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DancerAvatar } from "@/components/dancers/DancerAvatar";
import {
  getParentDancerById,
  ParentDancerServiceError,
} from "@/services/parentDancerService";
import type { Dancer } from "@/types/dancer";

function formatBirthdate(birthdate: string): string {
  const [year, month, day] = birthdate.split("-").map(Number);
  if (!year || !month || !day) return birthdate;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function DancerProfilePage() {
  const params = useParams<{ dancerId: string }>();
  const [dancer, setDancer] = useState<Dancer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDancer() {
      try {
        const result = await getParentDancerById(params.dancerId);
        if (isActive) setDancer(result);
      } catch (dancerError) {
        if (isActive) {
          setError(
            dancerError instanceof ParentDancerServiceError
              ? dancerError.message
              : "We couldn’t load this dancer profile.",
          );
        }
      }
    }

    void loadDancer();
    return () => {
      isActive = false;
    };
  }, [params.dancerId]);

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8">
        <h1 className="text-2xl font-bold">We couldn’t load this dancer</h1>
        <p role="alert" className="mt-2 text-slate-600">{error}</p>
        <Link href="/parent/dancers" className="mt-6 inline-flex font-semibold text-purple-700">← Back to dancers</Link>
      </section>
    );
  }

  if (!dancer) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-live="polite">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
        <h1 className="mt-5 text-xl font-semibold">Loading dancer profile</h1>
      </section>
    );
  }

  const details = [
    ["Birthdate", formatBirthdate(dancer.birthdate)],
    ["Medical conditions", dancer.medicalConditions || "None provided"],
    ["Current medications", dancer.currentMedications || "None provided"],
    ["Physician", dancer.physician || "None provided"],
    ["Allergies", dancer.allergies || "None provided"],
    ["Additional notes", dancer.additionalNotes || "None provided"],
    ["Status", dancer.status],
  ];
  const fullName = `${dancer.firstName} ${dancer.lastName}`;

  return (
    <section>
      <Link href="/parent/dancers" className="text-sm font-semibold text-purple-700">← Back to dancers</Link>
      <div className="mt-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white sm:p-8">
        <DancerAvatar name={fullName} photoUrl={dancer.photoUrl} size="large" />
        <p className="mt-5 text-sm font-medium text-pink-100">Dancer Profile</p>
        <h1 className="mt-2 text-3xl font-bold">{fullName}</h1>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-2 font-semibold capitalize">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
