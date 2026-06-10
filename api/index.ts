import app from '../artifacts/api-server/src/app';
import { adminsCollection, getNextId } from "@workspace/db";
import crypto from "crypto";
import { logger } from "../artifacts/api-server/src/lib/logger";

let initialized = false;

async function ensureDefaultAdmin(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@admission.edu.pk";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const existingAdmin = await adminsCollection.findOne({ email: adminEmail });
  if (existingAdmin) return;
  const id = await getNextId("admins");
  const passwordHash = crypto.createHash("sha256").update(adminPassword + "admission_salt_2024").digest("hex");
  await adminsCollection.insertOne({
    id, email: adminEmail, passwordHash, name: "Administrator", role: "admin", createdAt: new Date()
  });
  logger.info({ email: adminEmail, id }, "Created default admin user");
}

export default async function handler(req: any, res: any) {
  if (!initialized) {
    try {
      await ensureDefaultAdmin();
    } catch (err) {
      console.error(err);
    }
    initialized = true;
  }
  return app(req, res);
}
