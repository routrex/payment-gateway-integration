import express from "express";
import { tesDatabaseConnection } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import productsRoutes from "./src/routes/productsRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js"

const app = express();
const port = process.env.PORT;

async function startServer() {
  try {
    await tesDatabaseConnection();
    app.use(express.json());
    app.use("/api/auth", authRoutes);
    app.use("/api", productsRoutes);
    app.use("/api", customerRoutes);
    app.listen(port, () => {
      console.log("Server running on port", port);
    });
  } catch (err) {
    console.log(`Failed to start server! ${err}`);
    process.exit(1);
  }
}

startServer();
