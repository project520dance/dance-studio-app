import Link from "next/link";
import type { ReactNode } from "react";

type NavigationItem = {
  label: string;
  href: string;
};

type DashboardLayoutProps = {
  title: string;
  navigation: NavigationItem[];
  children: ReactNode;
};

export function DashboardLayout({
  title,
  navigation,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Project 520
          </Link>
          <span className="text-sm text-slate-500">{title}</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl md:grid-cols-[220px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-6 md:min-h-[calc(100vh-65px)] md:border-r md:border-b-0">
          <nav aria-label={`${title} navigation`}>
            <ul className="flex gap-2 md:flex-col">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
