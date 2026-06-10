import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  useGetStudent, 
  useGetApplicationByStudent, 
  useGetResultByStudent,
  useListInterviews 
} from "@workspace/api-client-react";
import { User, FileText, GraduationCap, Calendar, Download, LogOut, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function StudentDashboard() {
  const [location, setLocation] = useLocation();
  const studentId = localStorage.getItem("student_id");
  const parsedId = parseInt(studentId || "0", 10);

  useEffect(() => {
    if (!studentId) setLocation("/");
  }, [studentId, setLocation]);

  const { data: student } = useGetStudent(parsedId, { query: { queryKey: ["student", parsedId], enabled: !!parsedId } });
  const { data: application } = useGetApplicationByStudent(parsedId, { query: { queryKey: ["application", parsedId], enabled: !!parsedId } });
  const { data: result } = useGetResultByStudent(parsedId, { query: { queryKey: ["result", parsedId], enabled: !!parsedId } });
  
  // Note: Assuming API returns interviews array in data property. We'll filter client side for safety if no studentId param exists
  const { data: interviewsRes } = useListInterviews({}, { query: { queryKey: ["interviews"], enabled: !!parsedId } });
  const interview = interviewsRes?.data?.find(i => i.studentId === parsedId);

  const handleLogout = () => {
    localStorage.removeItem("student_id");
    localStorage.removeItem("session_token");
    setLocation("/");
  };

  if (!student) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading dashboard...</div>;

  const StatusIcon = ({ status }: { status?: string }) => {
    if (status === 'approved' || status === 'pass' || status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'rejected' || status === 'fail') return <XCircle className="w-5 h-5 text-rose-500" />;
    return <Clock className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">Student Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden md:block">{student.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {student.name}</h1>
          <p className="text-slate-500 mt-1">Track your admission progress here.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="col-span-1 md:col-span-1 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg"><User className="mr-2 h-5 w-5 text-primary" /> Profile Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.photoUrl && (
                  <div className="flex justify-center mb-6">
                    <img src={student.photoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                  </div>
                )}
                <div><div className="text-xs text-slate-500">Roll Number</div><div className="font-medium text-slate-900">{student.rollNumber}</div></div>
                <div><div className="text-xs text-slate-500">CNIC</div><div className="font-medium text-slate-900">{student.cnic}</div></div>
                <div><div className="text-xs text-slate-500">Program</div><div className="font-medium text-slate-900">{student.program}</div></div>
                <div><div className="text-xs text-slate-500">Status</div>
                  <Badge variant={student.isBlocked ? "destructive" : "secondary"} className="mt-1">
                    {student.isBlocked ? "Blocked" : "Active"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Section */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            
            {/* 1. Application */}
            <Card className="shadow-sm border-l-4 border-l-blue-500">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-full"><FileText className="h-6 w-6 text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Application Form</h3>
                    <p className="text-slate-500 text-sm">
                      {application ? `Status: ${application.status.toUpperCase()}` : "Not submitted yet"}
                    </p>
                  </div>
                </div>
                <div>
                  {!application ? (
                    <div className="text-sm text-slate-500">Application form is no longer available.</div>
                  ) : (
                    <div className="flex items-center gap-2 font-medium capitalize">
                      <StatusIcon status={application.status} /> {application.status}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Entry Test */}
            <Card className={`shadow-sm border-l-4 ${result ? 'border-l-emerald-500' : 'border-l-indigo-500'}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${result ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                    <GraduationCap className={`h-6 w-6 ${result ? 'text-emerald-600' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Entry Test</h3>
                    <p className="text-slate-500 text-sm">
                      {result 
                        ? `Score: ${result.totalScore}/${result.totalMarks} (${result.percentage.toFixed(1)}%)` 
                        : application?.status === 'approved' 
                          ? "Ready to take test" 
                          : "Requires application approval"}
                    </p>
                  </div>
                </div>
                <div>
                  {!result && application?.status === 'approved' ? (
                    <Button onClick={() => setLocation("/instructions")}>Take Test</Button>
                  ) : result ? (
                    <div className="flex items-center gap-2 font-medium capitalize">
                      <StatusIcon status={result.status} /> {result.status}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200">Locked</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. Interview */}
            <Card className={`shadow-sm border-l-4 ${interview ? 'border-l-amber-500' : 'border-l-slate-200'}`}>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${interview ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <Calendar className={`h-6 w-6 ${interview ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Interview</h3>
                    <p className="text-slate-500 text-sm">
                      {interview 
                        ? `${format(new Date(interview.scheduledAt), 'PPP at p')} • ${interview.venue}` 
                        : "Not scheduled yet"}
                    </p>
                  </div>
                </div>
                <div>
                  {interview ? (
                    <div className="flex items-center gap-2 font-medium capitalize">
                      <StatusIcon status={interview.status} /> {interview.status}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200">Pending</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Download Slip Action */}
            {application?.status === 'approved' && (
              <div className="mt-6 flex justify-end">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Download Admission Slip
                </Button>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}
