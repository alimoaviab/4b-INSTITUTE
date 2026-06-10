import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id),
  fullName: text("full_name"),
  fatherName: text("father_name"),
  gender: text("gender"),
  dateOfBirth: text("date_of_birth"),
  pictureUrl: text("picture_url"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  district: text("district"),
  province: text("province"),
  schoolCollegeName: text("school_college_name"),
  previousClass: text("previous_class"),
  board: text("board"),
  passingYear: text("passing_year"),
  obtainedMarks: integer("obtained_marks"),
  totalMarks: integer("total_marks"),
  percentage: real("percentage"),
  programSelection: text("program_selection"),
  campusSelection: text("campus_selection"),
  guardianName: text("guardian_name"),
  guardianContact: text("guardian_contact"),
  status: text("status").notNull().default("draft"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
