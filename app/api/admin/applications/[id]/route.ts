import { NextResponse } from "next/server";
import { applicationsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
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
    const allowedUpdates: any = {};
    
    if (body.status) allowedUpdates.status = body.status;
    if (body.adminNotes !== undefined) allowedUpdates.adminNotes = body.adminNotes;
    
    allowedUpdates.updatedAt = new Date();

    const updateResult = await applicationsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: allowedUpdates },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(updateResult);
  } catch (error) {
    console.error("PUT Application Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
