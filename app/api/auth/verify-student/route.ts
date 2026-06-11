import { NextResponse } from "next/server";
import { studentsCollection } from "@/lib/db";
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
      // For now, auto-create a student record if not found
      // This allows any student to verify and take the test
      const newStudent = {
        rollNumber: rollNumber.trim(),
        cnic: cnic.trim(),
        name: "Student " + rollNumber.trim(),
        fatherName: "",
        phone: "",
        program: "General",
        isEligible: true,
        isVerified: true,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await studentsCollection.insertOne(newStudent);

      // Create session for new student
      await createSession({
        id: result.insertedId.toString(),
        role: "student" as const,
        name: newStudent.name,
        rollNumber: newStudent.rollNumber,
      });

      return NextResponse.json({
        success: true,
        student: {
          id: result.insertedId.toString(),
          rollNumber: newStudent.rollNumber,
          name: newStudent.name,
          isNew: true,
        },
      });
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

    return NextResponse.json({
      success: true,
      student: {
        id: student._id.toString(),
        rollNumber: student.rollNumber,
        name: student.name,
        isNew: false,
      },
    });
  } catch (error) {
    console.error("Student verify error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
