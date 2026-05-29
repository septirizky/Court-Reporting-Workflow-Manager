import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sequelize } from "./config/database";
import "./models";
import jobsRouter from "./routes/jobs";
import reportersRouter from "./routes/reporters";
import editorsRouter from "./routes/editors";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/jobs", jobsRouter);
app.use("/api/reporters", reportersRouter);
app.use("/api/editors", editorsRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  try {
    await sequelize.authenticate();
    console.log("[db] connected");
    await sequelize.sync({ alter: true });
    console.log("[db] synced");
    app.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[startup] failed", err);
    process.exit(1);
  }
}

start();
