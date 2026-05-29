"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { PaymentSummary } from "../lib/types";
import { formatIDR } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { StatCard } from "./StatCard";

export function PaymentPanel() {
  const [data, setData] = useState<PaymentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.paymentSummary().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error)
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  if (!data)
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
        Loading…
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Reporter payouts"
          value={formatIDR(data.totals.reporters)}
          hint="Per-minute earnings, once assigned"
        />
        <StatCard
          label="Editor payouts"
          value={formatIDR(data.totals.editors)}
          hint="Flat fee, once reviewed"
        />
        <StatCard
          label="Grand total"
          value={formatIDR(data.totals.grandTotal)}
          accent
        />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h2 className="text-sm font-semibold">Per-job earnings</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-2.5 font-medium">Case</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Reporter</th>
                <th className="px-4 py-2.5 font-medium">Editor</th>
                <th className="px-4 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.jobs.map((j) => (
                <tr
                  key={j.jobId}
                  className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                >
                  <td className="px-4 py-3">{j.caseName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={j.status} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {j.reporter ? (
                      <>
                        <div className="font-medium text-zinc-700 dark:text-zinc-300">
                          {j.reporter.name}
                        </div>
                        <div className="text-zinc-500">
                          {formatIDR(j.reporter.earnings)}
                        </div>
                      </>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {j.editor ? (
                      <>
                        <div className="font-medium text-zinc-700 dark:text-zinc-300">
                          {j.editor.name}
                        </div>
                        <div className="text-zinc-500">
                          {formatIDR(j.editor.earnings)}
                        </div>
                      </>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatIDR(j.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
