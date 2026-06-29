"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";
import type { Dancer } from "@/types/dancer";

export type AttendanceFormValue = {
  status: AttendanceStatus | "";
  notes: string;
};

const statusLabels = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

export function AttendanceRow({
  dancer,
  savedRecord,
  value,
  disabled,
  onChange,
}: {
  dancer: Dancer;
  savedRecord?: AttendanceRecord;
  value: AttendanceFormValue;
  disabled: boolean;
  onChange: (value: AttendanceFormValue) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{dancer.firstName} {dancer.lastName}</h2>
        {savedRecord && (
          <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">
            Saved: {statusLabels[savedRecord.status]}
          </span>
        )}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          disabled={disabled}
          value={value.status}
          onChange={(event) => onChange({
            ...value,
            status: event.target.value as AttendanceStatus | "",
          })}
        >
          <option value="" disabled={Boolean(savedRecord)}>Unmarked</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </Select>
        <Input
          label="Notes"
          disabled={disabled || !value.status}
          value={value.notes}
          onChange={(event) => onChange({
            ...value,
            notes: event.target.value,
          })}
        />
      </div>
    </article>
  );
}
