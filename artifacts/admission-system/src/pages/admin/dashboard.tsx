import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useGetRegistrationsChart, useGetPassFailChart, useGetRecentActivity } from "@workspace/api-client-react";
import { Users, FileText, FileEdit, GraduationCap, Calendar, AlertTriangle, UserX } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: regChart } = useGetRegistrationsChart();
  const { data: passFailChart } = useGetPassFailChart();
  const { data: recentActivity } = useGetRecentActivity({ limit: 10 });

  if (statsLoading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
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
            {regChart && regChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={regChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#1e40af" strokeWidth={3} dot={{ r: 4, fill: '#1e40af', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pass/Fail by Program</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {passFailChart && passFailChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={passFailChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="program" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f1f5f9' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="passed" name="Passed" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 text-sm">
                  <div className="mt-0.5 bg-slate-100 p-2 rounded-full text-slate-500">
                    <ActivityIcon type={activity.type} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-slate-900">
                      {activity.studentName ? <span className="font-medium mr-1">{activity.studentName}</span> : null}
                      {activity.description}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-slate-500 py-4">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'registration': return <Users className="h-4 w-4" />;
    case 'application_submitted': return <FileText className="h-4 w-4" />;
    case 'test_completed': return <FileEdit className="h-4 w-4" />;
    case 'violation_reported': return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    default: return <Calendar className="h-4 w-4" />;
  }
}
