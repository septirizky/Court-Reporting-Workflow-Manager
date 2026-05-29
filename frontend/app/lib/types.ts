export type JobStatus =
  | "NEW"
  | "ASSIGNED"
  | "TRANSCRIBED"
  | "REVIEWED"
  | "COMPLETED";

export type JobLocationType = "PHYSICAL" | "REMOTE";

export interface Reporter {
  id: number;
  name: string;
  location: string;
  available: boolean;
  ratePerMinute: number;
  activeJobCount?: number;
}

export interface Editor {
  id: number;
  name: string;
  available: boolean;
  flatFee: number;
  activeJobCount?: number;
}

export interface Job {
  id: number;
  caseName: string;
  durationMinutes: number;
  locationType: JobLocationType;
  city: string | null;
  status: JobStatus;
  reporterId: number | null;
  editorId: number | null;
  reporter: Reporter | null;
  editor: Editor | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobPayment {
  jobId: number;
  caseName: string;
  status: JobStatus;
  durationMinutes: number;
  reporter: { id: number; name: string; ratePerMinute: number; earnings: number } | null;
  editor: { id: number; name: string; flatFee: number; earnings: number } | null;
  total: number;
}

export interface PaymentSummary {
  jobs: JobPayment[];
  totals: {
    reporters: number;
    editors: number;
    grandTotal: number;
  };
}

export const STATUS_FLOW: JobStatus[] = [
  "NEW",
  "ASSIGNED",
  "TRANSCRIBED",
  "REVIEWED",
  "COMPLETED",
];

export function nextStatus(status: JobStatus): JobStatus | null {
  const idx = STATUS_FLOW.indexOf(status);
  if (idx < 0 || idx === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[idx + 1];
}
