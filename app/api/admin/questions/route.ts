import { NextResponse } from "next/server";
import { questionsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { questionSchema } from "@/lib/schema";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    
    let query: any = {};
    if (search) {
      query.text = { $regex: search, $options: "i" };
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const questions = await questionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(questions);
  } catch (error) {
    console.error("GET Questions Error:", error);
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
    const result = questionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    const insertResult = await questionsCollection.insertOne(data);
    return NextResponse.json({ ...data, _id: insertResult.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST Question Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
