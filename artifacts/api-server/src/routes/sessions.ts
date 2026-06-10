import { Router, type IRouter } from "express";
import {
  testSessionsCollection,
  questionsCollection,
  answersCollection,
  resultsCollection,
  testsCollection,
  studentsCollection,
  activityLogCollection,
  getNextId,
  omitMongoId,
} from "@workspace/db";
import {
  StartTestSessionBody,
  GetSessionParams,
  SaveAnswerParams,
  SaveAnswerBody,
  SubmitTestParams,
  SubmitTestBody,
  ListSessionsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const params = ListSessionsQueryParams.safeParse(req.query);
  const studentId = params.success ? params.data.studentId : undefined;
  const status = params.success ? params.data.status : undefined;

  const filter: Record<string, unknown> = {};
  if (studentId) filter.studentId = studentId;
  if (status) filter.status = status;

  const sessions = await testSessionsCollection.find(filter).sort({ startedAt: -1 }).toArray();
  res.json(sessions.map(omitMongoId));
});

router.post("/sessions", async (req, res): Promise<void> => {
  const parsed = StartTestSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { studentId, testId } = parsed.data;

  const existing = await testSessionsCollection.findOne({ studentId, status: "active" });
  if (existing) {
    const questions = await questionsCollection.find({ testId: existing.testId }).sort({ orderIndex: 1 }).toArray();
    const answers = await answersCollection.find({ sessionId: existing.id }).toArray();
    const test = await testsCollection.findOne({ id: existing.testId });
    const count = await questionsCollection.countDocuments({ testId: existing.testId });

    res.json({
      ...omitMongoId(existing),
      test: { ...omitMongoId(test), questionCount: count },
      questions: questions.map(omitMongoId),
      answers: answers.map(omitMongoId),
    });
    return;
  }

  const test = await testsCollection.findOne({ id: testId });
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const now = new Date();
  const session = {
    id: await getNextId("test_sessions"),
    studentId,
    testId,
    status: "active",
    startedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  await testSessionsCollection.insertOne(session);
  const questions = await questionsCollection.find({ testId }).sort({ orderIndex: 1 }).toArray();
  const questionCount = await questionsCollection.countDocuments({ testId });

  const student = await studentsCollection.findOne({ id: studentId });
  await activityLogCollection.insertOne({
    id: await getNextId("activity_log"),
    type: "test_started",
    description: `${student?.name ?? "Student"} started the entry test`,
    studentName: student?.name ?? null,
    studentId,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json({
    ...omitMongoId(session),
    test: { ...omitMongoId(test), questionCount },
    questions: questions.map(omitMongoId),
    answers: [],
  });
});

router.get("/sessions/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = GetSessionParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const session = await testSessionsCollection.findOne({ id: params.data.id });
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const test = await testsCollection.findOne({ id: session.testId });
  const questions = await questionsCollection.find({ testId: session.testId }).sort({ orderIndex: 1 }).toArray();
  const answers = await answersCollection.find({ sessionId: session.id }).toArray();
  const questionCount = await questionsCollection.countDocuments({ testId: session.testId });

  res.json({
    ...omitMongoId(session),
    test: test ? { ...omitMongoId(test), questionCount } : null,
    questions: questions.map(omitMongoId),
    answers: answers.map(omitMongoId),
  });
});

router.post("/sessions/:id/answer", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = SaveAnswerParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SaveAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const question = await questionsCollection.findOne({ id: parsed.data.questionId });
  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const isCorrect = question.correctOption === parsed.data.selectedOption;
  const existing = await answersCollection.findOne({ sessionId: params.data.id, questionId: parsed.data.questionId });

  if (existing) {
    const result = await answersCollection.findOneAndUpdate(
      { id: existing.id },
      {
        $set: {
          selectedOption: parsed.data.selectedOption,
          isCorrect,
          markedForReview: parsed.data.markedForReview ?? existing.markedForReview,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    res.json(omitMongoId(result.value));
  } else {
    const now = new Date();
    const answer = {
      id: await getNextId("answers"),
      sessionId: params.data.id,
      questionId: parsed.data.questionId,
      selectedOption: parsed.data.selectedOption,
      isCorrect,
      markedForReview: parsed.data.markedForReview ?? false,
      createdAt: now,
      updatedAt: now,
    };
    await answersCollection.insertOne(answer);
    res.json(omitMongoId(answer));
  }
});

router.post("/sessions/:id/submit", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params["id"]) ? req.params["id"][0] : req.params["id"];
  const params = SubmitTestParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = SubmitTestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const session = await testSessionsCollection.findOne({ id: params.data.id });
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  if (session.status !== "active") {
    res.status(400).json({ error: "Session already submitted" });
    return;
  }

  const test = await testsCollection.findOne({ id: session.testId });
  if (!test) {
    res.status(404).json({ error: "Test not found" });
    return;
  }

  const answers = await answersCollection.find({ sessionId: session.id }).toArray();
  const questions = await questionsCollection.find({ testId: session.testId }).toArray();
  const correctAnswers = answers.filter((a) => a.isCorrect);

  const totalScore = correctAnswers.reduce((sum, a) => {
    const q = questions.find((q) => q.id === a.questionId);
    return sum + (q?.marks ?? 1);
  }, 0);

  const percentage = test.totalMarks > 0 ? (totalScore / test.totalMarks) * 100 : 0;
  const status = totalScore >= test.passingMarks ? "pass" : "fail";

  const sessionUpdate = await testSessionsCollection.findOneAndUpdate(
    { id: session.id },
    {
      $set: {
        status: parsed.data.autoSubmit ? "timed_out" : "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  const existingResult = await resultsCollection.findOne({ sessionId: session.id });
  let result;
  if (existingResult) {
    const updatedResult = await resultsCollection.findOneAndUpdate(
      { id: existingResult.id },
      {
        $set: { totalScore, percentage, status, updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );
    result = updatedResult.value;
  } else {
    const now = new Date();
    const newResult = {
      id: await getNextId("results"),
      sessionId: session.id,
      studentId: session.studentId,
      testId: session.testId,
      totalScore,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      percentage,
      status,
      createdAt: now,
      updatedAt: now,
    };
    await resultsCollection.insertOne(newResult);
    result = newResult;
  }

  const student = await studentsCollection.findOne({ id: session.studentId });
  await activityLogCollection.insertOne({
    id: await getNextId("activity_log"),
    type: `test_${status}`,
    description: `${student?.name ?? "Student"} scored ${totalScore}/${test.totalMarks} (${percentage.toFixed(1)}%) - ${status.toUpperCase()}`,
    studentName: student?.name ?? null,
    studentId: session.studentId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const student2 = await studentsCollection.findOne({ id: result.studentId });
  res.json({
    ...omitMongoId(result),
    studentName: student2?.name ?? null,
    rollNumber: student2?.rollNumber ?? null,
  });
});

export default router;
