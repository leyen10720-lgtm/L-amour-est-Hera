import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initCharacterStore } from "./server/store.js";
import { apiRouter } from "./server/api.js";

async function startServer() {
  // Initialize persistent database
  initCharacterStore();

  const app = express();
  const PORT = 3000;

  // JSON & URL-encoded body parser with size limit for image uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Ensure public uploads folder exists and serve statically
  const publicUploads = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(publicUploads)) {
    fs.mkdirSync(publicUploads, { recursive: true });
  }
  app.use("/uploads", express.static(publicUploads));

  // Mount API endpoints
  app.use("/api", apiRouter);

  // Vite middleware for development / Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
