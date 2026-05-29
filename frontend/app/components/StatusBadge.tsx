import type { JobStatus } from "../lib/types";

const COLORS: Record<JobStatus, string> = {
  NEW: "bg-zinc-200 text-zinc-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  TRANSCRIBED: "bg-amber-100 text-amber-800",
  REVIEWED: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {status}
    </span>
  );
}
