"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DancerAvatar } from "@/components/dancers/DancerAvatar";
import {
  getParentDancers,
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

export default function DancersPage() {
  const [dancers, setDancers] = useState<Dancer[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadDancers() {
      try {
        const result = await getParentDancers();
        if (isActive) setDancers(result);
      } catch (dancerError) {
        if (isActive) {
          setError(
            dancerError instanceof ParentDancerServiceError
              ? dancerError.message
              : "We couldn’t load your dancers. Please try again.",
          );
        }
      }
    }

    void loadDancers();
    return () => {
      isActive = false;
    };
  }, []);

  if (error) {
    return (
      <section className="rounded-2xl border border-red-100 bg-white p-8">
        <h1 className="text-2xl font-bold">We couldn’t load your dancers</h1>
        <p role="alert" className="mt-2 text-slate-600">{error}</p>
      </section>
    );
  }

  if (!dancers) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center" aria-live="polite">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
        <h1 className="mt-5 text-xl font-semibold">Loading dancers</h1>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-purple-600">Parent Portal</p>
          <h1 className="mt-1 text-3xl font-bold">My Dancers</h1>
        </div>
        <Link href="/parent/dancers/add" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
          Add Dancer
        </Link>
      </div>

      {dancers.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dancers.map((dancer) => (
            <Link
              key={dancer.id}
              href={`/parent/dancers/${dancer.id}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
            >
              <DancerAvatar
                name={`${dancer.firstName} ${dancer.lastName}`}
                photoUrl={dancer.photoUrl}
              />
              <h2 className="mt-4 text-lg font-semibold">
                {dancer.firstName} {dancer.lastName}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Birthdate: {formatBirthdate(dancer.birthdate)}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-purple-700">View profile →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8">
          <h2 className="font-semibold">No dancers added yet</h2>
          <p className="mt-2 text-sm text-slate-500">Add your first dancer to get started.</p>
        </div>
      )}
    </section>
  );
}
