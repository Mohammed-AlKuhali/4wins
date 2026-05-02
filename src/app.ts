import { Hono } from "hono";
import { cors } from "hono/cors";
import health from "./routes/health.js";
import auth from "./routes/auth.js";
import me from "./routes/me.js";
import today from "./routes/today.js";
import entriesRouter from "./routes/entries.js";
import aiRouter from "./routes/ai.js";
import voiceRouter from "./routes/voice.js";
import streakRouter from "./routes/streak.js";
import insightsRouter from "./routes/insights.js";
import subRouter from "./routes/subscription.js";
import webhooksRouter from "./routes/webhooks.js";
import notificationsRouter from "./routes/notifications.js";
import internalCronRouter from "./routes/internal_cron.js";
import { auditRouter } from "./routes/audit.js";
import { errorHandler } from "./middleware/error_handler.js";
import { requestLog } from "./middleware/request_log.js";
import { authLimiter } from "./middleware/rate_limit.js";
import { throwApiError } from "./lib/errors.js";

const app = new Hono();

app.onError(errorHandler);

app.use("*", requestLog);

app.use("/v1/auth/*", cors({ origin: "*" }));
app.use("/v1/health", cors({ origin: "*" }));

app.use("/v1/auth/*", authLimiter);

app.route("/v1/health", health);
app.route("/v1/auth", auth);
app.route("/v1/me", me);
app.route("/v1/today", today);
app.route("/v1/entries", entriesRouter);
app.route("/v1/ai", aiRouter);
app.route("/v1/voice", voiceRouter);
app.route("/v1/streak", streakRouter);
app.route("/v1/insights", insightsRouter);
app.route("/v1/subscription", subRouter);
app.route("/v1/webhooks", webhooksRouter);
app.route("/v1/notifications", notificationsRouter);
app.route("/v1/internal", internalCronRouter);
app.route("/v1/audit", auditRouter);

app.notFound((c) => {
  throwApiError("NOT_FOUND", "Route not found", 404);
});

export default app;
