"use client";

import { useState } from "react";
import { api } from "../lib/api";
import type { JobLocationType } from "../lib/types";

export function CreateJobForm({ onCreated }: { onCreated: () => void }) {
  const [caseName, setCaseName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [locationType, setLocationType] = useState<JobLocationType>("REMOTE");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.createJob({
        caseName,
        durationMinutes: Number(durationMinutes),
        locationType,
        city: locationType === "PHYSICAL" ? city : undefined,
      });
      setCaseName("");
      setDurationMinutes(60);
      setLocationType("REMOTE");
      setCity("");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Case name">
          <input
            value={caseName}
            onChange={(e) => setCaseName(e.target.value)}
            required
            placeholder="Smith vs Jones Co."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white"
          />
        </Field>
        <Field label="Duration (minutes)">
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white"
          />
        </Field>
        <Field label="Location type">
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as JobLocationType)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white"
          >
            <option value="REMOTE">Remote</option>
            <option value="PHYSICAL">Physical</option>
          </select>
        </Field>
        {locationType === "PHYSICAL" && (
          <Field label="City">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="Jakarta"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-white dark:focus:ring-white"
            />
          </Field>
        )}
      </div>
      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {busy ? "Saving…" : "Create job"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col text-sm">
      <span className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}
