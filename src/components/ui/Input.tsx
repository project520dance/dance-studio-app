import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({ id, label, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        id={inputId}
        className={`mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-3 focus:ring-purple-100 ${className}`}
        {...props}
      />
    </label>
  );
}
