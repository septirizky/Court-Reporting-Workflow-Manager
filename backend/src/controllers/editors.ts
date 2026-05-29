import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { Editor } from "../models/Editor";
import { Job } from "../models/Job";

async function activeCountsByEditor(
  ids: number[]
): Promise<Map<number, number>> {
  if (ids.length === 0) return new Map();
  const rows = (await Job.findAll({
    attributes: ["editorId", [fn("COUNT", col("id")), "count"]],
    where: { editorId: ids, status: { [Op.ne]: "COMPLETED" } },
    group: ["editorId"],
    raw: true,
  })) as unknown as Array<{ editorId: number; count: string }>;
  return new Map(rows.map((r) => [r.editorId, Number(r.count)]));
}

export async function listEditors(_req: Request, res: Response) {
  const editors = await Editor.findAll({ order: [["name", "ASC"]] });
  const counts = await activeCountsByEditor(editors.map((e) => e.id));
  res.json(
    editors.map((e) => ({
      ...e.toJSON(),
      activeJobCount: counts.get(e.id) ?? 0,
    }))
  );
}

export async function createEditor(req: Request, res: Response) {
  const { name, flatFee, available } = req.body as {
    name: string;
    flatFee?: number;
    available?: boolean;
  };
  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }
  const editor = await Editor.create({
    name,
    flatFee: flatFee ?? 50000,
    available: available ?? true,
  });
  res.status(201).json({ ...editor.toJSON(), activeJobCount: 0 });
}

export async function updateEditor(req: Request, res: Response) {
  const editor = await Editor.findByPk(Number(req.params.id));
  if (!editor) return res.status(404).json({ error: "Editor not found" });

  const { name, flatFee, available } = req.body as {
    name?: string;
    flatFee?: number;
    available?: boolean;
  };

  if (name !== undefined) editor.name = name;
  if (flatFee !== undefined) editor.flatFee = flatFee;
  if (available !== undefined) editor.available = available;
  await editor.save();

  const counts = await activeCountsByEditor([editor.id]);
  res.json({ ...editor.toJSON(), activeJobCount: counts.get(editor.id) ?? 0 });
}
