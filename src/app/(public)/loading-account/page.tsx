"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { subscribeToAuthState } from "@/services/authService";
import { getUserProfile } from "@/services/userService";

export default function LoadingAccountPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const unsubscribe = subscribeToAuthState(async (user) => {
      if (!isActive) {
        return;
      }

      if (!user) {
        setError("We could not find an active session. Please sign in again.");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);

        if (!isActive) {
          return;
        }

        if (!profile) {
          setError(
            "Your account was created, but your studio profile could not be found. Please contact the studio for help.",
          );
          return;
        }

        if (profile.role === "parent") {
          router.replace("/parent");
          return;
        }

        setError("Your account role is not supported yet.");
      } catch {
        if (isActive) {
          setError("We could not load your studio profile. Please try again.");
        }
      }
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl" aria-live="polite">
        <Logo />
        {error ? (
          <>
            <div className="mx-auto mt-8 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-700" aria-hidden="true">
              !
            </div>
            <h1 className="mt-6 text-2xl font-bold">We couldn’t load your account</h1>
            <p role="alert" className="mt-2 text-sm text-slate-600">{error}</p>
            <Link href="/login" className="mt-6 inline-flex rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white">
              Return to login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mt-8 size-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" aria-hidden="true" />
            <h1 className="mt-6 text-2xl font-bold">Loading your account</h1>
            <p className="mt-2 text-sm text-slate-600">We’re preparing your studio portal.</p>
          </>
        )}
      </section>
    </main>
  );
}
