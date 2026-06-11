import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "admission_salt_2024").digest("hex");
}

export function generateToken(adminId: number): string {
  return Buffer.from(`${adminId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`).toString("base64");
}

export function decodeToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const adminId = parseInt(decoded.split(":")[0], 10);
    return isNaN(adminId) ? null : adminId;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
