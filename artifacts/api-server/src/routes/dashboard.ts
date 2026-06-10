import { Router, type IRouter } from "express";
import {
  studentsCollection,
  applicationsCollection,
  testsCollection,
  resultsCollection,
  interviewsCollection,
  violationsCollection,
  activityLogCollection,
  verificationLogsCollection,
  omitMongoId,
} from "@workspace/db";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [
    totalStudents,
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalTests,
    passed,
    failed,
    interviewsScheduled,
    totalViolations,
    blockedStudents,
    recentVerifications,
  ] = await Promise.all([
    studentsCollection.countDocuments({}),
    applicationsCollection.countDocuments({}),
    applicationsCollection.countDocuments({ status: "pending" }),
    applicationsCollection.countDocuments({ status: "approved" }),
    applicationsCollection.countDocuments({ status: "rejected" }),
    testsCollection.countDocuments({}),
    resultsCollection.countDocuments({ status: "pass" }),
    resultsCollection.countDocuments({ status: "fail" }),
    interviewsCollection.countDocuments({ status: "scheduled" }),
    violationsCollection.countDocuments({}),
    studentsCollection.countDocuments({ isBlocked: true }),
    verificationLogsCollection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
  ]);

  res.json({
    totalStudents,
    totalApplications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    totalTests,
    passed,
    failed,
    interviewsScheduled,
    totalViolations,
    recentVerifications,
    blockedStudents,
  });
});

router.get("/dashboard/registrations-chart", async (_req, res): Promise<void> => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const rows = await studentsCollection.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]).toArray();

  const result: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const found = rows.find((r) => r._id === dateStr);
    result.push({ date: dateStr, count: found ? found.count : 0 });
  }

  res.json(result);
});

router.get("/dashboard/pass-fail-chart", async (_req, res): Promise<void> => {
  const programs = await studentsCollection.distinct<string>("program", {});
  const data = await Promise.all(
    programs.map(async (program) => {
      const studentIds = (
        await studentsCollection.find({ program }).project({ id: 1 }).toArray()
      ).map((s) => s.id);
      if (studentIds.length === 0) return { program, passed: 0, failed: 0 };

      const [passed, failed] = await Promise.all([
        resultsCollection.countDocuments({ studentId: { $in: studentIds }, status: "pass" }),
        resultsCollection.countDocuments({ studentId: { $in: studentIds }, status: "fail" }),
      ]);

      return { program, passed, failed };
    }),
  );

  res.json(data.filter((d) => d.passed + d.failed > 0));
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const params = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = params.success ? (params.data.limit ?? 10) : 10;

  const activities = await activityLogCollection
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  res.json(activities.map(omitMongoId));
});

export default router;
