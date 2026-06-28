import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to access your studio portal.</p>
        <form className="mt-8 space-y-5">
          <Input label="Email address" name="email" type="email" placeholder="you@example.com" />
          <Input label="Password" name="password" type="password" placeholder="Enter your password" />
          <Button type="button" className="w-full">Sign in</Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New to Project 520? <Link href="/register" className="font-semibold text-purple-700">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
