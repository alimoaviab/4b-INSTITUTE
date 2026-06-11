import { NextResponse } from "next/server";
import { testsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { testSchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    
    let query: any = {};
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const tests = await testsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(tests);
  } catch (error) {
    console.error("GET Tests Error:", error);
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
    if (body.startTime) body.startTime = new Date(body.startTime);
    if (body.endTime) body.endTime = new Date(body.endTime);
    
    const result = testSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    const insertResult = await testsCollection.insertOne(data);
    return NextResponse.json({ ...data, _id: insertResult.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST Test Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
