import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { adminsCollection, getNextId } from "@workspace/db";
import crypto from "crypto";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function ensureDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@admission.edu.pk";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const existingAdmin = await adminsCollection.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  const id = await getNextId("admins");
  const passwordHash = crypto
    .createHash("sha256")
    .update(adminPassword + "admission_salt_2024")
    .digest("hex");

  await adminsCollection.insertOne({
    id,
    email: adminEmail,
    passwordHash,
    name: "Administrator",
    role: "admin",
    createdAt: new Date(),
  });

  logger.info({ email: adminEmail, id }, "Created default admin user");
}

await ensureDefaultAdmin();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
