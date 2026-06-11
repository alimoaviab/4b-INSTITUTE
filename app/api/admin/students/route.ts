import { NextResponse } from "next/server";
import { studentsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { studentSchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { rollNumber: { $regex: search, $options: "i" } },
          { cnic: { $regex: search, $options: "i" } }
        ]
      };
    }

    const students = await studentsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(students);
  } catch (error) {
    console.error("GET Students Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = studentSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;

    // Check unique rollNumber and cnic
    const existingStudent = await studentsCollection.findOne({
      $or: [{ rollNumber: data.rollNumber }, { cnic: data.cnic }]
    });

    if (existingStudent) {
      return NextResponse.json({ error: "A student with this Roll Number or CNIC already exists." }, { status: 409 });
    }

    const insertResult = await studentsCollection.insertOne(data);
    return NextResponse.json({ ...data, _id: insertResult.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST Student Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
