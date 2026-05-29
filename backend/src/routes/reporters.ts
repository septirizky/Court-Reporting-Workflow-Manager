import { Router } from "express";
import {
  listReporters,
  createReporter,
  updateReporter,
} from "../controllers/reporters";

const router = Router();
router.get("/", listReporters);
router.post("/", createReporter);
router.patch("/:id", updateReporter);

export default router;
