import { z } from "zod";

// Base schemas
export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// 1. Admins
export const adminSchema = z.object({
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.enum(["superadmin", "admin"]).default("admin"),
  name: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Admin = z.infer<typeof adminSchema> & { _id: string };

// 2. Students
export const studentSchema = z.object({
  rollNumber: z.string(),
  cnic: z.string().regex(/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/, "Format: XXXXX-XXXXXXX-X"),
  name: z.string().min(2),
  fatherName: z.string().min(2),
  phone: z.string(),
  email: z.string().email().optional(),
  passwordHash: z.string().optional(), // For student portal login
  schoolCollege: z.string().optional(),
  program: z.string(),
  photoUrl: z.string().optional(),
  isEligible: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  blockReason: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Student = z.infer<typeof studentSchema> & { _id: string };

// 3. Applications
export const applicationSchema = z.object({
  studentId: z.string(), // References Student._id
  status: z.enum(["draft", "submitted", "approved", "rejected"]).default("draft"),
  fullName: z.string(),
  fatherName: z.string(),
  gender: z.string(),
  dateOfBirth: z.string(),
  pictureUrl: z.string().optional(),
  phone: z.string(),
  whatsapp: z.string().optional(),
  email: z.string().email(),
  address: z.string(),
  city: z.string(),
  district: z.string(),
  province: z.string(),
  schoolCollegeName: z.string(),
  previousClass: z.string(),
  board: z.string(),
  passingYear: z.string(),
  obtainedMarks: z.number().min(0),
  totalMarks: z.number().min(0),
  percentage: z.number().min(0).max(100),
  programSelection: z.string(),
  campusSelection: z.string(),
  guardianName: z.string(),
  guardianContact: z.string(),
  adminNotes: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Application = z.infer<typeof applicationSchema> & { _id: string };

// 4. Questions
export const questionSchema = z.object({
  category: z.string(),
  subject: z.string(),
  type: z.enum(["mcq", "true_false", "descriptive"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.array(z.string()).default([]),
  text: z.string(),
  options: z.array(z.string()).optional(), // For MCQ
  correctAnswer: z.string().optional(), // String match or option index stringified
  marks: z.number().default(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Question = z.infer<typeof questionSchema> & { _id: string };

// 5. Tests (Config)
export const testSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  durationMinutes: z.number(),
  totalMarks: z.number(),
  passingMarks: z.number(),
  negativeMarking: z.boolean().default(false),
  negativeMarksPerWrong: z.number().default(0),
  randomizeQuestions: z.boolean().default(true),
  randomizeOptions: z.boolean().default(true),
  questionIds: z.array(z.string()), // References Question._id
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Test = z.infer<typeof testSchema> & { _id: string };

// 6. Test Sessions / Attempts
export const testAttemptSchema = z.object({
  testId: z.string(),
  studentId: z.string(),
  status: z.enum(["in_progress", "submitted", "auto_submitted", "terminated"]).default("in_progress"),
  startTime: z.date(),
  endTime: z.date().optional(),
  answers: z.record(z.string(), z.string()).default({}), // questionId -> answer
  score: z.number().optional(),
  isPassed: z.boolean().optional(),
  cheatingFlags: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type TestAttempt = z.infer<typeof testAttemptSchema> & { _id: string };

// 7. Results
export const resultSchema = z.object({
  studentId: z.string(),
  testId: z.string(),
  attemptId: z.string(),
  totalMarks: z.number(),
  obtainedMarks: z.number(),
  percentage: z.number(),
  isPassed: z.boolean(),
  rank: z.number().optional(),
  createdAt: z.date().default(() => new Date()),
});
export type Result = z.infer<typeof resultSchema> & { _id: string };

// 8. Merit Lists
export const meritListSchema = z.object({
  title: z.string(),
  program: z.string(),
  status: z.enum(["draft", "published"]).default("draft"),
  students: z.array(z.object({
    studentId: z.string(),
    testScore: z.number(),
    academicScore: z.number(),
    aggregate: z.number(),
    rank: z.number(),
    status: z.enum(["selected", "waiting", "rejected"])
  })),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type MeritList = z.infer<typeof meritListSchema> & { _id: string };

// 9. Interviews
export const interviewSchema = z.object({
  studentId: z.string(),
  applicationId: z.string(),
  panelIds: z.array(z.string()), // References Admin._id
  scheduleDate: z.date(),
  status: z.enum(["scheduled", "completed", "no_show", "cancelled"]).default("scheduled"),
  marks: z.number().optional(),
  notes: z.string().optional(),
  finalStatus: z.enum(["pending", "selected", "rejected"]).default("pending"),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Interview = z.infer<typeof interviewSchema> & { _id: string };

// 10. Verification Logs
export const verificationLogSchema = z.object({
  studentId: z.string().optional(),
  rollNumberEntered: z.string(),
  cnicEntered: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  isSuccess: z.boolean(),
  failureReason: z.string().optional(),
  timestamp: z.date().default(() => new Date()),
});
export type VerificationLog = z.infer<typeof verificationLogSchema> & { _id: string };

// 11. Violations (Anti-cheating)
export const violationSchema = z.object({
  studentId: z.string(),
  testAttemptId: z.string(),
  type: z.enum(["tab_switch", "fullscreen_exit", "multiple_login", "copy_paste"]),
  timestamp: z.date().default(() => new Date()),
  details: z.string().optional(),
  severity: z.enum(["low", "medium", "high"]),
});
export type Violation = z.infer<typeof violationSchema> & { _id: string };

// 12. Settings
export const settingsSchema = z.object({
  key: z.string(),
  value: z.any(),
  updatedBy: z.string(),
  updatedAt: z.date().default(() => new Date()),
});
export type Setting = z.infer<typeof settingsSchema> & { _id: string };
