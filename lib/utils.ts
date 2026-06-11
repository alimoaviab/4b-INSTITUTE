import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "admission_salt_2024").digest("hex");
}

export function generateToken(adminId: number): string {
  return Buffer.from(`${adminId}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`).toString("base64");
}

export function parseToken(token: string): number | null {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const adminId = parseInt(decoded.split(":")[0], 10);
    return isNaN(adminId) ? null : adminId;
  } catch {
    return null;
  }
}
