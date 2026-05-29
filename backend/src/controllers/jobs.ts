import { Request, Response } from "express";
import { Job, JobStatus, JOB_STATUS_FLOW, JobLocationType } from "../models/Job";
import { Reporter } from "../models/Reporter";
import { Editor } from "../models/Editor";
import { calculateJobPayment } from "../services/payment";
import { suggestReporterForJob } from "../services/assignment";

const includeAssignees = [
  { model: Reporter, as: "reporter" },
  { model: Editor, as: "editor" },
];

export async function listJobs(_req: Request, res: Response) {
  const jobs = await Job.findAll({
    include: includeAssignees,
    order: [["createdAt", "DESC"]],
  });
  res.json(jobs);
}

export async function getJob(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id), { include: includeAssignees });
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
}

export async function createJob(req: Request, res: Response) {
  const { caseName, durationMinutes, locationType, city } = req.body as {
    caseName: string;
    durationMinutes: number;
    locationType: JobLocationType;
    city?: string;
  };

  if (!caseName || !durationMinutes || !locationType) {
    return res
      .status(400)
      .json({ error: "caseName, durationMinutes, locationType are required" });
  }
  if (!["PHYSICAL", "REMOTE"].includes(locationType)) {
    return res.status(400).json({ error: "locationType must be PHYSICAL or REMOTE" });
  }
  if (locationType === "PHYSICAL" && !city) {
    return res.status(400).json({ error: "city is required for PHYSICAL jobs" });
  }

  const job = await Job.create({
    caseName,
    durationMinutes,
    locationType,
    city: locationType === "PHYSICAL" ? city ?? null : null,
    status: "NEW",
    reporterId: null,
    editorId: null,
  });

  res.status(201).json(job);
}

export async function suggestReporter(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });
  const reporter = await suggestReporterForJob(job);
  res.json({ suggestion: reporter });
}

export async function assignReporter(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "NEW") {
    return res
      .status(400)
      .json({ error: `Cannot assign reporter when job is ${job.status}` });
  }

  const { reporterId } = req.body as { reporterId: number };
  if (!reporterId) return res.status(400).json({ error: "reporterId required" });

  const reporter = await Reporter.findByPk(reporterId);
  if (!reporter) return res.status(404).json({ error: "Reporter not found" });

  if (job.locationType === "PHYSICAL" && reporter.location !== job.city) {
    // Allowed but flagged for the UI to surface
  }

  job.reporterId = reporter.id;
  job.status = "ASSIGNED";
  await job.save();

  const fresh = await Job.findByPk(job.id, { include: includeAssignees });
  res.json(fresh);
}

export async function assignEditor(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "TRANSCRIBED") {
    return res
      .status(400)
      .json({ error: `Editor can only be assigned after transcription (current: ${job.status})` });
  }

  const { editorId } = req.body as { editorId: number };
  if (!editorId) return res.status(400).json({ error: "editorId required" });

  const editor = await Editor.findByPk(editorId);
  if (!editor) return res.status(404).json({ error: "Editor not found" });

  job.editorId = editor.id;
  await job.save();

  const fresh = await Job.findByPk(job.id, { include: includeAssignees });
  res.json(fresh);
}

export async function updateStatus(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id));
  if (!job) return res.status(404).json({ error: "Job not found" });

  const { status } = req.body as { status: JobStatus };
  if (!JOB_STATUS_FLOW.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const currentIdx = JOB_STATUS_FLOW.indexOf(job.status);
  const nextIdx = JOB_STATUS_FLOW.indexOf(status);
  if (nextIdx !== currentIdx + 1) {
    return res.status(400).json({
      error: `Invalid transition ${job.status} → ${status}. Must move one step forward.`,
    });
  }

  if (status === "TRANSCRIBED" && !job.reporterId) {
    return res
      .status(400)
      .json({ error: "Cannot transcribe a job without an assigned reporter" });
  }
  if (status === "REVIEWED" && !job.editorId) {
    return res
      .status(400)
      .json({ error: "Cannot review a job without an assigned editor" });
  }

  job.status = status;
  await job.save();

  const fresh = await Job.findByPk(job.id, { include: includeAssignees });
  res.json(fresh);
}

export async function getJobPayment(req: Request, res: Response) {
  const job = await Job.findByPk(Number(req.params.id), { include: includeAssignees });
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(calculateJobPayment(job));
}

export async function getPaymentSummary(_req: Request, res: Response) {
  const jobs = await Job.findAll({ include: includeAssignees });
  const perJob = jobs.map(calculateJobPayment);

  const totalReporterPay = perJob.reduce(
    (sum, j) => sum + (j.reporter?.earnings ?? 0),
    0
  );
  const totalEditorPay = perJob.reduce(
    (sum, j) => sum + (j.editor?.earnings ?? 0),
    0
  );

  res.json({
    jobs: perJob,
    totals: {
      reporters: totalReporterPay,
      editors: totalEditorPay,
      grandTotal: totalReporterPay + totalEditorPay,
    },
  });
}
