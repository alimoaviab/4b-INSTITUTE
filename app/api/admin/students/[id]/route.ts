import { NextResponse } from "next/server";
import { studentsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { studentSchema } from "@/lib/schema";
import { ObjectId } from "mongodb";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await request.json();
    const result = studentSchema.partial().safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const updateData = { ...result.data, updatedAt: new Date() };

    // Prevent duplicate CNIC/Roll Number if they are being updated
    if (updateData.rollNumber || updateData.cnic) {
      const orQuery: any[] = [];
      if (updateData.rollNumber) orQuery.push({ rollNumber: updateData.rollNumber });
      if (updateData.cnic) orQuery.push({ cnic: updateData.cnic });
      
      const existingStudent = await studentsCollection.findOne({
        _id: { $ne: new ObjectId(id) },
        $or: orQuery
      });

      if (existingStudent) {
        return NextResponse.json({ error: "Another student with this Roll Number or CNIC already exists." }, { status: 409 });
      }
    }

    const updateResult = await studentsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updateResult);
  } catch (error) {
    console.error("PUT Student Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const deleteResult = await studentsCollection.deleteOne({ _id: new ObjectId(id) });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
