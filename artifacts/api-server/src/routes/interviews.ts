import { Router, type IRouter } from "express";
import {
  interviewsCollection,
  studentsCollection,
  getNextId,
  omitMongoId,
} from "@workspace/db";
import {
  CreateInterviewBody,
  UpdateInterviewBody,
  GetInterviewParams,
  UpdateInterviewParams,
  DeleteInterviewParams,
  ListInterviewsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/interviews", async (req, res): Promise<void> => {
  const params = ListInterviewsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const status = params.success ? params.data.status : undefined;

  const filter: Record<string, unknown> = {};
  if (status !== undefined) filter.status = status;

  const [rows, total] = await Promise.all([
    interviewsCollection.find(filter).sort({ scheduledAt: -1 }).skip(offset).limit(limit).toArray(),
    interviewsCollection.countDocuments(filter),
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

router.post("/interviews", async (req, res): Promise<void> => {
  const parsed = CreateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const interview = {
    id: await getNextId("interviews"),
    ...parsed.data,
    scheduledAt: new Date(parsed.data.scheduledAt),
    createdAt: now,
    updatedAt: now,
  };

  await interviewsCollection.insertOne(interview);
  const student = await studentsCollection.findOne({ id: parsed.data.studentId });

  res.status(201).json({
    ...omitMongoId(interview),
    studentName: student?.name ?? null,
    rollNumber: student?.rollNumber ?? null,
  });
});

router.get("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const interview = await interviewsCollection.findOne({ id: params.data.id });
  if (!interview) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  const student = await studentsCollection.findOne({ id: interview.studentId });
  res.json({
    ...omitMongoId(interview),
    studentName: student?.name ?? null,
    rollNumber: student?.rollNumber ?? null,
  });
});

router.patch("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInterviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.scheduledAt) updateData.scheduledAt = new Date(parsed.data.scheduledAt);

  const result = await interviewsCollection.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...updateData, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result.value) {
    res.status(404).json({ error: "Interview not found" });
    return;
  }

  const student = await studentsCollection.findOne({ id: result.value.studentId });
  res.json({
    ...omitMongoId(result.value),
    studentName: student?.name ?? null,
    rollNumber: student?.rollNumber ?? null,
  });
});

router.delete("/interviews/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = DeleteInterviewParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await interviewsCollection.deleteOne({ id: params.data.id });
  res.sendStatus(204);
});

export default router;
