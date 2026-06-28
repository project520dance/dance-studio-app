import Link from "next/link";

export type SidebarItem = {
  label: string;
  href: string;
};

export function Sidebar({ items }: { items: SidebarItem[] }) {
  return (
    <aside className="border-b border-slate-200 bg-white md:min-h-[calc(100vh-65px)] md:border-r md:border-b-0">
      <nav aria-label="Dashboard navigation" className="p-3 md:p-5">
        <ul className="flex gap-2 overflow-x-auto md:flex-col">
          {items.map((item, index) => (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                  index === 0
                    ? "bg-purple-50 text-purple-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
