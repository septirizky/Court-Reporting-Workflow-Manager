"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "./lib/api";
import type { Job, PaymentSummary } from "./lib/types";
import { PageHeader } from "./components/PageHeader";
import { StatCard } from "./components/StatCard";
import { Card } from "./components/Card";
import { StatusBadge } from "./components/StatusBadge";
import { formatIDR } from "./lib/format";

export default function OverviewPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.listJobs(), api.paymentSummary()])
      .then(([j, s]) => {
        setJobs(j);
        setSummary(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  const inProgress = jobs.filter((j) => j.status !== "COMPLETED").length;
  const completed = statusCounts.COMPLETED ?? 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Snapshot of jobs, assignments, and payouts."
        action={
          <Link
            href="/jobs"
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Manage jobs
          </Link>
        }
      />
      <div className="flex flex-col gap-6 p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total jobs" value={loading ? "—" : jobs.length} />
          <StatCard label="In progress" value={loading ? "—" : inProgress} />
          <StatCard label="Completed" value={loading ? "—" : completed} />
          <StatCard
            label="Total payouts"
            value={loading || !summary ? "—" : formatIDR(summary.totals.grandTotal)}
            accent
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Status breakdown" className="lg:col-span-1">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {(["NEW", "ASSIGNED", "TRANSCRIBED", "REVIEWED", "COMPLETED"] as const).map(
                (s) => (
                  <li
                    key={s}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <StatusBadge status={s} />
                    <span className="font-medium tabular-nums">
                      {statusCounts[s] ?? 0}
                    </span>
                  </li>
                )
              )}
            </ul>
          </Card>

          <Card
            title="Recent jobs"
            className="lg:col-span-2"
            action={
              <Link
                href="/jobs"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                View all →
              </Link>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Case</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.slice(0, 5).map((j) => (
                    <tr
                      key={j.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{j.caseName}</div>
                        <div className="text-xs text-zinc-500">
                          {j.durationMinutes} min
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={j.status} />
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {j.reporter?.name ?? (
                          <span className="text-zinc-400">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && jobs.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-sm text-zinc-500"
                      >
                        No jobs yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
