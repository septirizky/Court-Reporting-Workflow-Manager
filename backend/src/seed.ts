import { sequelize } from "./config/database";
import { Reporter } from "./models/Reporter";
import { Editor } from "./models/Editor";
import { Job } from "./models/Job";

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  const reporters = await Reporter.bulkCreate([
    { name: "Alice Parker", location: "Jakarta", ratePerMinute: 2000, available: true },
    { name: "Brian Cole", location: "Bandung", ratePerMinute: 2200, available: true },
    { name: "Clara Doyle", location: "Jakarta", ratePerMinute: 2500, available: true },
    { name: "Daniel Evans", location: "Surabaya", ratePerMinute: 2000, available: false },
  ]);

  const editors = await Editor.bulkCreate([
    { name: "Emma Foster", flatFee: 50000, available: true },
    { name: "Frank Hughes", flatFee: 75000, available: true },
    { name: "Grace Ingram", flatFee: 60000, available: true },
  ]);

  await Job.bulkCreate([
    {
      caseName: "Smith vs Jones Co.",
      durationMinutes: 90,
      locationType: "PHYSICAL",
      city: "Jakarta",
      status: "NEW",
      reporterId: null,
      editorId: null,
    },
    {
      caseName: "Riverside Land Dispute",
      durationMinutes: 120,
      locationType: "PHYSICAL",
      city: "Bandung",
      status: "ASSIGNED",
      reporterId: reporters[1].id,
      editorId: null,
    },
    {
      caseName: "International Arbitration X-Y",
      durationMinutes: 45,
      locationType: "REMOTE",
      city: null,
      status: "TRANSCRIBED",
      reporterId: reporters[0].id,
      editorId: null,
    },
    {
      caseName: "Breach of Contract #102",
      durationMinutes: 60,
      locationType: "REMOTE",
      city: null,
      status: "REVIEWED",
      reporterId: reporters[2].id,
      editorId: editors[0].id,
    },
    {
      caseName: "Corporate Hearing ABC",
      durationMinutes: 180,
      locationType: "PHYSICAL",
      city: "Jakarta",
      status: "COMPLETED",
      reporterId: reporters[0].id,
      editorId: editors[1].id,
    },
  ]);

  console.log("[seed] done");
  await sequelize.close();
}

seed().catch((err) => {
  console.error("[seed] failed", err);
  process.exit(1);
});
