import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const verificationLogsTable = pgTable("verification_logs", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  success: boolean("success").notNull().default(false),
  faceMatchScore: real("face_match_score").notNull().default(0),
  capturedImageUrl: text("captured_image_url"),
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  browserInfo: text("browser_info"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVerificationLogSchema = createInsertSchema(verificationLogsTable).omit({ id: true, createdAt: true });
export type InsertVerificationLog = z.infer<typeof insertVerificationLogSchema>;
export type VerificationLog = typeof verificationLogsTable.$inferSelect;
