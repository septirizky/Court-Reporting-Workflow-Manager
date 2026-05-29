import { Op } from "sequelize";
import { Reporter } from "../models/Reporter";
import { Job } from "../models/Job";

/**
 * Pick a reporter for a job.
 * Rule: for PHYSICAL jobs, prefer reporters whose location matches job.city.
 * Falls back to any available reporter (works for REMOTE).
 */
export async function suggestReporterForJob(
  job: Pick<Job, "locationType" | "city">
): Promise<Reporter | null> {
  if (job.locationType === "PHYSICAL" && job.city) {
    const sameCity = await Reporter.findOne({
      where: { available: true, location: job.city },
    });
    if (sameCity) return sameCity;
  }
  return Reporter.findOne({
    where: {
      available: true,
      ...(job.locationType === "PHYSICAL" && job.city
        ? { location: { [Op.ne]: job.city } }
        : {}),
    },
  });
}
