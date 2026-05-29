"use client";

import { useState } from "react";
import { api } from "../lib/api";
import type { Editor, Job, Reporter } from "../lib/types";
import { nextStatus } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { formatIDR } from "../lib/format";

export function JobRow({
  job,
  reporters,
  editors,
  onChange,
}: {
  job: Job;
  reporters: Reporter[];
  editors: Editor[];
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Reporter | null>(null);

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      onChange();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function suggest() {
    setError(null);
    try {
      const { suggestion } = await api.suggestReporter(job.id);
      setSuggestion(suggestion);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const next = nextStatus(job.status);
  const canAdvance =
    next &&
    !(next === "TRANSCRIBED" && !job.reporterId) &&
    !(next === "REVIEWED" && !job.editorId);

  const sortedReporters =
    job.locationType === "PHYSICAL" && job.city
      ? [...reporters].sort((a, b) => {
          const aMatch = a.location === job.city ? 0 : 1;
          const bMatch = b.location === job.city ? 0 : 1;
          return aMatch - bMatch;
        })
      : reporters;

  return (
    <tr className="border-b border-zinc-200 align-top last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
      <td className="px-4 py-3">
        <div className="font-medium text-zinc-900 dark:text-zinc-100">
          {job.caseName}
        </div>
        <div className="mt-0.5 text-xs text-zinc-500">
          #{job.id} · {job.durationMinutes} min ·{" "}
          {job.locationType === "PHYSICAL"
            ? `Physical (${job.city})`
            : "Remote"}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3 text-sm">
        {job.reporter ? (
          <div>
            <div className="font-medium">{job.reporter.name}</div>
            <div className="text-xs text-zinc-500">
              {job.reporter.location} · {formatIDR(job.reporter.ratePerMinute)}/min
            </div>
          </div>
        ) : job.status === "NEW" ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <select
                disabled={busy}
                defaultValue=""
                onChange={(e) => {
                  const id = Number(e.target.value);
                  if (id) run(() => api.assignReporter(job.id, id));
                }}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="" disabled>
                  Assign reporter…
                </option>
                {sortedReporters
                  .filter((r) => r.available)
                  .map((r) => {
                    const sameCity =
                      job.locationType === "PHYSICAL" &&
                      r.location === job.city;
                    const busyTag =
                      r.activeJobCount && r.activeJobCount > 0
                        ? ` — busy: ${r.activeJobCount}`
                        : "";
                    return (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.location})
                        {sameCity ? " ★" : ""}
                        {busyTag}
                      </option>
                    );
                  })}
              </select>
              <button
                type="button"
                onClick={suggest}
                disabled={busy}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Suggest
              </button>
            </div>
            {suggestion && (
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                Suggested:{" "}
                <button
                  type="button"
                  className="font-medium underline"
                  onClick={() =>
                    run(() => api.assignReporter(job.id, suggestion.id))
                  }
                >
                  {suggestion.name} ({suggestion.location})
                </button>
              </div>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm">
        {job.editor ? (
          <div>
            <div className="font-medium">{job.editor.name}</div>
            <div className="text-xs text-zinc-500">
              Flat {formatIDR(job.editor.flatFee)}
            </div>
          </div>
        ) : job.status === "TRANSCRIBED" ? (
          <select
            disabled={busy}
            defaultValue=""
            onChange={(e) => {
              const id = Number(e.target.value);
              if (id) run(() => api.assignEditor(job.id, id));
            }}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="" disabled>
              Assign editor…
            </option>
            {editors
              .filter((e) => e.available)
              .map((e) => {
                const busyTag =
                  e.activeJobCount && e.activeJobCount > 0
                    ? ` — busy: ${e.activeJobCount}`
                    : "";
                return (
                  <option key={e.id} value={e.id}>
                    {e.name}
                    {busyTag}
                  </option>
                );
              })}
          </select>
        ) : (
          <span className="text-xs text-zinc-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-sm">
        {next ? (
          <button
            type="button"
            disabled={busy || !canAdvance}
            title={
              !canAdvance && next === "TRANSCRIBED"
                ? "No reporter assigned"
                : !canAdvance && next === "REVIEWED"
                ? "No editor assigned"
                : ""
            }
            onClick={() => run(() => api.updateStatus(job.id, next))}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-zinc-700 disabled:opacity-40 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Advance → {next}
          </button>
        ) : (
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Completed
          </span>
        )}
        {error && (
          <div className="mt-1 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </td>
    </tr>
  );
}
