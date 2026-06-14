import { NextResponse } from "next/server";
import { testsCollection, questionsCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the active test
    const activeTest = await testsCollection.findOne({ status: "published", isActive: true });
    
    if (!activeTest) {
      return NextResponse.json({ error: "No active test found" }, { status: 404 });
    }

    // Fetch the questions associated with the test
    const questionObjectIds = activeTest.questionIds.map((id: string) => new ObjectId(id));
    
    const questions = await questionsCollection.find({ _id: { $in: questionObjectIds } }).toArray();

    // Strip out the correct answers before sending to client
    const safeQuestions = questions.map((q, index) => {
      return {
        id: q._id.toString(),
        number: index + 1,
        text: q.text,
        options: q.options,
        type: q.type,
        marks: q.marks
      };
    });

    return NextResponse.json({
      test: {
        id: activeTest._id.toString(),
        title: activeTest.title,
        durationMinutes: activeTest.durationMinutes,
        totalMarks: activeTest.totalMarks,
      },
      questions: safeQuestions
    });

  } catch (error) {
    console.error("Error fetching test data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
