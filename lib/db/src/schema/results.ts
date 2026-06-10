import { pgTable, serial, timestamp, integer, text, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testSessionsTable } from "./sessions";
import { studentsTable } from "./students";
import { testsTable } from "./tests";

export const resultsTable = pgTable("results", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => testSessionsTable.id),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  testId: integer("test_id").notNull().references(() => testsTable.id),
  totalScore: integer("total_score").notNull().default(0),
  totalMarks: integer("total_marks").notNull(),
  passingMarks: integer("passing_marks").notNull(),
  percentage: real("percentage").notNull().default(0),
  status: text("status").notNull().default("fail"),
  rank: integer("rank"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertResultSchema = createInsertSchema(resultsTable).omit({ id: true, createdAt: true });
export type InsertResult = z.infer<typeof insertResultSchema>;
export type Result = typeof resultsTable.$inferSelect;
