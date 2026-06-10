import { Router, type IRouter } from "express";
import { questionsCollection, getNextId, omitMongoId } from "@workspace/db";
import {
  GetQuestionParams,
  UpdateQuestionParams,
  DeleteQuestionParams,
  BulkImportQuestionsBody,
  ListQuestionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function validateQuestionBody(body: any): { error?: string; data?: any } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  if (!body.testId || typeof body.testId !== "number") return { error: "testId (number) is required" };
  if (!body.questionText || typeof body.questionText !== "string") return { error: "questionText is required" };
  const validTypes = ["mcq", "short", "long", "yes_no"];
  const questionType = body.questionType || "mcq";
  if (!validTypes.includes(questionType)) return { error: "Invalid questionType" };
  return {
    data: {
      testId: body.testId,
      questionType,
      questionText: body.questionText.trim(),
      optionA: body.optionA ?? null,
      optionB: body.optionB ?? null,
      optionC: body.optionC ?? null,
      optionD: body.optionD ?? null,
      correctOption: body.correctOption ?? null,
      marks: typeof body.marks === "number" ? body.marks : 1,
      subject: body.subject || "General",
      orderIndex: typeof body.orderIndex === "number" ? body.orderIndex : 0,
    },
  };
}

function validateUpdateBody(body: any): { error?: string; data?: any } {
  if (!body || typeof body !== "object") return { error: "Invalid body" };
  const update: Record<string, any> = {};
  if (body.questionText !== undefined) update.questionText = body.questionText;
  if (body.questionType !== undefined) update.questionType = body.questionType;
  if (body.subject !== undefined) update.subject = body.subject;
  if (body.marks !== undefined) update.marks = body.marks;
  if (body.optionA !== undefined) update.optionA = body.optionA;
  if (body.optionB !== undefined) update.optionB = body.optionB;
  if (body.optionC !== undefined) update.optionC = body.optionC;
  if (body.optionD !== undefined) update.optionD = body.optionD;
  if (body.correctOption !== undefined) update.correctOption = body.correctOption;
  if (body.orderIndex !== undefined) update.orderIndex = body.orderIndex;
  return { data: update };
}

router.get("/questions", async (req, res): Promise<void> => {
  const params = ListQuestionsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 1000) : 1000;
  const offset = (page - 1) * limit;
  const testId = params.success ? params.data.testId : undefined;
  const subject = params.success ? params.data.subject : undefined;

  const filter: Record<string, unknown> = {};
  if (testId !== undefined) filter.testId = testId;
  if (subject !== undefined) filter.subject = subject;

  const [data, total] = await Promise.all([
    questionsCollection.find(filter).sort({ orderIndex: 1 }).skip(offset).limit(limit).toArray(),
    questionsCollection.countDocuments(filter),
  ]);

  res.json({ data: data.map(omitMongoId), total, page, limit });
});

router.post("/questions/bulk-import", async (req, res): Promise<void> => {
  const parsed = BulkImportQuestionsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let imported = 0;
  const errors: string[] = [];

  for (const q of parsed.data.questions) {
    try {
      const now = new Date();
      const question = {
        id: await getNextId("questions"),
        ...q,
        testId: parsed.data.testId,
        createdAt: now,
        updatedAt: now,
      };
      await questionsCollection.insertOne(question);
      imported++;
    } catch (e) {
      errors.push(`Row ${imported + errors.length + 1}: ${String(e)}`);
    }
  }

  res.json({ imported, failed: errors.length, total: parsed.data.questions.length, errors });
});

router.post("/questions", async (req, res): Promise<void> => {
  const { error, data } = validateQuestionBody(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const now = new Date();
  const question = {
    id: await getNextId("questions"),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await questionsCollection.insertOne(question);
  res.status(201).json(omitMongoId(question));
});

router.get("/questions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetQuestionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const question = await questionsCollection.findOne({ id: params.data.id });
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(omitMongoId(question));
});

router.patch("/questions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateQuestionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { error, data } = validateUpdateBody(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const result = await questionsCollection.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result.value) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  res.json(omitMongoId(result.value));
});

router.delete("/questions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = DeleteQuestionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await questionsCollection.deleteOne({ id: params.data.id });
  res.sendStatus(204);
});

export default router;
