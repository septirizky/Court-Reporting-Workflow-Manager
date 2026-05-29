import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../config/database";

export class Editor extends Model<
  InferAttributes<Editor>,
  InferCreationAttributes<Editor>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare available: CreationOptional<boolean>;
  declare flatFee: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Editor.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    available: { type: DataTypes.BOOLEAN, defaultValue: true },
    flatFee: { type: DataTypes.INTEGER, defaultValue: 50000 },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "editors" }
);
