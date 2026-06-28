import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Join Project 520 and keep studio life organized.</p>
        <form className="mt-8 space-y-5">
          <Input label="Full name" name="name" placeholder="Your name" />
          <Input label="Email address" name="email" type="email" placeholder="you@example.com" />
          <Input label="Password" name="password" type="password" placeholder="Create a password" />
          <Button type="button" className="w-full">Create account</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-purple-700">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
