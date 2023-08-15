import {Sequelize} from "sequelize-typescript";
import {User} from "../model/user";
import dotenv from "dotenv";

dotenv.config();
export const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    models: [User],
});
