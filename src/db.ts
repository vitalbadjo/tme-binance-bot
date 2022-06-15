import { DataTypes, Sequelize } from "sequelize"
import { getEnv } from "./utils"

export const db = new Sequelize({
	// database: "bnnc",
	// username: "root",
	// password: "root",
	// host: "188.246.228.236",
	// port: 6432,
	// dialect: "postgres"
	database: getEnv("DB_NAME"),
	username: getEnv("DB_USER"),
	password: getEnv("DB_PASS"),
	host: getEnv("DB_HOST"),
	port: parseInt(getEnv("DB_PORT")),
	dialect: "postgres",
})

export const User = db.define("user", {
	id: {type: DataTypes.INTEGER, primaryKey: true, unique: true, autoIncrement: true},
	chatId: {type: DataTypes.STRING, unique: true}
})
