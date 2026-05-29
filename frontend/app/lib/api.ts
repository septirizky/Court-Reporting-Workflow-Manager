import type {
  Editor,
  Job,
  JobLocationType,
  JobStatus,
  PaymentSummary,
  Reporter,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listJobs: () => request<Job[]>("/jobs"),
  createJob: (payload: {
    caseName: string;
    durationMinutes: number;
    locationType: JobLocationType;
    city?: string;
  }) =>
    request<Job>("/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  assignReporter: (jobId: number, reporterId: number) =>
    request<Job>(`/jobs/${jobId}/assign-reporter`, {
      method: "POST",
      body: JSON.stringify({ reporterId }),
    }),
  assignEditor: (jobId: number, editorId: number) =>
    request<Job>(`/jobs/${jobId}/assign-editor`, {
      method: "POST",
      body: JSON.stringify({ editorId }),
    }),
  updateStatus: (jobId: number, status: JobStatus) =>
    request<Job>(`/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  suggestReporter: (jobId: number) =>
    request<{ suggestion: Reporter | null }>(`/jobs/${jobId}/suggest-reporter`),
  paymentSummary: () => request<PaymentSummary>("/jobs/payments/summary"),
  listReporters: () => request<Reporter[]>("/reporters"),
  createReporter: (payload: {
    name: string;
    location: string;
    ratePerMinute?: number;
    available?: boolean;
  }) =>
    request<Reporter>("/reporters", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateReporter: (
    id: number,
    payload: Partial<{
      name: string;
      location: string;
      ratePerMinute: number;
      available: boolean;
    }>
  ) =>
    request<Reporter>(`/reporters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  listEditors: () => request<Editor[]>("/editors"),
  createEditor: (payload: {
    name: string;
    flatFee?: number;
    available?: boolean;
  }) =>
    request<Editor>("/editors", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateEditor: (
    id: number,
    payload: Partial<{ name: string; flatFee: number; available: boolean }>
  ) =>
    request<Editor>(`/editors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
