import { Router, type IRouter } from "express";
import { studentsCollection, getNextId, omitMongoId } from "@workspace/db";
import {
  CreateStudentBody,
  UpdateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  DeleteStudentParams,
  BlockStudentParams,
  BlockStudentBody,
  BulkImportStudentsBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/students", async (req, res): Promise<void> => {
  const search = req.query["search"] as string | undefined;
  const program = req.query["program"] as string | undefined;
  const eligible = req.query["eligible"] as string | undefined;
  const page = parseInt((req.query["page"] as string) ?? "1", 10);
  const limit = parseInt((req.query["limit"] as string) ?? "20", 10);
  const offset = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { rollNumber: { $regex: search, $options: "i" } },
      { cnic: { $regex: search, $options: "i" } },
    ];
  }
  if (program) filter.program = program;
  if (eligible === "true") filter.isEligible = true;
  if (eligible === "false") filter.isEligible = false;

  const [data, total] = await Promise.all([
    studentsCollection.find(filter).sort({ createdAt: 1 }).skip(offset).limit(limit).toArray(),
    studentsCollection.countDocuments(filter),
  ]);

  res.json({ data: data.map(omitMongoId), total, page, limit });
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const student = {
    id: await getNextId("students"),
    ...parsed.data,
    isEligible: parsed.data.isEligible ?? true,
    isBlocked: parsed.data.isBlocked ?? false,
    blockReason: parsed.data.blockReason ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await studentsCollection.insertOne(student);
  res.status(201).json(omitMongoId(student));
});

router.get("/students/bulk-import", async (_req, res): Promise<void> => {
  res.status(405).json({ error: "Use POST" });
});

router.post("/students/bulk-import", async (req, res): Promise<void> => {
  const parsed = BulkImportStudentsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let imported = 0;
  const errors: string[] = [];

  for (const s of parsed.data.students) {
    try {
      const now = new Date();
      const student = {
        id: await getNextId("students"),
        ...s,
        isEligible: s.isEligible ?? true,
        isBlocked: s.isBlocked ?? false,
        blockReason: s.blockReason ?? null,
        createdAt: now,
        updatedAt: now,
      };
      await studentsCollection.insertOne(student);
      imported++;
    } catch (e) {
      errors.push(`Row ${imported + errors.length + 1}: ${String(e)}`);
    }
  }

  res.json({ imported, failed: errors.length, total: parsed.data.students.length, errors });
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetStudentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const student = await studentsCollection.findOne({ id: params.data.id });
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(omitMongoId(student));
});

router.patch("/students/:id/block", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = BlockStudentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = BlockStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = await studentsCollection.findOneAndUpdate(
    { id: params.data.id },
    {
      $set: {
        isBlocked: parsed.data.isBlocked,
        blockReason: parsed.data.blockReason ?? null,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  if (!updated.value) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(omitMongoId(updated.value));
});

router.patch("/students/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateStudentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updated = await studentsCollection.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updated.value) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  res.json(omitMongoId(updated.value));
});

router.delete("/students/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = DeleteStudentParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await studentsCollection.deleteOne({ id: params.data.id });
  res.sendStatus(204);
});

export default router;
