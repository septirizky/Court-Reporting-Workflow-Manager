import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_NAME = "voicescript_db",
  DB_SSL,
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: "postgres",
  logging: false,
  dialectOptions:
    DB_SSL === "true"
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : undefined,
});
