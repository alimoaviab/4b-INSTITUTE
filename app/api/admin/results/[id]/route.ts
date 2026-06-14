import { NextResponse } from "next/server";
import { resultsCollection, testSessionsCollection, testsCollection, questionsCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await resultsCollection.findOne({ _id: new ObjectId(id) });
    if (!result) return NextResponse.json({ error: "Result not found" }, { status: 404 });

    const attempt = await testSessionsCollection.findOne({ _id: new ObjectId(result.attemptId) });
    const test = await testsCollection.findOne({ _id: new ObjectId(result.testId) });

    if (!test || !attempt) {
       return NextResponse.json({ error: "Missing attempt or test data" }, { status: 404 });
    }

    const questionObjectIds = test.questionIds.map((id: string) => new ObjectId(id));
    const questions = await questionsCollection.find({ _id: { $in: questionObjectIds } }).toArray();

    // Map the questions to include the student's answer
    const detailedAnswers = questions.map(q => {
      const qId = q._id.toString();
      const studentAnsData = attempt.answers?.[qId] || { answer: "Not answered", correct: false, isAnswered: false };
      
      return {
        questionId: qId,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        studentAnswer: studentAnsData.answer || "Not answered",
        isCorrect: studentAnsData.correct,
        marks: q.marks || 1
      };
    });

    return NextResponse.json({
      result,
      attempt,
      detailedAnswers
    });

  } catch (error) {
    console.error("Error fetching detailed result:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
