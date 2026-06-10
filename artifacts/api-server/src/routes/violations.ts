import { Router, type IRouter } from "express";
import {
  violationsCollection,
  studentsCollection,
  getNextId,
  omitMongoId,
} from "@workspace/db";
import {
  ReportViolationBody,
  ListViolationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/violations", async (req, res): Promise<void> => {
  const params = ListViolationsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const sessionId = params.success ? params.data.sessionId : undefined;
  const studentId = params.success ? params.data.studentId : undefined;
  const type = params.success ? params.data.type : undefined;

  const filter: Record<string, unknown> = {};
  if (sessionId !== undefined) filter.sessionId = sessionId;
  if (studentId !== undefined) filter.studentId = studentId;
  if (type !== undefined) filter.type = type;

  const [rows, total] = await Promise.all([
    violationsCollection.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    violationsCollection.countDocuments(filter),
  ]);

  const studentIds = [...new Set(rows.map((row) => row.studentId))];
  const students = await studentsCollection.find({ id: { $in: studentIds } }).toArray();
  const studentMap = new Map(students.map((student) => [student.id, student]));

  const data = rows.map((row) => ({
    ...omitMongoId(row),
    studentName: studentMap.get(row.studentId)?.name ?? null,
    rollNumber: studentMap.get(row.studentId)?.rollNumber ?? null,
  }));

  res.json({ data, total, page, limit });
});

router.post("/violations", async (req, res): Promise<void> => {
  const parsed = ReportViolationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const violation = {
    id: await getNextId("violations"),
    ...parsed.data,
    capturedImageUrl: null,
    createdAt: now,
    updatedAt: now,
  };

  await violationsCollection.insertOne(violation);
  const student = await studentsCollection.findOne({ id: violation.studentId });

  res.status(201).json({
    ...omitMongoId(violation),
    studentName: student?.name ?? null,
    rollNumber: student?.rollNumber ?? null,
  });
});

export default router;
