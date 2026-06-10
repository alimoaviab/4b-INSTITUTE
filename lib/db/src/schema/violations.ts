import { pgTable, serial, timestamp, integer, text, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testSessionsTable } from "./sessions";
import { studentsTable } from "./students";

export const violationsTable = pgTable("violations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => testSessionsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("low"),
  capturedImageUrl: text("captured_image_url"),
  faceMatchScore: real("face_match_score"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertViolationSchema = createInsertSchema(violationsTable).omit({ id: true, createdAt: true });
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type Violation = typeof violationsTable.$inferSelect;
