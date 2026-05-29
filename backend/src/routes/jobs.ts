import { Router } from "express";
import {
  listJobs,
  getJob,
  createJob,
  assignReporter,
  assignEditor,
  updateStatus,
  getJobPayment,
  getPaymentSummary,
  suggestReporter,
} from "../controllers/jobs";

const router = Router();

router.get("/", listJobs);
router.post("/", createJob);
router.get("/payments/summary", getPaymentSummary);
router.get("/:id", getJob);
router.get("/:id/payment", getJobPayment);
router.get("/:id/suggest-reporter", suggestReporter);
router.post("/:id/assign-reporter", assignReporter);
router.post("/:id/assign-editor", assignEditor);
router.patch("/:id/status", updateStatus);

export default router;
