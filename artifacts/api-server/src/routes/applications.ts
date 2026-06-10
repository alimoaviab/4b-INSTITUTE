import { Router, type IRouter } from "express";
import { applicationsCollection, studentsCollection, activityLogCollection, getNextId, omitMongoId } from "@workspace/db";
import { 
  CreateApplicationBody,
  UpdateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  DeleteApplicationParams,
  GetApplicationByStudentParams,
  ListApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/applications", async (req, res): Promise<void> => {
  const params = ListApplicationsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;
  const search = params.success ? params.data.search : undefined;
  const status = params.success ? params.data.status : undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) filter.fullName = { $regex: search, $options: "i" };

  const [rows, total] = await Promise.all([
    applicationsCollection.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
    applicationsCollection.countDocuments(filter),
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

router.post("/applications", async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const application = {
    id: await getNextId("applications"),
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };

  await applicationsCollection.insertOne(application);

  const student = await studentsCollection.findOne({ id: parsed.data.studentId });
  await activityLogCollection.insertOne({
    id: await getNextId("activity_log"),
    type: "application_submitted",
    description: `New application submitted by ${student?.name ?? "Unknown"}`,
    studentName: student?.name ?? null,
    studentId: parsed.data.studentId,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json(omitMongoId(application));
});

router.get("/applications/by-student/:studentId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["studentId"]) ? req.params["studentId"][0] : req.params["studentId"];
  const params = GetApplicationByStudentParams.safeParse({ studentId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const app = await applicationsCollection.find({ studentId: params.data.studentId }).sort({ createdAt: -1 }).limit(1).next();
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(omitMongoId(app));
});

router.get("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const app = await applicationsCollection.findOne({ id: params.data.id });
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  res.json(omitMongoId(app));
});

router.patch("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateApplicationParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await applicationsCollection.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result.value) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const app = result.value;
  if (parsed.data.status === "approved" || parsed.data.status === "rejected") {
    const student = await studentsCollection.findOne({ id: app.studentId });
    await activityLogCollection.insertOne({
      id: await getNextId("activity_log"),
      type: `application_${parsed.data.status}`,
      description: `Application ${parsed.data.status} for ${student?.name ?? "Unknown"}`,
      studentName: student?.name ?? null,
      studentId: app.studentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  res.json(omitMongoId(app));
});

router.delete("/applications/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const id = parseInt(raw, 10);
  await applicationsCollection.deleteOne({ id });
  res.sendStatus(204);
});

export default router;
