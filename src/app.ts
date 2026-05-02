import { Hono } from "hono";
import health from "./routes/health.js";

const app = new Hono();

app.route("/v1/health", health);

export default app;
