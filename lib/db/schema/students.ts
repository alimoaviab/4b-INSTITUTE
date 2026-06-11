import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNumber: text("roll_number").notNull().unique(),
  cnic: text("cnic").notNull(),
  name: text("name").notNull(),
  fatherName: text("father_name").notNull(),
  phone: text("phone").notNull(),
  schoolCollege: text("school_college"),
  program: text("program").notNull(),
  photoUrl: text("photo_url"),
  isEligible: boolean("is_eligible").notNull().default(true),
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockReason: text("block_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
