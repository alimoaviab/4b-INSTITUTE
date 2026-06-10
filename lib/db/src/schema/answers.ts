import { pgTable, serial, timestamp, integer, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { testSessionsTable } from "./sessions";
import { questionsTable } from "./questions";

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => testSessionsTable.id),
  questionId: integer("question_id").notNull().references(() => questionsTable.id),
  selectedOption: text("selected_option").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
  markedForReview: boolean("marked_for_review").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAnswerSchema = createInsertSchema(answersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;
export type Answer = typeof answersTable.$inferSelect;
