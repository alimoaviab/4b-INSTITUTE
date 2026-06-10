import { Router, type IRouter } from "express";
import {
  studentsCollection,
  verificationLogsCollection,
  activityLogCollection,
  getNextId,
  omitMongoId,
} from "@workspace/db";
import {
  CheckStudentRecordBody,
  SubmitVerificationAttemptBody,
  ListVerificationLogsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/verification/check", async (req, res): Promise<void> => {
  const parsed = CheckStudentRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { rollNumber, cnic } = parsed.data;
  const student = await studentsCollection.findOne({ rollNumber, cnic });
  if (!student) {
    res.status(404).json({ error: "No matching record found" });
    return;
  }
  if (student.isBlocked) {
    res.status(403).json({ error: "Access denied. Your account has been blocked." });
    return;
  }
  if (!student.isEligible) {
    res.status(403).json({ error: "You are not eligible for this test." });
    return;
  }

  res.json({
    found: true,
    studentName: student.name,
    photoUrl: student.photoUrl ?? "",
    studentId: student.id,
  });
});

router.post("/verification/attempt", async (req, res): Promise<void> => {
  const parsed = SubmitVerificationAttemptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, faceMatchScore, capturedImageBase64, deviceInfo, ipAddress, browserInfo } = parsed.data;
  const student = await studentsCollection.findOne({ id: studentId });
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const score = faceMatchScore ?? 0;
  const success = score >= 80;
  const now = new Date();

  await verificationLogsCollection.insertOne({
    id: await getNextId("verification_logs"),
    studentId,
    success,
    faceMatchScore: score,
    capturedImageUrl: null,
    deviceInfo: deviceInfo ?? null,
    ipAddress: ipAddress ?? null,
    browserInfo: browserInfo ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await activityLogCollection.insertOne({
    id: await getNextId("activity_log"),
    type: success ? "verification_success" : "verification_failed",
    description: success
      ? `Student ${student.name} verified successfully`
      : `Verification failed for ${student.name} - face match ${score.toFixed(1)}%`,
    studentName: student.name,
    studentId: student.id,
    createdAt: now,
    updatedAt: now,
  });

  if (success) {
    const sessionToken = Buffer.from(`${studentId}:verified:${Date.now()}`).toString("base64");
    res.json({ success: true, message: "Verification successful", sessionToken, faceMatchScore: score, studentId });
  } else {
    res.json({
      success: false,
      message: `Face match failed (${score.toFixed(1)}%). Please try again.`,
      sessionToken: null,
      faceMatchScore: score,
      studentId: null,
    });
  }
});

router.get("/verification/logs", async (req, res): Promise<void> => {
  const params = ListVerificationLogsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const studentId = params.success ? params.data.studentId : undefined;
  const successFilter = params.success ? params.data.success : undefined;

  const filter: Record<string, unknown> = {};
  if (studentId !== undefined) filter.studentId = studentId;
  if (successFilter !== undefined) filter.success = successFilter;

  const [logs, total] = await Promise.all([
    verificationLogsCollection.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    verificationLogsCollection.countDocuments(filter),
  ]);

  const studentIds = [...new Set(logs.map((log) => log.studentId))];
  const students = await studentsCollection.find({ id: { $in: studentIds } }).toArray();
  const studentMap = new Map(students.map((student) => [student.id, student]));

  const data = logs.map((log) => ({
    ...omitMongoId(log),
    studentName: studentMap.get(log.studentId)?.name ?? null,
    rollNumber: studentMap.get(log.studentId)?.rollNumber ?? null,
  }));

  res.json({ data, total, page, limit });
});

export default router;
