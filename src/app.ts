import { Hono } from "hono";
import { cors } from "hono/cors";
import health from "./routes/health.js";
import auth from "./routes/auth.js";
import me from "./routes/me.js";
import today from "./routes/today.js";
import entriesRouter from "./routes/entries.js";
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

app.notFound((c) => {
  throwApiError("NOT_FOUND", "Route not found", 404);
});

export default app;
