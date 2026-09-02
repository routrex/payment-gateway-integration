import express from "express";
import { tesDatabaseConnection } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();
const port = process.env.PORT;

async function startServer() {  
  try {
    await tesDatabaseConnection();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.listen(port, () => {
      console.log("Server running on port", port);
    });
  } catch (err) {
    console.log(`Failed to start server! ${err}`);
    process.exit(1);
  }
}

startServer();

