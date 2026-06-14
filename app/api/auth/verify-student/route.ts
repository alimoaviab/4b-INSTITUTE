import { NextResponse } from "next/server";
import { studentsCollection, resultsCollection } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rollNumber, cnic } = body;

    if (!rollNumber || !cnic) {
      return NextResponse.json(
        { error: "Roll Number and CNIC are required" },
        { status: 400 }
      );
    }

    // Find student by rollNumber and cnic
    const student = await studentsCollection.findOne({
      rollNumber: rollNumber.trim(),
      cnic: cnic.trim(),
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found. Please verify your Roll Number and CNIC or contact the administration." },
        { status: 404 }
      );
    }

    // Check if student is blocked
    if (student.isBlocked) {
      return NextResponse.json(
        { error: "Your account has been blocked. Contact administration." },
        { status: 403 }
      );
    }

    // Create session for existing student
    await createSession({
      id: student._id.toString(),
      role: "student" as const,
      name: student.name || "Student",
      rollNumber: student.rollNumber,
    });
    
    // Check if student has already completed a test
    const existingResult = await resultsCollection.findOne({ studentId: student._id.toString() });

    return NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        rollNumber: student.rollNumber,
        name: student.name,
        isNew: false,
      },
      hasCompletedTest: !!existingResult,
      testScore: existingResult ? existingResult.percentage : null
    });
  } catch (error) {
    console.error("Student verify error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
