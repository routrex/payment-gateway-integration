import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const connectMysql2 = mysql2.createPool({
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
});

export const tesDatabaseConnection = async () => {
  try {
    const tesConnect = await connectMysql2.getConnection()
    console.log("Database connected successfully!")
    tesConnect.release()
  } catch (err) {
    throw err;
  }
};
