import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

export class Reporter extends Model<
  InferAttributes<Reporter>,
  InferCreationAttributes<Reporter>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare location: string;
  declare available: CreationOptional<boolean>;
  declare ratePerMinute: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Reporter.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    location: { type: DataTypes.STRING, allowNull: false },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    ratePerMinute: { type: DataTypes.INTEGER, defaultValue: 2000 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "reporters" }
);
