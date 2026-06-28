"use client";

import Link from "next/link";

export type CatalogListItem = {
  id: string;
  name: string;
  detail: string;
  status: string;
};

export function CatalogList({
  title,
  description,
  createHref,
  items,
  loading,
  error,
  baseHref,
}: {
  title: string;
  description: string;
  createHref?: string;
  items: CatalogListItem[];
  loading: boolean;
  error: string;
  baseHref?: string;
}) {
  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple-600">Studio catalog</p>
          <h1 className="mt-1 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-slate-600">{description}</p>
        </div>
        {createHref && (
          <Link className="rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white" href={createHref}>
            Add new
          </Link>
        )}
      </div>
      {loading && <p className="mt-8 rounded-2xl bg-white p-8 text-center">Loading…</p>}
      {error && <p role="alert" className="mt-8 rounded-2xl border border-red-100 bg-white p-8 text-red-700">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8">
          <h2 className="font-semibold">Nothing here yet</h2>
          <p className="mt-2 text-sm text-slate-500">Add the first item when you’re ready.</p>
        </div>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const content = (
            <>
            <div className="flex justify-between gap-3">
              <h2 className="font-semibold">{item.name}</h2>
              <span className="text-xs font-semibold uppercase text-purple-600">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
            </>
          );

          return baseHref ? (
            <Link key={item.id} href={`${baseHref}/${item.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-purple-300">
              {content}
            </Link>
          ) : (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
