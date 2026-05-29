"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Editor, Job, Reporter } from "../lib/types";
import { JobRow } from "./JobRow";

export function JobsTable({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [j, r, e] = await Promise.all([
        api.listJobs(),
        api.listReporters(),
        api.listEditors(),
      ]);
      setJobs(j);
      setReporters(r);
      setEditors(e);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  return (
    <div>
      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/50">
            <tr>
              <th className="px-4 py-2.5 font-medium">Case</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Reporter</th>
              <th className="px-4 py-2.5 font-medium">Editor</th>
              <th className="px-4 py-2.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  Loading…
                </td>
              </tr>
            )}
            {!loading && jobs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-zinc-500"
                >
                  No jobs yet. Create one to get started.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                reporters={reporters}
                editors={editors}
                onChange={refresh}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
