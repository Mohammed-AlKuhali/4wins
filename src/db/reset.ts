import "dotenv/config";
import postgres from "postgres";

if (process.env.NODE_ENV === "production") {
  throw new Error("db:reset is not allowed in production.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const client = postgres(connectionString);

await client`DROP SCHEMA public CASCADE`;
await client`CREATE SCHEMA public`;
console.log("Schema reset. Run db:migrate to re-apply migrations.");
await client.end();
