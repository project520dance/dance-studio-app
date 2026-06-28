import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({ id, label, className = "", children, ...props }: SelectProps) {
  const selectId = id ?? props.name;
  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={selectId}>
      {label}
      <select
        id={selectId}
        className={`mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-purple-500 focus:ring-3 focus:ring-purple-100 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
