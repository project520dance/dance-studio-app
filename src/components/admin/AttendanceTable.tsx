"use client";

import {
  AttendanceRow,
  type AttendanceFormValue,
} from "@/components/admin/AttendanceRow";
import type { AttendanceRecord } from "@/types/attendance";
import type { Dancer } from "@/types/dancer";

export function AttendanceTable({
  dancers,
  records,
  values,
  disabled,
  onChange,
}: {
  dancers: Dancer[];
  records: Map<string, AttendanceRecord>;
  values: Map<string, AttendanceFormValue>;
  disabled: boolean;
  onChange: (dancerId: string, value: AttendanceFormValue) => void;
}) {
  if (dancers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-purple-200 bg-white p-8 text-center">
        No active dancers match this search.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {dancers.map((dancer) => (
        <AttendanceRow
          key={dancer.id}
          dancer={dancer}
          savedRecord={records.get(dancer.id)}
          value={values.get(dancer.id) ?? { status: "", notes: "" }}
          disabled={disabled}
          onChange={(value) => onChange(dancer.id, value)}
        />
      ))}
    </div>
  );
}
