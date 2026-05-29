import { Request, Response } from "express";
import { Op, fn, col } from "sequelize";
import { Reporter } from "../models/Reporter";
import { Job } from "../models/Job";

async function activeCountsByReporter(
  ids: number[]
): Promise<Map<number, number>> {
  if (ids.length === 0) return new Map();
  const rows = (await Job.findAll({
    attributes: ["reporterId", [fn("COUNT", col("id")), "count"]],
    where: { reporterId: ids, status: { [Op.ne]: "COMPLETED" } },
    group: ["reporterId"],
    raw: true,
  })) as unknown as Array<{ reporterId: number; count: string }>;
  return new Map(rows.map((r) => [r.reporterId, Number(r.count)]));
}

export async function listReporters(_req: Request, res: Response) {
  const reporters = await Reporter.findAll({ order: [["name", "ASC"]] });
  const counts = await activeCountsByReporter(reporters.map((r) => r.id));
  res.json(
    reporters.map((r) => ({
      ...r.toJSON(),
      activeJobCount: counts.get(r.id) ?? 0,
    }))
  );
}

export async function createReporter(req: Request, res: Response) {
  const { name, location, ratePerMinute, available } = req.body as {
    name: string;
    location: string;
    ratePerMinute?: number;
    available?: boolean;
  };
  if (!name || !location) {
    return res.status(400).json({ error: "name and location are required" });
  }
  const reporter = await Reporter.create({
    name,
    location,
    ratePerMinute: ratePerMinute ?? 2000,
    available: available ?? true,
  });
  res.status(201).json({ ...reporter.toJSON(), activeJobCount: 0 });
}

export async function updateReporter(req: Request, res: Response) {
  const reporter = await Reporter.findByPk(Number(req.params.id));
  if (!reporter) return res.status(404).json({ error: "Reporter not found" });

  const { name, location, ratePerMinute, available } = req.body as {
    name?: string;
    location?: string;
    ratePerMinute?: number;
    available?: boolean;
  };

  if (name !== undefined) reporter.name = name;
  if (location !== undefined) reporter.location = location;
  if (ratePerMinute !== undefined) reporter.ratePerMinute = ratePerMinute;
  if (available !== undefined) reporter.available = available;
  await reporter.save();

  const counts = await activeCountsByReporter([reporter.id]);
  res.json({ ...reporter.toJSON(), activeJobCount: counts.get(reporter.id) ?? 0 });
}
