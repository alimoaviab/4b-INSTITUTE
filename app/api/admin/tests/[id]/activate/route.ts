import { NextResponse } from "next/server";
import { testsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // First, deactivate ALL tests
    await testsCollection.updateMany(
      {},
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    // Then activate only the selected test
    const result = await testsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { isActive: true, status: "published", updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, test: result });
  } catch (error) {
    console.error("Activate Test Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
