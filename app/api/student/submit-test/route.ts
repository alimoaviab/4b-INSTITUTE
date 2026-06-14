import { NextResponse } from "next/server";
import { 
  testsCollection, 
  questionsCollection, 
  testSessionsCollection, 
  resultsCollection, 
  studentsCollection 
} from "@/lib/db";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = session.id;
    const body = await request.json();
    const { testId, answers, autoSubmit, violations } = body;

    if (!testId || !answers) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Check if test exists
    const test = await testsCollection.findOne({ _id: new ObjectId(testId) });
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Prevent multiple submissions
    const existingResult = await resultsCollection.findOne({ 
      studentId, 
      testId 
    });
    
    if (existingResult) {
      return NextResponse.json({ error: "You have already submitted this test" }, { status: 400 });
    }

    // Fetch correct answers for questions
    const questionObjectIds = test.questionIds.map((id: string) => new ObjectId(id));
    const questions = await questionsCollection.find({ _id: { $in: questionObjectIds } }).toArray();

    let obtainedMarks = 0;
    const evaluatedAnswers: Record<string, { answer: string, correct: boolean, isAnswered: boolean }> = {};

    questions.forEach(q => {
      const qIdStr = q._id.toString();
      // The frontend uses question index (1-based) as keys, let's map it. 
      // Actually, frontend used 1,2,3 for keys. But we should map frontend answers to actual questions.
      // Wait, in the updated frontend, we will map question IDs to answers to be safe.
      
      const studentAnswer = answers[qIdStr] || "";
      let correct = false;

      if (studentAnswer && studentAnswer === q.correctAnswer) {
        correct = true;
        obtainedMarks += q.marks || 1;
      }

      evaluatedAnswers[qIdStr] = {
        answer: studentAnswer,
        correct,
        isAnswered: !!studentAnswer
      };
    });

    // Save test session / attempt
    const attempt = {
      testId,
      studentId,
      status: autoSubmit ? "auto_submitted" : "submitted",
      startTime: new Date(), // Should track real start time, but using now for simplicity
      endTime: new Date(),
      answers: evaluatedAnswers,
      score: obtainedMarks,
      isPassed: obtainedMarks >= test.passingMarks,
      cheatingFlags: violations ? violations.length : 0,
      violations: violations || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const attemptResult = await testSessionsCollection.insertOne(attempt);

    // Save Result
    const percentage = test.totalMarks > 0 ? (obtainedMarks / test.totalMarks) * 100 : 0;
    
    const resultDoc = {
      studentId,
      testId,
      attemptId: attemptResult.insertedId.toString(),
      totalMarks: test.totalMarks,
      obtainedMarks,
      percentage,
      isPassed: obtainedMarks >= test.passingMarks,
      createdAt: new Date()
    };

    await resultsCollection.insertOne(resultDoc);

    return NextResponse.json({
      success: true,
      score: obtainedMarks,
      isPassed: resultDoc.isPassed,
      percentage
    });

  } catch (error) {
    console.error("Error submitting test:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
