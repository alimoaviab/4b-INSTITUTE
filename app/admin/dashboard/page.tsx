"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FileEdit, GraduationCap, Calendar, AlertTriangle, UserX } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
      });
  }, [router]);

  // Temporary mock data - will be replaced with real API calls
  const stats = {
    totalStudents: 0,
    totalApplications: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    interviewsScheduled: 0,
    totalViolations: 0,
    blockedStudents: 0,
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-500">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: "Total Students", value: stats?.totalStudents || 0, icon: Users, color: "text-blue-600" },
    { title: "Applications", value: stats?.totalApplications || 0, icon: FileText, color: "text-indigo-600" },
    { title: "Total Tests", value: stats?.totalTests || 0, icon: FileEdit, color: "text-purple-600" },
    { title: "Passed", value: stats?.passed || 0, icon: GraduationCap, color: "text-emerald-600" },
    { title: "Failed", value: stats?.failed || 0, icon: AlertTriangle, color: "text-rose-600" },
    { title: "Interviews", value: stats?.interviewsScheduled || 0, icon: Calendar, color: "text-amber-600" },
    { title: "Violations", value: stats?.totalViolations || 0, icon: AlertTriangle, color: "text-red-600" },
    { title: "Blocked", value: stats?.blockedStudents || 0, icon: UserX, color: "text-slate-600" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of admission and testing metrics.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {statCards.map((stat, i) => (
            <Card key={i} className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Daily Registrations</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chart will be displayed here
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Pass/Fail by Program</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-slate-500 py-4">No recent activity</div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
