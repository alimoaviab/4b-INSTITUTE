import { Router, type IRouter } from "express";
import { adminsCollection } from "@workspace/db";
import crypto from "crypto";
import { AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "admission_salt_2024").digest("hex");
}

function generateToken(adminId: number): string {
  return Buffer.from(`${adminId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`).toString("base64");
}

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const admin = await adminsCollection.findOne({ email });
  if (!admin) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const hash = hashPassword(password);
  if (hash !== admin.passwordHash) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(admin.id as number);
  res.json({
    token,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const adminId = parseInt(decoded.split(":")[0], 10);
    if (isNaN(adminId)) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const admin = await adminsCollection.findOne({ id: adminId });
    if (!admin) {
      res.status(401).json({ error: "Admin not found" });
      return;
    }

    res.json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
