import { Router, type IRouter } from "express";
import { testsCollection, questionsCollection, getNextId, omitMongoId } from "@workspace/db";
import {
  CreateTestBody,
  UpdateTestBody,
  GetTestParams,
  UpdateTestParams,
  DeleteTestParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tests", async (_req, res): Promise<void> => {
  const tests = await testsCollection.find({}).sort({ createdAt: -1 }).toArray();
  const testsWithCount = await Promise.all(
    tests.map(async (t) => {
      const count = await questionsCollection.countDocuments({ testId: t.id });
      return { ...omitMongoId(t), questionCount: count };
    }),
  );
  res.json(testsWithCount);
});

router.post("/tests", async (req, res): Promise<void> => {
  const parsed = CreateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.isActive) {
    await testsCollection.updateMany({}, { $set: { isActive: false, updatedAt: new Date() } });
  }

  const now = new Date();
  const test = {
    id: await getNextId("tests"),
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  };
  await testsCollection.insertOne(test);

  const count = await questionsCollection.countDocuments({ testId: test.id });
  res.status(201).json({ ...omitMongoId(test), questionCount: count });
});

router.get("/tests/active", async (_req, res): Promise<void> => {
  const test = await testsCollection.findOne({ isActive: true });
  if (!test) {
    res.status(404).json({ error: "No active test found" });
    return;
  }

  const count = await questionsCollection.countDocuments({ testId: test.id });
  res.json({ ...omitMongoId(test), questionCount: count });
});

router.get("/tests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetTestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const test = await testsCollection.findOne({ id: params.data.id });
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const count = await questionsCollection.countDocuments({ testId: test.id });
  res.json({ ...omitMongoId(test), questionCount: count });
});

router.patch("/tests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = UpdateTestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.isActive) {
    await testsCollection.updateMany({}, { $set: { isActive: false, updatedAt: new Date() } });
  }

  const result = await testsCollection.findOneAndUpdate(
    { id: params.data.id },
    { $set: { ...parsed.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!result.value) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const count = await questionsCollection.countDocuments({ testId: result.value.id });
  res.json({ ...omitMongoId(result.value), questionCount: count });
});

router.delete("/tests/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = DeleteTestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await testsCollection.deleteOne({ id: params.data.id });
  res.sendStatus(204);
});

export default router;
