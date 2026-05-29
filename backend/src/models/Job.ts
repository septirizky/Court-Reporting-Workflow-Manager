import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database";
import { Reporter } from "./Reporter";
import { Editor } from "./Editor";

export type JobStatus =
  | "NEW"
  | "ASSIGNED"
  | "TRANSCRIBED"
  | "REVIEWED"
  | "COMPLETED";

export type JobLocationType = "PHYSICAL" | "REMOTE";

export const JOB_STATUS_FLOW: JobStatus[] = [
  "NEW",
  "ASSIGNED",
  "TRANSCRIBED",
  "REVIEWED",
  "COMPLETED",
];

export class Job extends Model<
  InferAttributes<Job>,
  InferCreationAttributes<Job>
> {
  declare id: CreationOptional<number>;
  declare caseName: string;
  declare durationMinutes: number;
  declare locationType: JobLocationType;
  declare city: CreationOptional<string | null>;
  declare status: CreationOptional<JobStatus>;
  declare reporterId: ForeignKey<Reporter["id"]> | null;
  declare editorId: ForeignKey<Editor["id"]> | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  declare reporter?: NonAttribute<Reporter>;
  declare editor?: NonAttribute<Editor>;
}

Job.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseName: { type: DataTypes.STRING, allowNull: false },
    durationMinutes: { type: DataTypes.INTEGER, allowNull: false },
    locationType: {
      type: DataTypes.ENUM("PHYSICAL", "REMOTE"),
      allowNull: false,
    },
    city: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("NEW", "ASSIGNED", "TRANSCRIBED", "REVIEWED", "COMPLETED"),
      defaultValue: "NEW",
    },
    reporterId: { type: DataTypes.INTEGER, allowNull: true },
    editorId: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "jobs" }
);

Reporter.hasMany(Job, { foreignKey: "reporterId", as: "jobs" });
Job.belongsTo(Reporter, { foreignKey: "reporterId", as: "reporter" });

Editor.hasMany(Job, { foreignKey: "editorId", as: "editedJobs" });
Job.belongsTo(Editor, { foreignKey: "editorId", as: "editor" });
