import "dotenv/config";
import { serve } from "@hono/node-server";
import { env } from "./lib/env.js";
import app from "./app.js";

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
    hostname: "0.0.0.0",
  },
  (info) => {
    console.log(`4Wins API running on http://localhost:${info.port}`);
  }
);
