import { NextResponse } from "next/server";
import { interviewsCollection } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await interviewsCollection
      .find({})
      .sort({ scheduleDate: 1 })
      .toArray();

    return NextResponse.json(interviews);
  } catch (error) {
    console.error("GET Interviews Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
