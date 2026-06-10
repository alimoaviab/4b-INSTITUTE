import { Router, type IRouter } from "express";
import {
  resultsCollection,
  studentsCollection,
  answersCollection,
  questionsCollection,
  omitMongoId,
} from "@workspace/db";
import {
  GetResultParams,
  GetResultByStudentParams,
  ListResultsQueryParams,
  GetMeritListQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/results", async (req, res): Promise<void> => {
  const params = ListResultsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const testId = params.success ? params.data.testId : undefined;
  const status = params.success ? params.data.status : undefined;

  const filter: Record<string, unknown> = {};
  if (testId !== undefined) filter.testId = testId;
  if (status !== undefined) filter.status = status;

  const [rows, total] = await Promise.all([
    resultsCollection.find(filter).sort({ totalScore: -1 }).skip(offset).limit(limit).toArray(),
    resultsCollection.countDocuments(filter),
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

router.get("/results/merit-list", async (req, res): Promise<void> => {
  const params = GetMeritListQueryParams.safeParse(req.query);
  const testId = params.success ? params.data.testId : undefined;
  const limit = params.success ? (params.data.limit ?? 50) : 50;

  const filter: Record<string, unknown> = {};
  if (testId !== undefined) filter.testId = testId;

  const rows = await resultsCollection.find(filter).sort({ totalScore: -1 }).limit(limit).toArray();
  const studentIds = [...new Set(rows.map((row) => row.studentId))];
  const students = await studentsCollection.find({ id: { $in: studentIds } }).toArray();
  const studentMap = new Map(students.map((student) => [student.id, student]));

  const results = rows.map((row) => ({
    studentId: row.studentId,
    studentName: studentMap.get(row.studentId)?.name ?? null,
    rollNumber: studentMap.get(row.studentId)?.rollNumber ?? null,
    program: studentMap.get(row.studentId)?.program ?? null,
    totalScore: row.totalScore,
    percentage: row.percentage,
    status: row.status,
  }));

  const meritList = results.map((r, i) => ({ rank: i + 1, ...r }));
  res.json(meritList);
});

router.get("/results/by-student/:studentId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["studentId"]) ? req.params["studentId"][0] : req.params["studentId"];
  const params = GetResultByStudentParams.safeParse({ studentId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const rows = await resultsCollection.find({ studentId: params.data.studentId }).sort({ createdAt: -1 }).toArray();
  if (!rows[0]) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  const row = rows[0];
  const student = await studentsCollection.findOne({ id: row.studentId });

  res.json({
    ...omitMongoId(row),
    studentName: student?.name ?? null,
    rollNumber: student?.rollNumber ?? null,
  });
});

router.get("/results/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetResultParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await resultsCollection.findOne({ id: params.data.id });
  if (!result) {
    res.status(404).json({ error: "Result not found" });
    return;
  }

  const answers = await answersCollection.find({ sessionId: result.sessionId }).toArray();
  const questions = await questionsCollection.find({ testId: result.testId }).toArray();

  res.json({
    ...omitMongoId(result),
    answers: answers.map(omitMongoId),
    questions: questions.map(omitMongoId),
  });
});

export default router;
