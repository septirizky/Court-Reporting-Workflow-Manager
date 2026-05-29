import { Router } from "express";
import {
  listEditors,
  createEditor,
  updateEditor,
} from "../controllers/editors";

const router = Router();
router.get("/", listEditors);
router.post("/", createEditor);
router.patch("/:id", updateEditor);

export default router;
