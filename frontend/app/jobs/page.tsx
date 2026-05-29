"use client";

import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { CreateJobForm } from "../components/CreateJobForm";
import { JobsTable } from "../components/JobsTable";

export default function JobsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Create new jobs, assign reporters and editors, and move them through the workflow."
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {showForm ? "Close" : "+ New job"}
          </button>
        }
      />
      <div className="flex flex-col gap-6 p-6">
        {showForm && (
          <Card title="Create new job">
            <CreateJobForm
              onCreated={() => {
                setShowForm(false);
                setRefreshKey((k) => k + 1);
              }}
            />
          </Card>
        )}
        <Card
          title="All jobs"
          action={
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Refresh
            </button>
          }
        >
          <JobsTable refreshKey={refreshKey} />
        </Card>
      </div>
    </>
  );
}
