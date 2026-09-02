import dotenv from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";

dotenv.config();

const adapter = new PrismaMariaDb({
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
});

export const prisma = new PrismaClient({ adapter });

export const tesDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully!");
  } catch (err) {
    throw err;
  }
};
