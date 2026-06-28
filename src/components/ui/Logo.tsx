import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-sm text-white">
        520
      </span>
      <span>Project 520</span>
    </Link>
  );
}
