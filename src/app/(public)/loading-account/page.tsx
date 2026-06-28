"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function LoadingAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Milestone 3 will load the user's profile and route by role here.
    router.replace("/parent");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl" aria-live="polite">
        <Logo />
        <div className="mx-auto mt-8 size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
        <h1 className="mt-6 text-2xl font-bold">Loading your account</h1>
        <p className="mt-2 text-sm text-slate-600">We’re preparing your studio portal.</p>
      </section>
    </main>
  );
}
