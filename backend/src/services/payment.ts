import { Job } from "../models/Job";
import { Reporter } from "../models/Reporter";
import { Editor } from "../models/Editor";

export interface JobPayment {
  jobId: number;
  caseName: string;
  status: string;
  durationMinutes: number;
  reporter: {
    id: number;
    name: string;
    ratePerMinute: number;
    earnings: number;
  } | null;
  editor: {
    id: number;
    name: string;
    flatFee: number;
    earnings: number;
  } | null;
  total: number;
}

export function calculateJobPayment(
  job: Job & { reporter?: Reporter | null; editor?: Editor | null }
): JobPayment {
  const reporterEarnings = job.reporter
    ? job.reporter.ratePerMinute * job.durationMinutes
    : 0;

  const editorEarnings =
    job.editor && (job.status === "REVIEWED" || job.status === "COMPLETED")
      ? job.editor.flatFee
      : 0;

  return {
    jobId: job.id,
    caseName: job.caseName,
    status: job.status,
    durationMinutes: job.durationMinutes,
    reporter: job.reporter
      ? {
          id: job.reporter.id,
          name: job.reporter.name,
          ratePerMinute: job.reporter.ratePerMinute,
          earnings: reporterEarnings,
        }
      : null,
    editor: job.editor
      ? {
          id: job.editor.id,
          name: job.editor.name,
          flatFee: job.editor.flatFee,
          earnings: editorEarnings,
        }
      : null,
    total: reporterEarnings + editorEarnings,
  };
}
