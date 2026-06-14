import { NextResponse } from "next/server";
import { resultsCollection, testSessionsCollection, studentsCollection, testsCollection } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    // For simplicity, just fetching all results. 
    // In a production app, we would add pagination and aggregation.
    
    // Aggregate results with student details and test details
    const pipeline = [
      {
        $lookup: {
          from: "students",
          let: { studentIdObj: { $toObjectId: "$studentId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$studentIdObj"] } } }
          ],
          as: "student"
        }
      },
      {
        $unwind: { path: "$student", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "tests",
          let: { testIdObj: { $toObjectId: "$testId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$testIdObj"] } } }
          ],
          as: "test"
        }
      },
      {
        $unwind: { path: "$test", preserveNullAndEmptyArrays: true }
      },
      {
        $lookup: {
          from: "test_sessions",
          let: { attemptIdObj: { $toObjectId: "$attemptId" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$attemptIdObj"] } } }
          ],
          as: "attempt"
        }
      },
      {
        $unwind: { path: "$attempt", preserveNullAndEmptyArrays: true }
      },
      {
        $sort: { createdAt: -1 }
      }
    ];

    const results = await resultsCollection.aggregate(pipeline).toArray();

    // Filter by search if provided (name, rollNumber)
    let filteredResults = results;
    if (search) {
      const s = search.toLowerCase();
      filteredResults = results.filter(r => 
        (r.student?.name?.toLowerCase().includes(s)) ||
        (r.student?.rollNumber?.toLowerCase().includes(s))
      );
    }

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
