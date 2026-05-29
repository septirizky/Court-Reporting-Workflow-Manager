"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Reporter } from "../lib/types";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { formatIDR } from "../lib/format";
import { AvailabilityToggle } from "../components/AvailabilityToggle";

export default function ReportersPage() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState(2000);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      setReporters(await api.listReporters());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.createReporter({ name, location, ratePerMinute: rate });
      setName("");
      setLocation("");
      setRate(2000);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleAvailability(reporter: Reporter, next: boolean) {
    try {
      const updated = await api.updateReporter(reporter.id, { available: next });
      setReporters((rs) => rs.map((r) => (r.id === reporter.id ? updated : r)));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Reporters"
        description="People who attend hearings and produce raw transcripts."
      />
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <Card title="Add reporter" className="lg:col-span-1">
          <form onSubmit={submit} className="flex flex-col gap-3 p-4">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                className={inputClass}
              />
            </Field>
            <Field label="Location (city)">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="Jakarta"
                className={inputClass}
              />
            </Field>
            <Field label="Rate per minute (IDR)">
              <input
                type="number"
                min={0}
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className={inputClass}
              />
            </Field>
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {busy ? "Saving…" : "Add reporter"}
            </button>
          </form>
        </Card>

        <Card title={`All reporters (${reporters.length})`} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Location</th>
                  <th className="px-4 py-2.5 font-medium">Rate / min</th>
                  <th className="px-4 py-2.5 font-medium">Active jobs</th>
                  <th className="px-4 py-2.5 font-medium">Availability</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500">
                      Loading…
                    </td>
                  </tr>
                )}
                {reporters.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">{r.location}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatIDR(r.ratePerMinute)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {r.activeJobCount && r.activeJobCount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          {r.activeJobCount} in progress
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">Idle</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AvailabilityToggle
                        available={r.available}
                        onToggle={(next) => toggleAvailability(r, next)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
