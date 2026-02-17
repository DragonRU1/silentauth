import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import sessionRoutes from "./routes/session.routes";

const app = express();
const PORT = parseInt(process.env.PORT ?? "4000", 10);

app.use(cors());
app.use(express.json());

// ── Health ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sessions", sessionRoutes);

// ── Start ──────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[SilentAuth] Backend running on http://0.0.0.0:${PORT}`);
});
