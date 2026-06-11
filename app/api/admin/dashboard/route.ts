import { NextResponse } from "next/server";
import {
  studentsCollection,
  applicationsCollection,
  testsCollection,
  interviewsCollection,
  resultsCollection,
  violationsCollection
} from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalStudents,
      totalApplications,
      totalTests,
      interviewsScheduled,
      passed,
      failed,
      totalViolations,
      blockedStudents,
    ] = await Promise.all([
      studentsCollection.countDocuments(),
      applicationsCollection.countDocuments(),
      testsCollection.countDocuments(),
      interviewsCollection.countDocuments({ status: "scheduled" }),
      resultsCollection.countDocuments({ isPassed: true }),
      resultsCollection.countDocuments({ isPassed: false }),
      violationsCollection.countDocuments(),
      studentsCollection.countDocuments({ isBlocked: true }),
    ]);

    // Aggregate daily registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyRegistrationsRaw = await studentsCollection.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Fill missing days
    const dailyRegistrations = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRegistrationsRaw.find(r => r._id === dateStr);
      dailyRegistrations.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    // Pass/Fail by Program
    const programStatsRaw = await resultsCollection.aggregate([
      {
        $lookup: {
          from: "students",
          let: { sId: "$studentId" },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$_id" }, { $toString: "$$sId" }] } } }
          ],
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $group: {
          _id: { program: "$student.program", isPassed: "$isPassed" },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    const programsMap = new Map<string, { program: string; passed: number; failed: number }>();
    programStatsRaw.forEach(stat => {
      const prog = stat._id.program || "Unknown";
      if (!programsMap.has(prog)) programsMap.set(prog, { program: prog, passed: 0, failed: 0 });
      if (stat._id.isPassed) {
        programsMap.get(prog)!.passed += stat.count;
      } else {
        programsMap.get(prog)!.failed += stat.count;
      }
    });
    const passFailByProgram = Array.from(programsMap.values());

    return NextResponse.json({
      stats: {
        totalStudents,
        totalApplications,
        totalTests,
        interviewsScheduled,
        passed,
        failed,
        totalViolations,
        blockedStudents,
      },
      charts: {
        dailyRegistrations,
        passFailByProgram
      }
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
